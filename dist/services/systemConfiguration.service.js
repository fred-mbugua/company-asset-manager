"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const systemConfiguration_model_1 = __importDefault(require("../models/systemConfiguration.model"));
const actionLog_service_1 = __importDefault(require("./actionLog.service"));
const logger_1 = __importDefault(require("../utils/logger"));
class SystemConfigurationService {
    async getConfig() {
        try {
            return await systemConfiguration_model_1.default.get();
        }
        catch (error) {
            logger_1.default.error('Error fetching system configuration:', error);
            throw new Error('Failed to fetch system configuration');
        }
    }
    async getPublicConfig() {
        try {
            return await systemConfiguration_model_1.default.getPublicConfig();
        }
        catch (error) {
            logger_1.default.error('Error fetching public configuration:', error);
            throw new Error('Failed to fetch public configuration');
        }
    }
    async updateConfig(configData, userId) {
        try {
            const oldConfig = await systemConfiguration_model_1.default.get();
            const updatedConfig = await systemConfiguration_model_1.default.update(configData);
            await actionLog_service_1.default.logAction(userId, 'UPDATE', 'SystemConfiguration', updatedConfig.id, {
                old_data: oldConfig,
                new_data: updatedConfig,
                changes: configData
            });
            return updatedConfig;
        }
        catch (error) {
            logger_1.default.error('Error updating system configuration:', error);
            throw new Error('Failed to update system configuration');
        }
    }
    async getStorageConfig() {
        try {
            const config = await systemConfiguration_model_1.default.get();
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
        }
        catch (error) {
            logger_1.default.error('Error fetching storage configuration:', error);
            throw new Error('Failed to fetch storage configuration');
        }
    }
}
exports.default = new SystemConfigurationService();
