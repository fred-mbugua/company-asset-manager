import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types';
import ExpenseAttachmentService from '../services/expenseAttachment.service';
import { successResponse, errorResponse } from '../utils/response';
import logger from '../utils/logger';

export class ExpenseAttachmentController {
    async create(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return errorResponse(res, 401, 'Unauthorized');
            }

            const expenseId = parseInt(req.params.expenseId);
            if (isNaN(expenseId)) {
                return errorResponse(res, 400, 'Invalid expense ID');
            }

            if (!req.file) {
                return errorResponse(res, 400, 'No file uploaded');
            }

            const notes = req.body.notes;
            const attachment = await ExpenseAttachmentService.create(expenseId, req.file, notes, userId);

            successResponse(res, 201, 'Attachment uploaded successfully', attachment);
        } catch (error: any) {
            logger.error('Failed to create expense attachment:', error);
            errorResponse(res, 500, error.message || 'Failed to upload attachment');
        }
    }

    async getByExpenseId(req: Request, res: Response) {
        try {
            const expenseId = parseInt(req.params.expenseId);
            if (isNaN(expenseId)) {
                return errorResponse(res, 400, 'Invalid expense ID');
            }

            const attachments = await ExpenseAttachmentService.getByExpenseId(expenseId);
            successResponse(res, 200, 'Attachments retrieved successfully', attachments);
        } catch (error: any) {
            logger.error('Failed to get expense attachments:', error);
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

            await ExpenseAttachmentService.delete(attachmentId, userId);
            successResponse(res, 200, 'Attachment deleted successfully', null);
        } catch (error: any) {
            logger.error('Failed to delete expense attachment:', error);
            errorResponse(res, 500, error.message || 'Failed to delete attachment');
        }
    }
}

export default new ExpenseAttachmentController();
