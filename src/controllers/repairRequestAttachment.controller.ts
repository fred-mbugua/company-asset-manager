import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import RepairRequestService from '../services/repairRequest.service';
import { successResponse, errorResponse } from '../utils/response';
import logger from '../utils/logger';
import { AuthenticatedRequest } from '../types';

/**
 * Controller for Repair Request Attachment management
 */
class RepairRequestAttachmentController {
    /**
     * Upload attachment(s) to a repair request
     */
    async upload(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            if (!userId) {
                errorResponse(res, 401, 'User not authenticated');
                return;
            }

            const requestId = parseInt(req.params.id);
            const { attachment_type, notes } = req.body;
            const files = req.files as Express.Multer.File[];

            if (!files || files.length === 0) {
                errorResponse(res, 400, 'No files uploaded');
                return;
            }

            // Verify request exists
            const request = await RepairRequestService.getRequestById(requestId);
            if (!request) {
                errorResponse(res, 404, 'Repair request not found');
                return;
            }

            const attachments = [];
            for (const file of files) {
                const attachment = await RepairRequestService.addAttachment({
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

            successResponse(res, 201, 'Attachments uploaded successfully', attachments);
        } catch (error: any) {
            logger.error('Error uploading attachments:', error);
            errorResponse(res, 500, error.message || 'Failed to upload attachments');
        }
    }

    /**
     * Get all attachments for a repair request
     */
    async getByRequestId(req: Request, res: Response): Promise<void> {
        try {
            const requestId = parseInt(req.params.id);
            const attachments = await RepairRequestService.getAttachments(requestId);
            successResponse(res, 200, 'Attachments retrieved successfully', attachments);
        } catch (error: any) {
            logger.error('Error getting attachments:', error);
            errorResponse(res, 500, error.message || 'Failed to get attachments');
        }
    }

    /**
     * Get a single attachment
     */
    async getById(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.attachmentId);
            const attachment = await RepairRequestService.getAttachmentById(id);

            if (!attachment) {
                errorResponse(res, 404, 'Attachment not found');
                return;
            }

            successResponse(res, 200, 'Attachment retrieved successfully', attachment);
        } catch (error: any) {
            logger.error('Error getting attachment:', error);
            errorResponse(res, 500, error.message || 'Failed to get attachment');
        }
    }

    /**
     * Delete an attachment
     */
    async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            if (!userId) {
                errorResponse(res, 401, 'User not authenticated');
                return;
            }

            const id = parseInt(req.params.attachmentId);
            const attachment = await RepairRequestService.deleteAttachment(id, userId);

            // Delete the file from storage if it's stored locally
            if (attachment.storage_type === 'server' && attachment.file_path) {
                const filePath = path.join(process.cwd(), attachment.file_path);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }

            successResponse(res, 200, 'Attachment deleted successfully');
        } catch (error: any) {
            logger.error('Error deleting attachment:', error);
            errorResponse(res, 500, error.message || 'Failed to delete attachment');
        }
    }

    /**
     * Download an attachment
     */
    async download(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.attachmentId);
            const attachment = await RepairRequestService.getAttachmentById(id);

            if (!attachment) {
                errorResponse(res, 404, 'Attachment not found');
                return;
            }

            if (attachment.storage_type === 'firebase') {
                // Redirect to Firebase URL
                res.redirect(attachment.file_path);
            } else {
                // Serve local file
                const filePath = path.join(process.cwd(), attachment.file_path);
                if (!fs.existsSync(filePath)) {
                    errorResponse(res, 404, 'File not found on server');
                    return;
                }
                res.download(filePath, attachment.file_name);
            }
        } catch (error: any) {
            logger.error('Error downloading attachment:', error);
            errorResponse(res, 500, error.message || 'Failed to download attachment');
        }
    }
}

export default new RepairRequestAttachmentController();
