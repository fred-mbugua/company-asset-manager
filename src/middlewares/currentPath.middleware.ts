import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to inject the current request path into res.locals
 * This makes the currentPath available to all EJS templates
 */
export const currentPathMiddleware = (req: Request, res: Response, next: NextFunction) => {
    res.locals.currentPath = req.path;
    next();
};
