import RepairRequestPriorityModel, { IRepairRequestPriority, ICreateRepairRequestPriority } from '../models/repairRequestPriority.model';
import ActionLogModel from '../models/actionLog.model';
import logger from '../utils/logger';

export class RepairRequestPriorityService {
    /**
     * Creates a new repair request priority
     */
    async create(data: ICreateRepairRequestPriority, userId?: number): Promise<IRepairRequestPriority> {
        try {
            const priority = await RepairRequestPriorityModel.create(data);
            
            if (userId) {
                await ActionLogModel.create({
                    user_id: userId,
                    action_type: 'CREATE',
                    entity_type: 'RepairRequestPriority',
                    entity_id: priority.id,
                    details: { name: priority.name }
                });
            }

            return priority;
        } catch (error: any) {
            logger.error('Error creating repair request priority:', error);
            throw error;
        }
    }

    /**
     * Gets all repair request priorities
     */
    async findAll(includeInactive: boolean = false): Promise<IRepairRequestPriority[]> {
        return await RepairRequestPriorityModel.findAll(includeInactive);
    }

    /**
     * Gets a repair request priority by ID
     */
    async findById(id: number): Promise<IRepairRequestPriority | null> {
        return await RepairRequestPriorityModel.findById(id);
    }

    /**
     * Updates a repair request priority
     */
    async update(id: number, data: Partial<ICreateRepairRequestPriority>, userId?: number): Promise<IRepairRequestPriority> {
        try {
            const priority = await RepairRequestPriorityModel.update(id, data);
            
            if (userId) {
                await ActionLogModel.create({
                    user_id: userId,
                    action_type: 'UPDATE',
                    entity_type: 'RepairRequestPriority',
                    entity_id: id,
                    details: { changes: data }
                });
            }

            return priority;
        } catch (error: any) {
            logger.error('Error updating repair request priority:', error);
            throw error;
        }
    }

    /**
     * Deletes a repair request priority
     */
    async delete(id: number, userId?: number): Promise<void> {
        try {
            const priority = await RepairRequestPriorityModel.findById(id);
            await RepairRequestPriorityModel.delete(id);
            
            if (userId && priority) {
                await ActionLogModel.create({
                    user_id: userId,
                    action_type: 'DELETE',
                    entity_type: 'RepairRequestPriority',
                    entity_id: id,
                    details: { name: priority.name }
                });
            }
        } catch (error: any) {
            logger.error('Error deleting repair request priority:', error);
            throw error;
        }
    }

    /**
     * Toggles active status
     */
    async toggleActive(id: number, userId?: number): Promise<IRepairRequestPriority> {
        try {
            const priority = await RepairRequestPriorityModel.toggleActive(id);
            
            if (userId) {
                await ActionLogModel.create({
                    user_id: userId,
                    action_type: 'UPDATE',
                    entity_type: 'RepairRequestPriority',
                    entity_id: id,
                    details: { is_active: priority.is_active }
                });
            }

            return priority;
        } catch (error: any) {
            logger.error('Error toggling repair request priority:', error);
            throw error;
        }
    }

    /**
     * Gets default priority (Medium)
     */
    async getDefaultPriority(): Promise<IRepairRequestPriority | null> {
        return await RepairRequestPriorityModel.getDefaultPriority();
    }
}

export default new RepairRequestPriorityService();
