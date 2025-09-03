import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
    user?: {
        role: string;
        id: string;
        email: string;
        [key: string]: any;
    } | JwtPayload;
}

declare global {
    namespace Express {
        interface Request {
            user?: {
                role: string;
                id: string;
                email: string;
                [key: string]: any;
            } | JwtPayload;
        }
    }
}