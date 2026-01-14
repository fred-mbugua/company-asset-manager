"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepairRequestPriorityService = void 0;
const repairRequestPriority_model_1 = __importDefault(require("../models/repairRequestPriority.model"));
const actionLog_model_1 = __importDefault(require("../models/actionLog.model"));
const logger_1 = __importDefault(require("../utils/logger"));
class RepairRequestPriorityService {
    /**
     * Creates a new repair request priority
     */
    async create(data, userId) {
        try {
            const priority = await repairRequestPriority_model_1.default.create(data);
            if (userId) {
                await actionLog_model_1.default.create({
                    user_id: userId,
                    action_type: 'CREATE',
                    entity_type: 'RepairRequestPriority',
                    entity_id: priority.id,
                    details: { name: priority.name }
                });
            }
            return priority;
        }
        catch (error) {
            logger_1.default.error('Error creating repair request priority:', error);
            throw error;
        }
    }
    /**
     * Gets all repair request priorities
     */
    async findAll(includeInactive = false) {
        return await repairRequestPriority_model_1.default.findAll(includeInactive);
    }
    /**
     * Gets a repair request priority by ID
     */
    async findById(id) {
        return await repairRequestPriority_model_1.default.findById(id);
    }
    /**
     * Updates a repair request priority
     */
    async update(id, data, userId) {
        try {
            const priority = await repairRequestPriority_model_1.default.update(id, data);
            if (userId) {
                await actionLog_model_1.default.create({
                    user_id: userId,
                    action_type: 'UPDATE',
                    entity_type: 'RepairRequestPriority',
                    entity_id: id,
                    details: { changes: data }
                });
            }
            return priority;
        }
        catch (error) {
            logger_1.default.error('Error updating repair request priority:', error);
            throw error;
        }
    }
    /**
     * Deletes a repair request priority
     */
    async delete(id, userId) {
        try {
            const priority = await repairRequestPriority_model_1.default.findById(id);
            await repairRequestPriority_model_1.default.delete(id);
            if (userId && priority) {
                await actionLog_model_1.default.create({
                    user_id: userId,
                    action_type: 'DELETE',
                    entity_type: 'RepairRequestPriority',
                    entity_id: id,
                    details: { name: priority.name }
                });
            }
        }
        catch (error) {
            logger_1.default.error('Error deleting repair request priority:', error);
            throw error;
        }
    }
    /**
     * Toggles active status
     */
    async toggleActive(id, userId) {
        try {
            const priority = await repairRequestPriority_model_1.default.toggleActive(id);
            if (userId) {
                await actionLog_model_1.default.create({
                    user_id: userId,
                    action_type: 'UPDATE',
                    entity_type: 'RepairRequestPriority',
                    entity_id: id,
                    details: { is_active: priority.is_active }
                });
            }
            return priority;
        }
        catch (error) {
            logger_1.default.error('Error toggling repair request priority:', error);
            throw error;
        }
    }
    /**
     * Gets default priority (Medium)
     */
    async getDefaultPriority() {
        return await repairRequestPriority_model_1.default.getDefaultPriority();
    }
}
exports.RepairRequestPriorityService = RepairRequestPriorityService;
exports.default = new RepairRequestPriorityService();
