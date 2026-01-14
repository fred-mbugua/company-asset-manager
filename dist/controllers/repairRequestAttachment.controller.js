"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const repairRequest_service_1 = __importDefault(require("../services/repairRequest.service"));
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
            const attachments = [];
            for (const file of files) {
                const attachment = await repairRequest_service_1.default.addAttachment({
                    repair_request_id: requestId,
                    file_name: file.originalname,
                    file_path: file.path || `/uploads/repair-requests/${file.filename}`,
                    file_size: file.size,
                    file_type: file.mimetype,
                    storage_type: 'server',
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
     * Delete an attachment
     */
    async delete(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                (0, response_1.errorResponse)(res, 401, 'User not authenticated');
                return;
            }
            const id = parseInt(req.params.attachmentId);
            const attachment = await repairRequest_service_1.default.deleteAttachment(id, userId);
            // Delete the file from storage if it's stored locally
            if (attachment.storage_type === 'server' && attachment.file_path) {
                const filePath = path_1.default.join(process.cwd(), attachment.file_path);
                if (fs_1.default.existsSync(filePath)) {
                    fs_1.default.unlinkSync(filePath);
                }
            }
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
