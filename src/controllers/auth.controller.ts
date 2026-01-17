import { Request, Response } from 'express';
import { AuthService } from '../services';
import { successResponse, errorResponse } from '../utils/response';
import { AuthenticatedRequest } from '../types';
import logger from '../utils/logger'; // Import the logger

class AuthController {

    async register(req: Request, res: Response) {
        logger.info('Received request to register a new user.');
        const userId = req.user?.id;
        try {
            const newUser = await AuthService.registerUser(req.body, userId);
            logger.info(`New user registered successfully with email: ${newUser.email}`);
            successResponse(res, 201, 'User registered successfully', newUser);
        } catch (error: any) {
            logger.error('Failed to register user:', error);
            errorResponse(res, 400, (error as Error).message);
        }
    }


    async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;
            const { accessToken, refreshToken, user } = await AuthService.login({email, password});

            if (!user) {
                logger.warn(`Login failed: User not found for email ${email}`);
                return errorResponse(res, 401, 'Invalid email or password');
            }
            
            // Check if the request is actually using HTTPS (either directly or via proxy)
            const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';
            
            res.cookie('accessToken', accessToken, {
                httpOnly: true,
                secure: isSecure,
                sameSite: isSecure ? 'strict' : 'lax',
                maxAge: 30 * 60 * 1000
            });

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: isSecure,
                sameSite: isSecure ? 'strict' : 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });

            // Get the returnTo URL from session and clear it
            const returnTo = (req.session as any).returnTo || '/dashboard';
            delete (req.session as any).returnTo;

            logger.info(`User logged in successfully: ${user.email}`);
            successResponse(res, 200, 'Logged in successfully', { user , accessToken, refreshToken, returnTo });
        } catch (error) {
            logger.error(`Login failed: ${(error as Error).message}`, { email: req.body.email, error });
            errorResponse(res, 401, (error as Error).message);
        }
    }

    async logout(req: AuthenticatedRequest, res: Response) {
        // Check if the request is actually using HTTPS (either directly or via proxy)
        const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';
        
        res.clearCookie('accessToken', {
            httpOnly: true,
            secure: isSecure,
            sameSite: isSecure ? 'strict' : 'lax'
        });
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: isSecure,
            sameSite: isSecure ? 'strict' : 'lax'
        });
        logger.info('User logged out successfully');
        successResponse(res, 200, 'Logged out successfully');
    }

    async refresh(req: AuthenticatedRequest, res: Response) {
        try {
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken) {
                logger.warn('Token refresh failed: No refresh token found in cookies');
                return errorResponse(res, 401, 'Refresh token not found');
            }

            const { accessToken, newRefreshToken } = await AuthService.refresh(refreshToken);

            // Check if the request is actually using HTTPS (either directly or via proxy)
            const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';

            res.cookie('accessToken', accessToken, {
                httpOnly: true,
                secure: isSecure,
                sameSite: isSecure ? 'strict' : 'lax',
                maxAge: 30 * 60 * 1000
            });

            res.cookie('refreshToken', newRefreshToken, {
                httpOnly: true,
                secure: isSecure,
                sameSite: isSecure ? 'strict' : 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });

            // logger.info('Access token refreshed successfully');
            successResponse(res, 200, 'Token refreshed successfully');
        } catch (error) {
            logger.error(`Token refresh failed: ${(error as Error).message}`, { error });
            errorResponse(res, 401, (error as Error).message);
        }
    }

    async getAllUserRoles(req: Request, res: Response) {
        try {
            const roles = await AuthService.getAllUserRoles();
            successResponse(res, 200, 'All user roles fetched successfully', { roles });
        } catch (error) {
            logger.error(`Fetching all user roles failed: ${(error as Error).message}`, { error });
            errorResponse(res, 500, (error as Error).message);
        }
    }
    
}

export default new AuthController();