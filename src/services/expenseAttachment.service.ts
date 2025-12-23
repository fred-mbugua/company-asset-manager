import ExpenseAttachmentModel from '../models/expenseAttachment.model';
import ActionLogService from './actionLog.service';
import SystemConfigurationService from './systemConfiguration.service';
import StorageService from '../utils/storage';
import logger from '../utils/logger';

class ExpenseAttachmentService {
    async create(
        expenseId: number,
        file: Express.Multer.File,
        notes: string | undefined,
        userId: number
    ) {
        try {
            // Get storage configuration
            const storageConfig = await SystemConfigurationService.getStorageConfig();

            // Upload file
            const uploadResult = await StorageService.upload(file, 'expenses', storageConfig);

            // Create attachment record
            const attachment = await ExpenseAttachmentModel.create({
                expense_id: expenseId,
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
                'ExpenseAttachment',
                attachment.id,
                {
                    expense_id: expenseId,
                    file_name: uploadResult.fileName,
                    file_size: uploadResult.fileSize
                }
            );

            return attachment;
        } catch (error) {
            logger.error('Error creating expense attachment:', error);
            throw new Error('Failed to create expense attachment');
        }
    }

    async getByExpenseId(expenseId: number) {
        try {
            return await ExpenseAttachmentModel.findByExpenseId(expenseId);
        } catch (error) {
            logger.error('Error fetching expense attachments:', error);
            throw new Error('Failed to fetch expense attachments');
        }
    }

    async getById(id: number) {
        try {
            const attachment = await ExpenseAttachmentModel.findById(id);
            if (!attachment) {
                throw new Error('Attachment not found');
            }
            return attachment;
        } catch (error) {
            logger.error('Error fetching expense attachment:', error);
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
            const deleted = await ExpenseAttachmentModel.delete(id);

            // Log action
            await ActionLogService.logAction(
                userId,
                'DELETE',
                'ExpenseAttachment',
                id,
                {
                    expense_id: deleted.expense_id,
                    file_name: deleted.file_name
                }
            );

            return deleted;
        } catch (error) {
            logger.error('Error deleting expense attachment:', error);
            throw new Error('Failed to delete expense attachment');
        }
    }
}

export default new ExpenseAttachmentService();
