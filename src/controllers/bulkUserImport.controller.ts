import { Request, Response } from 'express';
import BulkUserImportService from '../services/bulkUserImport.service';
import { successResponse, errorResponse } from '../utils/response';
import logger from '../utils/logger';
import { AuthenticatedRequest } from '../types';

class BulkUserImportController {
    /**
     * Preview file contents before import
     */
    async previewFile(req: AuthenticatedRequest, res: Response) {
        try {
            if (!req.file) {
                return errorResponse(res, 400, 'No file uploaded');
            }

            const fileExtension = req.file.originalname.split('.').pop()?.toLowerCase();
            let result;

            if (fileExtension === 'xlsx' || fileExtension === 'xls') {
                result = await BulkUserImportService.parseExcelFile(req.file.buffer);
            } else if (fileExtension === 'csv') {
                result = await BulkUserImportService.parseCsvFile(req.file.buffer);
            } else {
                return errorResponse(res, 400, 'Invalid file format. Please upload an Excel (.xlsx, .xls) or CSV file');
            }

            logger.info(`File preview generated: ${result.valid.length} valid, ${result.invalid.length} invalid`);
            successResponse(res, 200, 'File preview generated', result);
        } catch (error: any) {
            logger.error('File preview failed:', error);
            errorResponse(res, 500, error.message || 'Failed to preview file');
        }
    }

    /**
     * Process the bulk import
     */
    async processImport(req: AuthenticatedRequest, res: Response) {
        try {
            const { users, importType } = req.body;
            const performingUserId = req.user?.id;

            if (!users || !Array.isArray(users) || users.length === 0) {
                return errorResponse(res, 400, 'No users to import');
            }

            if (!performingUserId) {
                return errorResponse(res, 401, 'User not authenticated');
            }

            const result = await BulkUserImportService.processImport(
                users,
                importType || 'excel',
                performingUserId
            );

            logger.info(`Bulk import completed: ${result.successfulRecords} successful, ${result.failedRecords} failed`);
            successResponse(res, 201, 'Import completed', result);
        } catch (error: any) {
            logger.error('Bulk import failed:', error);
            errorResponse(res, 500, error.message || 'Failed to process import');
        }
    }

    /**
     * Download import template
     */
    async downloadTemplate(req: Request, res: Response) {
        try {
            const buffer = await BulkUserImportService.generateTemplate();

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=user_import_template.xlsx');
            res.send(buffer);
        } catch (error: any) {
            logger.error('Template download failed:', error);
            errorResponse(res, 500, 'Failed to generate template');
        }
    }

    /**
     * Get all import batches
     */
    async getAllBatches(req: AuthenticatedRequest, res: Response) {
        try {
            const limit = parseInt(req.query.limit as string) || 20;
            const offset = parseInt(req.query.offset as string) || 0;

            const result = await BulkUserImportService.getAllBatches(limit, offset);
            successResponse(res, 200, 'Import batches retrieved', result);
        } catch (error: any) {
            logger.error('Failed to get import batches:', error);
            errorResponse(res, 500, error.message);
        }
    }

    /**
     * Get batch details with imported users (supports pagination and search)
     */
    async getBatchDetails(req: AuthenticatedRequest, res: Response) {
        try {
            const batchId = parseInt(req.params.batchId);
            if (isNaN(batchId)) {
                return errorResponse(res, 400, 'Invalid batch ID');
            }

            // Check for pagination/search params
            const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
            const offset = req.query.offset ? parseInt(req.query.offset as string) : undefined;
            const search = req.query.search as string | undefined;

            // If pagination params provided, use paginated method
            if (limit !== undefined || offset !== undefined || search) {
                const result = await BulkUserImportService.getBatchDetailsPaginated(batchId, { limit, offset, search });
                successResponse(res, 200, 'Batch details retrieved', result);
            } else {
                const result = await BulkUserImportService.getBatchDetails(batchId);
                successResponse(res, 200, 'Batch details retrieved', result);
            }
        } catch (error: any) {
            logger.error('Failed to get batch details:', error);
            errorResponse(res, 404, error.message);
        }
    }
}

export default new BulkUserImportController();
