import { Request } from 'express';
import multer from 'multer';
import xlsx from 'xlsx';
import { AssetModel } from '../models';
import logger from '../utils/logger';

const upload = multer({ storage: multer.memoryStorage() });

export class BulkUploadService {
  async processAssetUpload(file: Express.Multer.File) {
    try {
      const workbook = xlsx.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

      // Assuming the first row is headers
      const headers = jsonData[0] as string[];
      const assetsToCreate = (jsonData.slice(1) as any[]).map(row => {
        const asset: any = {};
        headers.forEach((header, index) => {
          asset[header.trim().toLowerCase().replace(/ /g, '_')] = row[index];
        });
        return asset;
      });

      for (const asset of assetsToCreate) {
        await AssetModel.create(asset);
      }

      return { success: true, count: assetsToCreate.length };
    } catch (error) {
      logger.error('Bulk asset upload failed:', error);
      throw new Error('Failed to process bulk upload file.');
    }
  }
}

export { upload };
export default new BulkUploadService();