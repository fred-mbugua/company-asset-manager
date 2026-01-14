"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemConfigurationController = void 0;
const systemConfiguration_service_1 = __importDefault(require("../services/systemConfiguration.service"));
const storage_1 = __importDefault(require("../utils/storage"));
const email_service_1 = __importDefault(require("../services/email.service"));
const response_1 = require("../utils/response");
const logger_1 = __importDefault(require("../utils/logger"));
class SystemConfigurationController {
    async getConfig(req, res) {
        try {
            const config = await systemConfiguration_service_1.default.getConfig();
            (0, response_1.successResponse)(res, 200, 'Configuration retrieved successfully', config);
        }
        catch (error) {
            logger_1.default.error('Failed to get configuration:', error);
            (0, response_1.errorResponse)(res, 500, 'Failed to retrieve configuration');
        }
    }
    async getPublicConfig(req, res) {
        try {
            const config = await systemConfiguration_service_1.default.getPublicConfig();
            (0, response_1.successResponse)(res, 200, 'Public configuration retrieved successfully', config);
        }
        catch (error) {
            logger_1.default.error('Failed to get public configuration:', error);
            (0, response_1.errorResponse)(res, 500, 'Failed to retrieve public configuration');
        }
    }
    async updateConfig(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                return (0, response_1.errorResponse)(res, 401, 'Unauthorized');
            }
            const updatedConfig = await systemConfiguration_service_1.default.updateConfig(req.body, userId);
            (0, response_1.successResponse)(res, 200, 'Configuration updated successfully', updatedConfig);
        }
        catch (error) {
            logger_1.default.error('Failed to update configuration:', error);
            (0, response_1.errorResponse)(res, 400, error.message || 'Failed to update configuration');
        }
    }
    async uploadLogo(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                return (0, response_1.errorResponse)(res, 401, 'Unauthorized');
            }
            if (!req.file) {
                return (0, response_1.errorResponse)(res, 400, 'No file uploaded');
            }
            // Get storage configuration
            const storageConfig = await systemConfiguration_service_1.default.getStorageConfig();
            // Upload logo
            const uploadResult = await storage_1.default.upload(req.file, 'logos', storageConfig);
            // Update configuration with logo URL
            const updatedConfig = await systemConfiguration_service_1.default.updateConfig({ company_logo_url: uploadResult.filePath }, userId);
            (0, response_1.successResponse)(res, 200, 'Logo uploaded successfully', {
                logo_url: uploadResult.filePath,
                config: updatedConfig
            });
        }
        catch (error) {
            logger_1.default.error('Failed to upload logo:', error);
            (0, response_1.errorResponse)(res, 500, 'Failed to upload logo');
        }
    }
    async sendTestEmail(req, res) {
        try {
            const { email } = req.body;
            if (!email) {
                return (0, response_1.errorResponse)(res, 400, 'Email address is required');
            }
            // Get SMTP configuration
            const config = await systemConfiguration_service_1.default.getConfig();
            if (!config.smtp_host || !config.smtp_user) {
                return (0, response_1.errorResponse)(res, 400, 'SMTP settings are not configured. Please configure SMTP settings first.');
            }
            // Send test email
            await email_service_1.default.sendTestEmail(email, config);
            (0, response_1.successResponse)(res, 200, 'Test email sent successfully');
        }
        catch (error) {
            logger_1.default.error('Failed to send test email:', error);
            (0, response_1.errorResponse)(res, 500, error.message || 'Failed to send test email');
        }
    }
}
exports.SystemConfigurationController = SystemConfigurationController;
exports.default = new SystemConfigurationController();
