import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';

declare module 'express' {
    // Define a new interface that extends Express's Request
    // This allows one to add a custom property (like 'user')
    // and then use this new, more specific type throughout the application.
    export interface AuthenticatedRequest extends Request {
    user?: string | JwtPayload;
    }
}