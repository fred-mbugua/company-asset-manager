"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assignmentAttachment_model_1 = __importDefault(require("../models/assignmentAttachment.model"));
const actionLog_service_1 = __importDefault(require("./actionLog.service"));
const systemConfiguration_service_1 = __importDefault(require("./systemConfiguration.service"));
const storage_1 = __importDefault(require("../utils/storage"));
const logger_1 = __importDefault(require("../utils/logger"));
class AssignmentAttachmentService {
    async create(assignmentId, file, notes, userId) {
        try {
            // Get storage configuration
            const storageConfig = await systemConfiguration_service_1.default.getStorageConfig();
            // Upload file
            const uploadResult = await storage_1.default.upload(file, 'assignments', storageConfig);
            // Create attachment record
            const attachment = await assignmentAttachment_model_1.default.create({
                assignment_id: assignmentId,
                file_name: uploadResult.fileName,
                file_path: uploadResult.filePath,
                file_size: uploadResult.fileSize,
                file_type: uploadResult.fileType,
                storage_type: uploadResult.storageType,
                notes: notes,
                uploaded_by: userId
            });
            // Log action
            await actionLog_service_1.default.logAction(userId, 'CREATE', 'AssignmentAttachment', attachment.id, {
                assignment_id: assignmentId,
                file_name: uploadResult.fileName,
                file_size: uploadResult.fileSize
            });
            return attachment;
        }
        catch (error) {
            logger_1.default.error('Error creating assignment attachment:', error);
            throw new Error('Failed to create assignment attachment');
        }
    }
    async getByAssignmentId(assignmentId) {
        try {
            return await assignmentAttachment_model_1.default.findByAssignmentId(assignmentId);
        }
        catch (error) {
            logger_1.default.error('Error fetching assignment attachments:', error);
            throw new Error('Failed to fetch assignment attachments');
        }
    }
    async getById(id) {
        try {
            const attachment = await assignmentAttachment_model_1.default.findById(id);
            if (!attachment) {
                throw new Error('Attachment not found');
            }
            return attachment;
        }
        catch (error) {
            logger_1.default.error('Error fetching assignment attachment:', error);
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
            const deleted = await assignmentAttachment_model_1.default.delete(id);
            // Log action
            await actionLog_service_1.default.logAction(userId, 'DELETE', 'AssignmentAttachment', id, {
                assignment_id: deleted.assignment_id,
                file_name: deleted.file_name
            });
            return deleted;
        }
        catch (error) {
            logger_1.default.error('Error deleting assignment attachment:', error);
            throw new Error('Failed to delete assignment attachment');
        }
    }
}
exports.default = new AssignmentAttachmentService();
