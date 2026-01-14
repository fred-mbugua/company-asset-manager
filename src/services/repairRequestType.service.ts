import RepairRequestTypeModel, { IRepairRequestType, ICreateRepairRequestType } from '../models/repairRequestType.model';
import ActionLogModel from '../models/actionLog.model';
import logger from '../utils/logger';

export class RepairRequestTypeService {
    /**
     * Creates a new repair request type
     */
    async create(data: ICreateRepairRequestType, userId?: number): Promise<IRepairRequestType> {
        try {
            const type = await RepairRequestTypeModel.create(data);
            
            if (userId) {
                await ActionLogModel.create({
                    user_id: userId,
                    action_type: 'CREATE',
                    entity_type: 'RepairRequestType',
                    entity_id: type.id,
                    details: { name: type.name }
                });
            }

            return type;
        } catch (error: any) {
            logger.error('Error creating repair request type:', error);
            throw error;
        }
    }

    /**
     * Gets all repair request types
     */
    async findAll(includeInactive: boolean = false): Promise<IRepairRequestType[]> {
        return await RepairRequestTypeModel.findAll(includeInactive);
    }

    /**
     * Gets a repair request type by ID
     */
    async findById(id: number): Promise<IRepairRequestType | null> {
        return await RepairRequestTypeModel.findById(id);
    }

    /**
     * Updates a repair request type
     */
    async update(id: number, data: Partial<ICreateRepairRequestType>, userId?: number): Promise<IRepairRequestType> {
        try {
            const type = await RepairRequestTypeModel.update(id, data);
            
            if (userId) {
                await ActionLogModel.create({
                    user_id: userId,
                    action_type: 'UPDATE',
                    entity_type: 'RepairRequestType',
                    entity_id: id,
                    details: { changes: data }
                });
            }

            return type;
        } catch (error: any) {
            logger.error('Error updating repair request type:', error);
            throw error;
        }
    }

    /**
     * Deletes a repair request type
     */
    async delete(id: number, userId?: number): Promise<void> {
        try {
            const type = await RepairRequestTypeModel.findById(id);
            await RepairRequestTypeModel.delete(id);
            
            if (userId && type) {
                await ActionLogModel.create({
                    user_id: userId,
                    action_type: 'DELETE',
                    entity_type: 'RepairRequestType',
                    entity_id: id,
                    details: { name: type.name }
                });
            }
        } catch (error: any) {
            logger.error('Error deleting repair request type:', error);
            throw error;
        }
    }

    /**
     * Toggles active status
     */
    async toggleActive(id: number, userId?: number): Promise<IRepairRequestType> {
        try {
            const type = await RepairRequestTypeModel.toggleActive(id);
            
            if (userId) {
                await ActionLogModel.create({
                    user_id: userId,
                    action_type: 'UPDATE',
                    entity_type: 'RepairRequestType',
                    entity_id: id,
                    details: { is_active: type.is_active }
                });
            }

            return type;
        } catch (error: any) {
            logger.error('Error toggling repair request type:', error);
            throw error;
        }
    }
}

export default new RepairRequestTypeService();
