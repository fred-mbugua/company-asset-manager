import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types';
import SystemConfigurationService from '../services/systemConfiguration.service';
import StorageService from '../utils/storage';
import { successResponse, errorResponse } from '../utils/response';
import logger from '../utils/logger';

export class SystemConfigurationController {
    async getConfig(req: Request, res: Response) {
        try {
            const config = await SystemConfigurationService.getConfig();
            successResponse(res, 200, 'Configuration retrieved successfully', config);
        } catch (error: any) {
            logger.error('Failed to get configuration:', error);
            errorResponse(res, 500, 'Failed to retrieve configuration');
        }
    }

    async getPublicConfig(req: Request, res: Response) {
        try {
            const config = await SystemConfigurationService.getPublicConfig();
            successResponse(res, 200, 'Public configuration retrieved successfully', config);
        } catch (error: any) {
            logger.error('Failed to get public configuration:', error);
            errorResponse(res, 500, 'Failed to retrieve public configuration');
        }
    }

    async updateConfig(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return errorResponse(res, 401, 'Unauthorized');
            }

            const updatedConfig = await SystemConfigurationService.updateConfig(req.body, userId);
            successResponse(res, 200, 'Configuration updated successfully', updatedConfig);
        } catch (error: any) {
            logger.error('Failed to update configuration:', error);
            errorResponse(res, 400, error.message || 'Failed to update configuration');
        }
    }

    async uploadLogo(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return errorResponse(res, 401, 'Unauthorized');
            }

            if (!req.file) {
                return errorResponse(res, 400, 'No file uploaded');
            }

            // Get storage configuration
            const storageConfig = await SystemConfigurationService.getStorageConfig();

            // Upload logo
            const uploadResult = await StorageService.upload(req.file, 'logos', storageConfig);

            // Update configuration with logo URL
            const updatedConfig = await SystemConfigurationService.updateConfig(
                { company_logo_url: uploadResult.filePath },
                userId
            );

            successResponse(res, 200, 'Logo uploaded successfully', {
                logo_url: uploadResult.filePath,
                config: updatedConfig
            });
        } catch (error: any) {
            logger.error('Failed to upload logo:', error);
            errorResponse(res, 500, 'Failed to upload logo');
        }
    }
}

export default new SystemConfigurationController();
