"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepairRequestStatusService = void 0;
const repairRequestStatus_model_1 = __importDefault(require("../models/repairRequestStatus.model"));
const actionLog_model_1 = __importDefault(require("../models/actionLog.model"));
const logger_1 = __importDefault(require("../utils/logger"));
class RepairRequestStatusService {
    /**
     * Creates a new repair request status
     */
    async create(data, userId) {
        try {
            const status = await repairRequestStatus_model_1.default.create(data);
            if (userId) {
                await actionLog_model_1.default.create({
                    user_id: userId,
                    action_type: 'CREATE',
                    entity_type: 'RepairRequestStatus',
                    entity_id: status.id,
                    details: { name: status.name }
                });
            }
            return status;
        }
        catch (error) {
            logger_1.default.error('Error creating repair request status:', error);
            throw error;
        }
    }
    /**
     * Gets all repair request statuses
     */
    async findAll(includeInactive = false) {
        return await repairRequestStatus_model_1.default.findAll(includeInactive);
    }
    /**
     * Gets a repair request status by ID
     */
    async findById(id) {
        return await repairRequestStatus_model_1.default.findById(id);
    }
    /**
     * Gets a repair request status by name
     */
    async findByName(name) {
        return await repairRequestStatus_model_1.default.findByName(name);
    }
    /**
     * Updates a repair request status
     */
    async update(id, data, userId) {
        try {
            const status = await repairRequestStatus_model_1.default.update(id, data);
            if (userId) {
                await actionLog_model_1.default.create({
                    user_id: userId,
                    action_type: 'UPDATE',
                    entity_type: 'RepairRequestStatus',
                    entity_id: id,
                    details: { changes: data }
                });
            }
            return status;
        }
        catch (error) {
            logger_1.default.error('Error updating repair request status:', error);
            throw error;
        }
    }
    /**
     * Deletes a repair request status
     */
    async delete(id, userId) {
        try {
            const status = await repairRequestStatus_model_1.default.findById(id);
            await repairRequestStatus_model_1.default.delete(id);
            if (userId && status) {
                await actionLog_model_1.default.create({
                    user_id: userId,
                    action_type: 'DELETE',
                    entity_type: 'RepairRequestStatus',
                    entity_id: id,
                    details: { name: status.name }
                });
            }
        }
        catch (error) {
            logger_1.default.error('Error deleting repair request status:', error);
            throw error;
        }
    }
    /**
     * Toggles active status
     */
    async toggleActive(id, userId) {
        try {
            const status = await repairRequestStatus_model_1.default.toggleActive(id);
            if (userId) {
                await actionLog_model_1.default.create({
                    user_id: userId,
                    action_type: 'UPDATE',
                    entity_type: 'RepairRequestStatus',
                    entity_id: id,
                    details: { is_active: status.is_active }
                });
            }
            return status;
        }
        catch (error) {
            logger_1.default.error('Error toggling repair request status:', error);
            throw error;
        }
    }
    /**
     * Gets initial status for new requests
     */
    async getInitialStatus() {
        return await repairRequestStatus_model_1.default.getInitialStatus();
    }
}
exports.RepairRequestStatusService = RepairRequestStatusService;
exports.default = new RepairRequestStatusService();
