import { Request, Response, NextFunction } from 'express';
import SystemConfigurationService from '../services/systemConfiguration.service';

/**
 * Middleware to inject system configuration into all views
 */
export async function systemConfigMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
        // Get public configuration (without sensitive data)
        const systemConfig = await SystemConfigurationService.getPublicConfig();
        
        // Make it available to all views
        res.locals.systemConfig = systemConfig;
        
        next();
    } catch (error) {
        console.error('Error loading system configuration:', error);
        // Continue even if config fails to load, with defaults
        res.locals.systemConfig = {
            app_name: 'Asset Management System',
            company_logo_url: null
        };
        next();
    }
}
