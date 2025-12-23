import SystemConfigurationModel, { SystemConfigurationUpdate } from '../models/systemConfiguration.model';
import ActionLogService from './actionLog.service';
import logger from '../utils/logger';

class SystemConfigurationService {
    async getConfig() {
        try {
            return await SystemConfigurationModel.get();
        } catch (error) {
            logger.error('Error fetching system configuration:', error);
            throw new Error('Failed to fetch system configuration');
        }
    }

    async getPublicConfig() {
        try {
            return await SystemConfigurationModel.getPublicConfig();
        } catch (error) {
            logger.error('Error fetching public configuration:', error);
            throw new Error('Failed to fetch public configuration');
        }
    }

    async updateConfig(configData: SystemConfigurationUpdate, userId: number) {
        try {
            const oldConfig = await SystemConfigurationModel.get();
            const updatedConfig = await SystemConfigurationModel.update(configData);

            await ActionLogService.logAction(
                userId,
                'UPDATE',
                'SystemConfiguration',
                updatedConfig.id,
                {
                    old_data: oldConfig,
                    new_data: updatedConfig,
                    changes: configData
                }
            );

            return updatedConfig;
        } catch (error) {
            logger.error('Error updating system configuration:', error);
            throw new Error('Failed to update system configuration');
        }
    }

    async getStorageConfig(): Promise<{ type: 'server' | 'firebase'; firebaseConfig?: { apiKey: string | null; authDomain: string | null; projectId: string | null; storageBucket: string | null; messagingSenderId: string | null; appId: string | null; } }> {
        try {
            const config = await SystemConfigurationModel.get();
            return {
                type: config.storage_type,
                firebaseConfig: config.storage_type === 'firebase' ? {
                    apiKey: config.firebase_api_key,
                    authDomain: config.firebase_auth_domain,
                    projectId: config.firebase_project_id,
                    storageBucket: config.firebase_storage_bucket,
                    messagingSenderId: config.firebase_messaging_sender_id,
                    appId: config.firebase_app_id
                } : undefined
            };
        } catch (error) {
            logger.error('Error fetching storage configuration:', error);
            throw new Error('Failed to fetch storage configuration');
        }
    }
}

export default new SystemConfigurationService();
