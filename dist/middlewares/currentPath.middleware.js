"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.currentPathMiddleware = void 0;
/**
 * Middleware to inject the current request path into res.locals
 * This makes the currentPath available to all EJS templates
 */
const currentPathMiddleware = (req, res, next) => {
    res.locals.currentPath = req.path;
    next();
};
exports.currentPathMiddleware = currentPathMiddleware;
