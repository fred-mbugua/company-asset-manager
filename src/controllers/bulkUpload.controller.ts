import { Request, Response } from 'express';
import { BulkUploadService } from '../services';
import { successResponse, errorResponse } from '../utils/response';
import logger from '../utils/logger';

class BulkUploadController {
  async uploadAssets(req: Request, res: Response): Promise<void> {
    if (!req.file) {
      return errorResponse(res, 400, 'No file uploaded');
    }
    try {
      const result = await BulkUploadService.processAssetUpload(req.file);
      successResponse(res, 200, `Successfully uploaded and created ${result.count} assets.`, { count: result.count });
    } catch (error: any) {
      logger.error('Bulk upload failed:', error);
      errorResponse(res, 500, error.message || 'Bulk upload failed');
    }
  }

  async uploadEmployees(req: Request, res: Response): Promise<void> {
    if (!req.file) {
      return errorResponse(res, 400, 'No file uploaded');
    }
    try {
      const result = await BulkUploadService.processEmployeeUpload(req.file);
      const message = result.errors && result.errors.length > 0
        ? `Successfully uploaded ${result.count} employees. Some rows had errors.`
        : `Successfully uploaded ${result.count} employees.`;
      
      successResponse(res, 200, message, { 
        count: result.count,
        errors: result.errors 
      });
    } catch (error: any) {
      logger.error('Bulk employee upload failed:', error);
      errorResponse(res, 500, error.message || 'Bulk employee upload failed');
    }
  }

  async downloadEmployeeTemplate(req: Request, res: Response): Promise<void> {
    try {
      const buffer = BulkUploadService.generateEmployeeTemplate();
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=Employee_Upload_Template.xlsx');
      res.send(buffer);
    } catch (error: any) {
      logger.error('Failed to generate employee template:', error);
      errorResponse(res, 500, 'Failed to generate template');
    }
  }
}

export default new BulkUploadController();