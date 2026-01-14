import RepairRequestStatusModel, { IRepairRequestStatus, ICreateRepairRequestStatus } from '../models/repairRequestStatus.model';
import ActionLogModel from '../models/actionLog.model';
import logger from '../utils/logger';

export class RepairRequestStatusService {
    /**
     * Creates a new repair request status
     */
    async create(data: ICreateRepairRequestStatus, userId?: number): Promise<IRepairRequestStatus> {
        try {
            const status = await RepairRequestStatusModel.create(data);
            
            if (userId) {
                await ActionLogModel.create({
                    user_id: userId,
                    action_type: 'CREATE',
                    entity_type: 'RepairRequestStatus',
                    entity_id: status.id,
                    details: { name: status.name }
                });
            }

            return status;
        } catch (error: any) {
            logger.error('Error creating repair request status:', error);
            throw error;
        }
    }

    /**
     * Gets all repair request statuses
     */
    async findAll(includeInactive: boolean = false): Promise<IRepairRequestStatus[]> {
        return await RepairRequestStatusModel.findAll(includeInactive);
    }

    /**
     * Gets a repair request status by ID
     */
    async findById(id: number): Promise<IRepairRequestStatus | null> {
        return await RepairRequestStatusModel.findById(id);
    }

    /**
     * Gets a repair request status by name
     */
    async findByName(name: string): Promise<IRepairRequestStatus | null> {
        return await RepairRequestStatusModel.findByName(name);
    }

    /**
     * Updates a repair request status
     */
    async update(id: number, data: Partial<ICreateRepairRequestStatus>, userId?: number): Promise<IRepairRequestStatus> {
        try {
            const status = await RepairRequestStatusModel.update(id, data);
            
            if (userId) {
                await ActionLogModel.create({
                    user_id: userId,
                    action_type: 'UPDATE',
                    entity_type: 'RepairRequestStatus',
                    entity_id: id,
                    details: { changes: data }
                });
            }

            return status;
        } catch (error: any) {
            logger.error('Error updating repair request status:', error);
            throw error;
        }
    }

    /**
     * Deletes a repair request status
     */
    async delete(id: number, userId?: number): Promise<void> {
        try {
            const status = await RepairRequestStatusModel.findById(id);
            await RepairRequestStatusModel.delete(id);
            
            if (userId && status) {
                await ActionLogModel.create({
                    user_id: userId,
                    action_type: 'DELETE',
                    entity_type: 'RepairRequestStatus',
                    entity_id: id,
                    details: { name: status.name }
                });
            }
        } catch (error: any) {
            logger.error('Error deleting repair request status:', error);
            throw error;
        }
    }

    /**
     * Toggles active status
     */
    async toggleActive(id: number, userId?: number): Promise<IRepairRequestStatus> {
        try {
            const status = await RepairRequestStatusModel.toggleActive(id);
            
            if (userId) {
                await ActionLogModel.create({
                    user_id: userId,
                    action_type: 'UPDATE',
                    entity_type: 'RepairRequestStatus',
                    entity_id: id,
                    details: { is_active: status.is_active }
                });
            }

            return status;
        } catch (error: any) {
            logger.error('Error toggling repair request status:', error);
            throw error;
        }
    }

    /**
     * Gets initial status for new requests
     */
    async getInitialStatus(): Promise<IRepairRequestStatus | null> {
        return await RepairRequestStatusModel.getInitialStatus();
    }
}

export default new RepairRequestStatusService();
