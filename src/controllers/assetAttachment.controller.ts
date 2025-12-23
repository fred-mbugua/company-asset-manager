import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types';
import AssetAttachmentService from '../services/assetAttachment.service';
import { successResponse, errorResponse } from '../utils/response';
import logger from '../utils/logger';

export class AssetAttachmentController {
    async create(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return errorResponse(res, 401, 'Unauthorized');
            }

            const assetId = parseInt(req.params.assetId);
            if (isNaN(assetId)) {
                return errorResponse(res, 400, 'Invalid asset ID');
            }

            if (!req.file) {
                return errorResponse(res, 400, 'No file uploaded');
            }

            const notes = req.body.notes;
            const attachment = await AssetAttachmentService.create(assetId, req.file, notes, userId);

            successResponse(res, 201, 'Attachment uploaded successfully', attachment);
        } catch (error: any) {
            logger.error('Failed to create asset attachment:', error);
            errorResponse(res, 500, error.message || 'Failed to upload attachment');
        }
    }

    async getByAssetId(req: Request, res: Response) {
        try {
            const assetId = parseInt(req.params.assetId);
            if (isNaN(assetId)) {
                return errorResponse(res, 400, 'Invalid asset ID');
            }

            const attachments = await AssetAttachmentService.getByAssetId(assetId);
            successResponse(res, 200, 'Attachments retrieved successfully', attachments);
        } catch (error: any) {
            logger.error('Failed to get asset attachments:', error);
            errorResponse(res, 500, 'Failed to retrieve attachments');
        }
    }

    async delete(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return errorResponse(res, 401, 'Unauthorized');
            }

            const attachmentId = parseInt(req.params.id);
            if (isNaN(attachmentId)) {
                return errorResponse(res, 400, 'Invalid attachment ID');
            }

            await AssetAttachmentService.delete(attachmentId, userId);
            successResponse(res, 200, 'Attachment deleted successfully', null);
        } catch (error: any) {
            logger.error('Failed to delete asset attachment:', error);
            errorResponse(res, 500, error.message || 'Failed to delete attachment');
        }
    }
}

export default new AssetAttachmentController();
