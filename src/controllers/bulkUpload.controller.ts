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
}

export default new BulkUploadController();