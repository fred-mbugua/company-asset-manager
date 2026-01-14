import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import RepairRequestService from '../services/repairRequest.service';
import SystemConfigurationService from '../services/systemConfiguration.service';
import StorageService from '../utils/storage';
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

            // Get storage configuration from system settings
            const storageConfig = await SystemConfigurationService.getStorageConfig();

            const attachments = [];
            for (const file of files) {
                // Upload file using storage service
                const uploadResult = await StorageService.upload(file, 'repair-requests', storageConfig);

                const attachment = await RepairRequestService.addAttachment({
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
     * Update an attachment (type, notes, or replace file)
     */
    async update(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            const userRole = req.user?.role_name;
            if (!userId) {
                errorResponse(res, 401, 'User not authenticated');
                return;
            }

            const requestId = parseInt(req.params.id);
            const attachmentId = parseInt(req.params.attachmentId);
            const { attachment_type, notes } = req.body;
            const file = req.file as Express.Multer.File | undefined;

            // Get existing attachment
            const attachment = await RepairRequestService.getAttachmentById(attachmentId);
            if (!attachment) {
                errorResponse(res, 404, 'Attachment not found');
                return;
            }

            // Check permission: Only Admin or the uploader can edit
            if (userRole !== 'Admin' && attachment.uploaded_by !== userId) {
                errorResponse(res, 403, 'You do not have permission to edit this attachment');
                return;
            }

            let updateData: any = {};
            
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
                const storageConfig = await SystemConfigurationService.getStorageConfig();
                await StorageService.delete(
                    attachment.file_path,
                    attachment.storage_type,
                    storageConfig.firebaseConfig
                );

                // Upload new file
                const uploadResult = await StorageService.upload(file, 'repair-requests', storageConfig);

                updateData.file_name = uploadResult.fileName;
                updateData.file_path = uploadResult.filePath;
                updateData.file_size = uploadResult.fileSize;
                updateData.file_type = uploadResult.fileType;
                updateData.storage_type = uploadResult.storageType;
            }

            // Update in database
            const updatedAttachment = await RepairRequestService.updateAttachment(attachmentId, updateData);

            successResponse(res, 200, 'Attachment updated successfully', updatedAttachment);
        } catch (error: any) {
            logger.error('Error updating attachment:', error);
            errorResponse(res, 500, error.message || 'Failed to update attachment');
        }
    }

    /**
     * Delete an attachment
     */
    async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            const userRole = req.user?.role_name;
            if (!userId) {
                errorResponse(res, 401, 'User not authenticated');
                return;
            }

            const id = parseInt(req.params.attachmentId);
            
            // Get attachment first to know storage type and uploader
            const attachment = await RepairRequestService.getAttachmentById(id);
            if (!attachment) {
                errorResponse(res, 404, 'Attachment not found');
                return;
            }

            // Check permission: Only Admin or the uploader can delete
            if (userRole !== 'Admin' && attachment.uploaded_by !== userId) {
                errorResponse(res, 403, 'You do not have permission to delete this attachment');
                return;
            }

            // Delete from storage
            const storageConfig = await SystemConfigurationService.getStorageConfig();
            await StorageService.delete(
                attachment.file_path,
                attachment.storage_type,
                storageConfig.firebaseConfig
            );

            // Delete from database
            await RepairRequestService.deleteAttachment(id, userId);

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
