"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const expenseAttachment_model_1 = __importDefault(require("../models/expenseAttachment.model"));
const actionLog_service_1 = __importDefault(require("./actionLog.service"));
const systemConfiguration_service_1 = __importDefault(require("./systemConfiguration.service"));
const storage_1 = __importDefault(require("../utils/storage"));
const logger_1 = __importDefault(require("../utils/logger"));
class ExpenseAttachmentService {
    async create(expenseId, file, notes, userId) {
        try {
            // Get storage configuration
            const storageConfig = await systemConfiguration_service_1.default.getStorageConfig();
            // Upload file
            const uploadResult = await storage_1.default.upload(file, 'expenses', storageConfig);
            // Create attachment record
            const attachment = await expenseAttachment_model_1.default.create({
                expense_id: expenseId,
                file_name: uploadResult.fileName,
                file_path: uploadResult.filePath,
                file_size: uploadResult.fileSize,
                file_type: uploadResult.fileType,
                storage_type: uploadResult.storageType,
                notes: notes,
                uploaded_by: userId
            });
            // Log action
            await actionLog_service_1.default.logAction(userId, 'CREATE', 'ExpenseAttachment', attachment.id, {
                expense_id: expenseId,
                file_name: uploadResult.fileName,
                file_size: uploadResult.fileSize
            });
            return attachment;
        }
        catch (error) {
            logger_1.default.error('Error creating expense attachment:', error);
            throw new Error('Failed to create expense attachment');
        }
    }
    async getByExpenseId(expenseId) {
        try {
            return await expenseAttachment_model_1.default.findByExpenseId(expenseId);
        }
        catch (error) {
            logger_1.default.error('Error fetching expense attachments:', error);
            throw new Error('Failed to fetch expense attachments');
        }
    }
    async getById(id) {
        try {
            const attachment = await expenseAttachment_model_1.default.findById(id);
            if (!attachment) {
                throw new Error('Attachment not found');
            }
            return attachment;
        }
        catch (error) {
            logger_1.default.error('Error fetching expense attachment:', error);
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
            const deleted = await expenseAttachment_model_1.default.delete(id);
            // Log action
            await actionLog_service_1.default.logAction(userId, 'DELETE', 'ExpenseAttachment', id, {
                expense_id: deleted.expense_id,
                file_name: deleted.file_name
            });
            return deleted;
        }
        catch (error) {
            logger_1.default.error('Error deleting expense attachment:', error);
            throw new Error('Failed to delete expense attachment');
        }
    }
}
exports.default = new ExpenseAttachmentService();
