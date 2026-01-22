// import { Request, Response, NextFunction } from 'express';
// import jwt from 'jsonwebtoken';
// import { JWT_ACCESS_SECRET_KEY } from '../config';
// import { AuthenticatedRequest } from '../types';

// export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
//   const token = req.headers.authorization?.split(' ')[1];

//   if (!token) {
//     return res.status(401).json({ message: 'Authentication token missing' });
//   }

//   try {
//     const decoded = jwt.verify(token, JWT_ACCESS_SECRET_KEY);
//     // console.log('Decoded token:', decoded);
//     if (typeof decoded === 'string') {
//       return res.status(401).json({ message: 'Invalid token payload' });
//     }
//     req.user = decoded;
//     next();
//   } catch (error) {
//     res.status(401).json({ message: 'Invalid or expired token' });
//   }
// };

// export const authorize = (roles: string[]) => {
//   return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
//     // console.log('User role:', req.user);
//     if (!req.user || !roles.includes(req.user.role)) {
//       return res.status(403).json({ message: 'Forbidden' });
//     }
//     next();
//   };
// };

// src/middleware/auth.middleware.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_ACCESS_SECRET_KEY } from '../config';
import { AuthenticatedRequest } from '../types';
import AuthService from '../services/auth.service';

const ACCESS_SECRET = JWT_ACCESS_SECRET_KEY;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET_KEY || 'assetManager@2025'; // Ensure this is correctly imported/defined in environment file

/**
 * Helper function to handle unauthenticated requests.
 * Returns 401 JSON for API requests, redirects to login for page requests.
 */
const handleUnauthenticated = (req: AuthenticatedRequest, res: Response, message: string = 'Session expired. Please login again.') => {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    
    // Check if this is an API request
    if (req.originalUrl.startsWith('/api')) {
        return res.status(401).json({ 
            success: false, 
            message: message,
            sessionExpired: true 
        });
    }
    
    // For page requests, store the original URL and redirect to login
    (req.session as any).returnTo = req.originalUrl;
    return res.redirect('/login');
};

/**
 * Middleware to authenticate user using JWT tokens stored in cookies.
 * Handles access token expiry by attempting to use the refresh token.
 * Returns 401 JSON for API requests, redirects to login for page requests.
 */
export const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // Checking for tokens in HTTP-only cookies
    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;

    if (req.path.includes('/login') || req.path.includes('/register')) {
        return next();
    }
    
    // If no tokens, handle unauthenticated request
    if (!accessToken && !refreshToken) {
        return handleUnauthenticated(req, res, 'No authentication token found. Please login.');
    }

    // Trying to verify Access Token
    if (accessToken) {
        try {
            const decoded = jwt.verify(accessToken, ACCESS_SECRET) as jwt.JwtPayload;
            req.user = decoded; // User is authenticated
            return next();
        } catch (accessError) {
            // console.log('Access token verification failed:', accessError);
            // Access token expired or invalid. Continue to refresh flow.
        }
    }

    //Trying to use Refresh Token
    if (refreshToken) {
        try {
        
            const { accessToken: newAccessToken } = await AuthService.refresh(refreshToken);
            
            // Check if the request is actually using HTTPS (either directly or via proxy)
            const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';
            
            // Setting the new Access Token in a cookie
            res.cookie('accessToken', newAccessToken, {
                httpOnly: true,
                secure: isSecure,
                sameSite: isSecure ? 'strict' : 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days (match token lifetime)
            });

            // Decode the new token to get user info
            const decoded = jwt.verify(newAccessToken, ACCESS_SECRET) as jwt.JwtPayload;
            req.user = decoded;
            
            return next();
        } catch (refreshError) {
            // Refresh token failed (expired, tampered, or not in DB).
            return handleUnauthenticated(req, res, 'Session expired. Please login again.');
        }
    }

    // Fallback if somehow tokens existed but both checks failed
    return handleUnauthenticated(req, res, 'Authentication failed. Please login again.');
};

/**
 * Check req.user.role
 * which is populated by the authenticate middleware.
 * Supports '*' wildcard to allow any authenticated user.
 */
export const authorize = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // '*' means any authenticated user is allowed
    if (roles.includes('*')) {
      if (req.user) {
        return next();
      }
    }
    
    if (!req.user || !roles.includes(req.user.role)) {
      // For API requests, return 403 JSON
      if (req.originalUrl.startsWith('/api')) {
        return res.status(403).json({ success: false, message: 'Forbidden: Insufficient privileges.' });
      }
      // For frontend pages, redirect to an error page or dashboard
      return res.redirect('/login'); 
    }
    next();
  };
};