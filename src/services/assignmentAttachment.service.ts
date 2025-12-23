import AssignmentAttachmentModel from '../models/assignmentAttachment.model';
import ActionLogService from './actionLog.service';
import SystemConfigurationService from './systemConfiguration.service';
import StorageService from '../utils/storage';
import logger from '../utils/logger';

class AssignmentAttachmentService {
    async create(
        assignmentId: number,
        file: Express.Multer.File,
        notes: string | undefined,
        userId: number
    ) {
        try {
            // Get storage configuration
            const storageConfig = await SystemConfigurationService.getStorageConfig();

            // Upload file
            const uploadResult = await StorageService.upload(file, 'assignments', storageConfig);

            // Create attachment record
            const attachment = await AssignmentAttachmentModel.create({
                assignment_id: assignmentId,
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
                'AssignmentAttachment',
                attachment.id,
                {
                    assignment_id: assignmentId,
                    file_name: uploadResult.fileName,
                    file_size: uploadResult.fileSize
                }
            );

            return attachment;
        } catch (error) {
            logger.error('Error creating assignment attachment:', error);
            throw new Error('Failed to create assignment attachment');
        }
    }

    async getByAssignmentId(assignmentId: number) {
        try {
            return await AssignmentAttachmentModel.findByAssignmentId(assignmentId);
        } catch (error) {
            logger.error('Error fetching assignment attachments:', error);
            throw new Error('Failed to fetch assignment attachments');
        }
    }

    async getById(id: number) {
        try {
            const attachment = await AssignmentAttachmentModel.findById(id);
            if (!attachment) {
                throw new Error('Attachment not found');
            }
            return attachment;
        } catch (error) {
            logger.error('Error fetching assignment attachment:', error);
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
            const deleted = await AssignmentAttachmentModel.delete(id);

            // Log action
            await ActionLogService.logAction(
                userId,
                'DELETE',
                'AssignmentAttachment',
                id,
                {
                    assignment_id: deleted.assignment_id,
                    file_name: deleted.file_name
                }
            );

            return deleted;
        } catch (error) {
            logger.error('Error deleting assignment attachment:', error);
            throw new Error('Failed to delete assignment attachment');
        }
    }
}

export default new AssignmentAttachmentService();
