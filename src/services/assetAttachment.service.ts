import AssetAttachmentModel from '../models/assetAttachment.model';
import ActionLogService from './actionLog.service';
import SystemConfigurationService from './systemConfiguration.service';
import StorageService from '../utils/storage';
import logger from '../utils/logger';

class AssetAttachmentService {
    async create(
        assetId: number,
        file: Express.Multer.File,
        notes: string | undefined,
        userId: number
    ) {
        try {
            // Get storage configuration
            const storageConfig = await SystemConfigurationService.getStorageConfig();

            // Upload file
            const uploadResult = await StorageService.upload(file, 'assets', storageConfig);

            // Create attachment record
            const attachment = await AssetAttachmentModel.create({
                asset_id: assetId,
                file_name: uploadResult.fileName,
                file_path: uploadResult.filePath,
                file_size: uploadResult.fileSize,
                file_type: uploadResult.fileType,
                storage_type: uploadResult.storageType,
                notes: notes,
                uploaded_by: userId
            });

            // Log action
            await ActionLogService.logAction(
                userId,
                'CREATE',
                'AssetAttachment',
                attachment.id,
                {
                    asset_id: assetId,
                    file_name: uploadResult.fileName,
                    file_size: uploadResult.fileSize
                }
            );

            return attachment;
        } catch (error) {
            logger.error('Error creating asset attachment:', error);
            throw new Error('Failed to create asset attachment');
        }
    }

    async getByAssetId(assetId: number) {
        try {
            return await AssetAttachmentModel.findByAssetId(assetId);
        } catch (error) {
            logger.error('Error fetching asset attachments:', error);
            throw new Error('Failed to fetch asset attachments');
        }
    }

    async getById(id: number) {
        try {
            const attachment = await AssetAttachmentModel.findById(id);
            if (!attachment) {
                throw new Error('Attachment not found');
            }
            return attachment;
        } catch (error) {
            logger.error('Error fetching asset attachment:', error);
            throw error;
        }
    }

    async delete(id: number, userId: number) {
        try {
            const attachment = await this.getById(id);
            
            // Delete file from storage
            const storageConfig = await SystemConfigurationService.getStorageConfig();
            await StorageService.delete(
                attachment.file_path,
                attachment.storage_type,
                storageConfig.firebaseConfig
            );

            // Delete database record
            const deleted = await AssetAttachmentModel.delete(id);

            // Log action
            await ActionLogService.logAction(
                userId,
                'DELETE',
                'AssetAttachment',
                id,
                {
                    asset_id: deleted.asset_id,
                    file_name: deleted.file_name
                }
            );

            return deleted;
        } catch (error) {
            logger.error('Error deleting asset attachment:', error);
            throw new Error('Failed to delete asset attachment');
        }
    }
}

export default new AssetAttachmentService();
