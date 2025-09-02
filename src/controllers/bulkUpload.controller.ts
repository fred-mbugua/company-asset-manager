import { Request, Response } from 'express';
import { BulkUploadService } from '../services';
import logger from '../utils/logger';

class BulkUploadController {
  async uploadAssets(req: Request, res: Response): Promise<void> {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }
    try {
      const result = await BulkUploadService.processAssetUpload(req.file);
      res.status(200).json({ message: `Successfully uploaded and created ${result.count} assets.`, count: result.count });
    } catch (error: any) {
      logger.error('Bulk upload failed:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

export default new BulkUploadController();