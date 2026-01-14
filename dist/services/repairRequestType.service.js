"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepairRequestTypeService = void 0;
const repairRequestType_model_1 = __importDefault(require("../models/repairRequestType.model"));
const actionLog_model_1 = __importDefault(require("../models/actionLog.model"));
const logger_1 = __importDefault(require("../utils/logger"));
class RepairRequestTypeService {
    /**
     * Creates a new repair request type
     */
    async create(data, userId) {
        try {
            const type = await repairRequestType_model_1.default.create(data);
            if (userId) {
                await actionLog_model_1.default.create({
                    user_id: userId,
                    action_type: 'CREATE',
                    entity_type: 'RepairRequestType',
                    entity_id: type.id,
                    details: { name: type.name }
                });
            }
            return type;
        }
        catch (error) {
            logger_1.default.error('Error creating repair request type:', error);
            throw error;
        }
    }
    /**
     * Gets all repair request types
     */
    async findAll(includeInactive = false) {
        return await repairRequestType_model_1.default.findAll(includeInactive);
    }
    /**
     * Gets a repair request type by ID
     */
    async findById(id) {
        return await repairRequestType_model_1.default.findById(id);
    }
    /**
     * Updates a repair request type
     */
    async update(id, data, userId) {
        try {
            const type = await repairRequestType_model_1.default.update(id, data);
            if (userId) {
                await actionLog_model_1.default.create({
                    user_id: userId,
                    action_type: 'UPDATE',
                    entity_type: 'RepairRequestType',
                    entity_id: id,
                    details: { changes: data }
                });
            }
            return type;
        }
        catch (error) {
            logger_1.default.error('Error updating repair request type:', error);
            throw error;
        }
    }
    /**
     * Deletes a repair request type
     */
    async delete(id, userId) {
        try {
            const type = await repairRequestType_model_1.default.findById(id);
            await repairRequestType_model_1.default.delete(id);
            if (userId && type) {
                await actionLog_model_1.default.create({
                    user_id: userId,
                    action_type: 'DELETE',
                    entity_type: 'RepairRequestType',
                    entity_id: id,
                    details: { name: type.name }
                });
            }
        }
        catch (error) {
            logger_1.default.error('Error deleting repair request type:', error);
            throw error;
        }
    }
    /**
     * Toggles active status
     */
    async toggleActive(id, userId) {
        try {
            const type = await repairRequestType_model_1.default.toggleActive(id);
            if (userId) {
                await actionLog_model_1.default.create({
                    user_id: userId,
                    action_type: 'UPDATE',
                    entity_type: 'RepairRequestType',
                    entity_id: id,
                    details: { is_active: type.is_active }
                });
            }
            return type;
        }
        catch (error) {
            logger_1.default.error('Error toggling repair request type:', error);
            throw error;
        }
    }
}
exports.RepairRequestTypeService = RepairRequestTypeService;
exports.default = new RepairRequestTypeService();
