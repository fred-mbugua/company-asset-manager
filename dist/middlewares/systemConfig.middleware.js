"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.systemConfigMiddleware = systemConfigMiddleware;
const systemConfiguration_service_1 = __importDefault(require("../services/systemConfiguration.service"));
/**
 * Middleware to inject system configuration into all views
 */
async function systemConfigMiddleware(req, res, next) {
    try {
        // Get public configuration (without sensitive data)
        const systemConfig = await systemConfiguration_service_1.default.getPublicConfig();
        // Make it available to all views
        res.locals.systemConfig = systemConfig;
        next();
    }
    catch (error) {
        console.error('Error loading system configuration:', error);
        // Continue even if config fails to load, with defaults
        res.locals.systemConfig = {
            app_name: 'Asset Management System',
            company_logo_url: null
        };
        next();
    }
}
