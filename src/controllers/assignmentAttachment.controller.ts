import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types';
import AssignmentAttachmentService from '../services/assignmentAttachment.service';
import { successResponse, errorResponse } from '../utils/response';
import logger from '../utils/logger';

export class AssignmentAttachmentController {
    async create(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return errorResponse(res, 401, 'Unauthorized');
            }

            const assignmentId = parseInt(req.params.assignmentId);
            if (isNaN(assignmentId)) {
                return errorResponse(res, 400, 'Invalid assignment ID');
            }

            if (!req.file) {
                return errorResponse(res, 400, 'No file uploaded');
            }

            const notes = req.body.notes;
            const attachment = await AssignmentAttachmentService.create(assignmentId, req.file, notes, userId);

            successResponse(res, 201, 'Attachment uploaded successfully', attachment);
        } catch (error: any) {
            logger.error('Failed to create assignment attachment:', error);
            errorResponse(res, 500, error.message || 'Failed to upload attachment');
        }
    }

    async getByAssignmentId(req: Request, res: Response) {
        try {
            const assignmentId = parseInt(req.params.assignmentId);
            if (isNaN(assignmentId)) {
                return errorResponse(res, 400, 'Invalid assignment ID');
            }

            const attachments = await AssignmentAttachmentService.getByAssignmentId(assignmentId);
            successResponse(res, 200, 'Attachments retrieved successfully', attachments);
        } catch (error: any) {
            logger.error('Failed to get assignment attachments:', error);
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

            await AssignmentAttachmentService.delete(attachmentId, userId);
            successResponse(res, 200, 'Attachment deleted successfully', null);
        } catch (error: any) {
            logger.error('Failed to delete assignment attachment:', error);
            errorResponse(res, 500, error.message || 'Failed to delete attachment');
        }
    }
}

export default new AssignmentAttachmentController();
