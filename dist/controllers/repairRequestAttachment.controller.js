"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const repairRequest_service_1 = __importDefault(require("../services/repairRequest.service"));
const systemConfiguration_service_1 = __importDefault(require("../services/systemConfiguration.service"));
const storage_1 = __importDefault(require("../utils/storage"));
const response_1 = require("../utils/response");
const logger_1 = __importDefault(require("../utils/logger"));
/**
 * Controller for Repair Request Attachment management
 */
class RepairRequestAttachmentController {
    /**
     * Upload attachment(s) to a repair request
     */
    async upload(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                (0, response_1.errorResponse)(res, 401, 'User not authenticated');
                return;
            }
            const requestId = parseInt(req.params.id);
            const { attachment_type, notes } = req.body;
            const files = req.files;
            if (!files || files.length === 0) {
                (0, response_1.errorResponse)(res, 400, 'No files uploaded');
                return;
            }
            // Verify request exists
            const request = await repairRequest_service_1.default.getRequestById(requestId);
            if (!request) {
                (0, response_1.errorResponse)(res, 404, 'Repair request not found');
                return;
            }
            // Get storage configuration from system settings
            const storageConfig = await systemConfiguration_service_1.default.getStorageConfig();
            const attachments = [];
            for (const file of files) {
                // Upload file using storage service
                const uploadResult = await storage_1.default.upload(file, 'repair-requests', storageConfig);
                const attachment = await repairRequest_service_1.default.addAttachment({
                    repair_request_id: requestId,
                    file_name: uploadResult.fileName,
                    file_path: uploadResult.filePath,
                    file_size: uploadResult.fileSize,
                    file_type: uploadResult.fileType,
                    storage_type: uploadResult.storageType,
                    attachment_type: attachment_type || 'general',
                    notes,
                    uploaded_by: userId
                }, userId);
                attachments.push(attachment);
            }
            (0, response_1.successResponse)(res, 201, 'Attachments uploaded successfully', attachments);
        }
        catch (error) {
            logger_1.default.error('Error uploading attachments:', error);
            (0, response_1.errorResponse)(res, 500, error.message || 'Failed to upload attachments');
        }
    }
    /**
     * Get all attachments for a repair request
     */
    async getByRequestId(req, res) {
        try {
            const requestId = parseInt(req.params.id);
            const attachments = await repairRequest_service_1.default.getAttachments(requestId);
            (0, response_1.successResponse)(res, 200, 'Attachments retrieved successfully', attachments);
        }
        catch (error) {
            logger_1.default.error('Error getting attachments:', error);
            (0, response_1.errorResponse)(res, 500, error.message || 'Failed to get attachments');
        }
    }
    /**
     * Get a single attachment
     */
    async getById(req, res) {
        try {
            const id = parseInt(req.params.attachmentId);
            const attachment = await repairRequest_service_1.default.getAttachmentById(id);
            if (!attachment) {
                (0, response_1.errorResponse)(res, 404, 'Attachment not found');
                return;
            }
            (0, response_1.successResponse)(res, 200, 'Attachment retrieved successfully', attachment);
        }
        catch (error) {
            logger_1.default.error('Error getting attachment:', error);
            (0, response_1.errorResponse)(res, 500, error.message || 'Failed to get attachment');
        }
    }
    /**
     * Update an attachment (type, notes, or replace file)
     */
    async update(req, res) {
        var _a, _b;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const userRole = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role_name;
            if (!userId) {
                (0, response_1.errorResponse)(res, 401, 'User not authenticated');
                return;
            }
            const requestId = parseInt(req.params.id);
            const attachmentId = parseInt(req.params.attachmentId);
            const { attachment_type, notes } = req.body;
            const file = req.file;
            // Get existing attachment
            const attachment = await repairRequest_service_1.default.getAttachmentById(attachmentId);
            if (!attachment) {
                (0, response_1.errorResponse)(res, 404, 'Attachment not found');
                return;
            }
            // Check permission: Only Admin or the uploader can edit
            if (userRole !== 'Admin' && attachment.uploaded_by !== userId) {
                (0, response_1.errorResponse)(res, 403, 'You do not have permission to edit this attachment');
                return;
            }
            let updateData = {};
            // Update type and notes if provided
            if (attachment_type) {
                updateData.attachment_type = attachment_type;
            }
            if (notes !== undefined) {
                updateData.notes = notes;
            }
            // If a new file is uploaded, replace the old one
            if (file) {
                // Delete old file from storage
                const storageConfig = await systemConfiguration_service_1.default.getStorageConfig();
                await storage_1.default.delete(attachment.file_path, attachment.storage_type, storageConfig.firebaseConfig);
                // Upload new file
                const uploadResult = await storage_1.default.upload(file, 'repair-requests', storageConfig);
                updateData.file_name = uploadResult.fileName;
                updateData.file_path = uploadResult.filePath;
                updateData.file_size = uploadResult.fileSize;
                updateData.file_type = uploadResult.fileType;
                updateData.storage_type = uploadResult.storageType;
            }
            // Update in database
            const updatedAttachment = await repairRequest_service_1.default.updateAttachment(attachmentId, updateData);
            (0, response_1.successResponse)(res, 200, 'Attachment updated successfully', updatedAttachment);
        }
        catch (error) {
            logger_1.default.error('Error updating attachment:', error);
            (0, response_1.errorResponse)(res, 500, error.message || 'Failed to update attachment');
        }
    }
    /**
     * Delete an attachment
     */
    async delete(req, res) {
        var _a, _b;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const userRole = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role_name;
            if (!userId) {
                (0, response_1.errorResponse)(res, 401, 'User not authenticated');
                return;
            }
            const id = parseInt(req.params.attachmentId);
            // Get attachment first to know storage type and uploader
            const attachment = await repairRequest_service_1.default.getAttachmentById(id);
            if (!attachment) {
                (0, response_1.errorResponse)(res, 404, 'Attachment not found');
                return;
            }
            // Check permission: Only Admin or the uploader can delete
            if (userRole !== 'Admin' && attachment.uploaded_by !== userId) {
                (0, response_1.errorResponse)(res, 403, 'You do not have permission to delete this attachment');
                return;
            }
            // Delete from storage
            const storageConfig = await systemConfiguration_service_1.default.getStorageConfig();
            await storage_1.default.delete(attachment.file_path, attachment.storage_type, storageConfig.firebaseConfig);
            // Delete from database
            await repairRequest_service_1.default.deleteAttachment(id, userId);
            (0, response_1.successResponse)(res, 200, 'Attachment deleted successfully');
        }
        catch (error) {
            logger_1.default.error('Error deleting attachment:', error);
            (0, response_1.errorResponse)(res, 500, error.message || 'Failed to delete attachment');
        }
    }
    /**
     * Download an attachment
     */
    async download(req, res) {
        try {
            const id = parseInt(req.params.attachmentId);
            const attachment = await repairRequest_service_1.default.getAttachmentById(id);
            if (!attachment) {
                (0, response_1.errorResponse)(res, 404, 'Attachment not found');
                return;
            }
            if (attachment.storage_type === 'firebase') {
                // Redirect to Firebase URL
                res.redirect(attachment.file_path);
            }
            else {
                // Serve local file
                const filePath = path_1.default.join(process.cwd(), attachment.file_path);
                if (!fs_1.default.existsSync(filePath)) {
                    (0, response_1.errorResponse)(res, 404, 'File not found on server');
                    return;
                }
                res.download(filePath, attachment.file_name);
            }
        }
        catch (error) {
            logger_1.default.error('Error downloading attachment:', error);
            (0, response_1.errorResponse)(res, 500, error.message || 'Failed to download attachment');
        }
    }
}
exports.default = new RepairRequestAttachmentController();
