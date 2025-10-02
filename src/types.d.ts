// import { Request } from 'express';
// import { JwtPayload } from 'jsonwebtoken';

// export interface AuthenticatedRequest extends Request {
//     user?: {
//         role: string;
//         id: string;
//         email: string;
//         [key: string]: any;
//     } | JwtPayload;
// }

// declare global {
//     namespace Express {
//         interface Request {
//             user?: {
//                 role: string;
//                 id: string;
//                 email: string;
//                 [key: string]: any;
//             } | JwtPayload;
//         }
//     }
// }

import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { Session, SessionData } from 'express-session'; // Import necessary types

// 1. Extend the Express Session interface to include custom session data if needed
// If you're only using 'returnTo', you can declare it here.
declare module 'express-session' {
    interface SessionData {
        returnTo?: string; // Add your custom property to the session data
    }
}

// 2. Define the custom AuthenticatedRequest interface
export interface AuthenticatedRequest extends Request {
    user?: {
        role: string;
        id: number; // Changed from 'string' to 'number' to align with typical database IDs
        email: string;
        [key: string]: any;
    } | JwtPayload;
    // The session property is now implicitly included via the global namespace declaration below
    // but you can be explicit if you prefer:
    session: Session & Partial<SessionData>& {
         // You can add your custom session properties here
         returnTo?: string; 
    };
    // If your Express version is older or you haven't explicitly typed sessions:
    // session: any;  
}

// 3. Extend the global Express Request interface
declare global {
    namespace Express {
        interface Request {
            // Include your custom 'user' property
            user?: {
                role: string;
                id: number;
                email: string;
                [key: string]: any;
            } | JwtPayload;
            
            // The session property is now correctly defined by extending 'express-session' 
            // and the base Request object. You don't usually need to redefine it here 
            // if you follow step 1, but keeping the user definition is crucial.
        }
    }
}