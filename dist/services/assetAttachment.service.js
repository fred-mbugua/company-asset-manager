"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assetAttachment_model_1 = __importDefault(require("../models/assetAttachment.model"));
const actionLog_service_1 = __importDefault(require("./actionLog.service"));
const systemConfiguration_service_1 = __importDefault(require("./systemConfiguration.service"));
const storage_1 = __importDefault(require("../utils/storage"));
const logger_1 = __importDefault(require("../utils/logger"));
class AssetAttachmentService {
    async create(assetId, file, notes, userId) {
        try {
            // Get storage configuration
            const storageConfig = await systemConfiguration_service_1.default.getStorageConfig();
            // Upload file
            const uploadResult = await storage_1.default.upload(file, 'assets', storageConfig);
            // Create attachment record
            const attachment = await assetAttachment_model_1.default.create({
                asset_id: assetId,
                file_name: uploadResult.fileName,
                file_path: uploadResult.filePath,
                file_size: uploadResult.fileSize,
                file_type: uploadResult.fileType,
                storage_type: uploadResult.storageType,
                notes: notes,
                uploaded_by: userId
            });
            // Log action
            await actionLog_service_1.default.logAction(userId, 'CREATE', 'AssetAttachment', attachment.id, {
                asset_id: assetId,
                file_name: uploadResult.fileName,
                file_size: uploadResult.fileSize
            });
            return attachment;
        }
        catch (error) {
            logger_1.default.error('Error creating asset attachment:', error);
            throw new Error('Failed to create asset attachment');
        }
    }
    async getByAssetId(assetId) {
        try {
            return await assetAttachment_model_1.default.findByAssetId(assetId);
        }
        catch (error) {
            logger_1.default.error('Error fetching asset attachments:', error);
            throw new Error('Failed to fetch asset attachments');
        }
    }
    async getById(id) {
        try {
            const attachment = await assetAttachment_model_1.default.findById(id);
            if (!attachment) {
                throw new Error('Attachment not found');
            }
            return attachment;
        }
        catch (error) {
            logger_1.default.error('Error fetching asset attachment:', error);
            throw error;
        }
    }
    async delete(id, userId) {
        try {
            const attachment = await this.getById(id);
            // Delete file from storage
            const storageConfig = await systemConfiguration_service_1.default.getStorageConfig();
            await storage_1.default.delete(attachment.file_path, attachment.storage_type, storageConfig.firebaseConfig);
            // Delete database record
            const deleted = await assetAttachment_model_1.default.delete(id);
            // Log action
            await actionLog_service_1.default.logAction(userId, 'DELETE', 'AssetAttachment', id, {
                asset_id: deleted.asset_id,
                file_name: deleted.file_name
            });
            return deleted;
        }
        catch (error) {
            logger_1.default.error('Error deleting asset attachment:', error);
            throw new Error('Failed to delete asset attachment');
        }
    }
}
exports.default = new AssetAttachmentService();
