"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const repairWorkflow_model_1 = __importDefault(require("../models/repairWorkflow.model"));
const actionLog_model_1 = __importDefault(require("../models/actionLog.model"));
// ============================================================================
// SERVICE CLASS
// ============================================================================
class RepairWorkflowService {
    // ========================================================================
    // WORKFLOW STAGES
    // ========================================================================
    /**
     * Get all workflow stages
     */
    async getAllStages(includeInactive = false) {
        return await repairWorkflow_model_1.default.findAllStages(includeInactive);
    }
    /**
     * Get a single stage by ID
     */
    async getStageById(id) {
        return await repairWorkflow_model_1.default.findStageById(id);
    }
    /**
     * Get a stage by key
     */
    async getStageByKey(stageKey) {
        return await repairWorkflow_model_1.default.findStageByKey(stageKey);
    }
    /**
     * Create a new workflow stage
     */
    async createStage(data, userId) {
        const stage = await repairWorkflow_model_1.default.createStage(data);
        await actionLog_model_1.default.create({
            user_id: userId,
            action_type: 'CREATE',
            entity_type: 'RepairWorkflowStage',
            entity_id: stage.id,
            details: { stage_key: stage.stage_key, stage_name: stage.stage_name }
        });
        return stage;
    }
    /**
     * Update a workflow stage
     */
    async updateStage(id, data, userId) {
        const stage = await repairWorkflow_model_1.default.updateStage(id, data);
        await actionLog_model_1.default.create({
            user_id: userId,
            action_type: 'UPDATE',
            entity_type: 'RepairWorkflowStage',
            entity_id: id,
            details: { stage_key: stage.stage_key, changes: data }
        });
        return stage;
    }
    /**
     * Delete a workflow stage
     */
    async deleteStage(id, userId) {
        const stage = await repairWorkflow_model_1.default.findStageById(id);
        if (!stage) {
            throw new Error('Workflow stage not found');
        }
        await repairWorkflow_model_1.default.deleteStage(id);
        await actionLog_model_1.default.create({
            user_id: userId,
            action_type: 'DELETE',
            entity_type: 'RepairWorkflowStage',
            entity_id: id,
            details: { stage_key: stage.stage_key, stage_name: stage.stage_name }
        });
    }
    /**
     * Toggle stage active status
     */
    async toggleStageActive(id, userId) {
        const stage = await repairWorkflow_model_1.default.toggleStageActive(id);
        await actionLog_model_1.default.create({
            user_id: userId,
            action_type: 'UPDATE',
            entity_type: 'RepairWorkflowStage',
            entity_id: id,
            details: { stage_key: stage.stage_key, is_active: stage.is_active }
        });
        return stage;
    }
    // ========================================================================
    // PERMISSIONS MANAGEMENT
    // ========================================================================
    /**
     * Get all permissions
     */
    async getAllPermissions() {
        return await repairWorkflow_model_1.default.getAllPermissions();
    }
    /**
     * Get permissions for a stage
     */
    async getPermissionsByStage(stageId) {
        return await repairWorkflow_model_1.default.getPermissionsByStage(stageId);
    }
    /**
     * Set permission for a role on a stage
     */
    async setPermission(stageId, roleId, canExecute, userId) {
        const permission = await repairWorkflow_model_1.default.setPermission(stageId, roleId, canExecute);
        await actionLog_model_1.default.create({
            user_id: userId,
            action_type: 'UPDATE',
            entity_type: 'RepairWorkflowPermission',
            entity_id: permission.id,
            details: { stage_id: stageId, role_id: roleId, can_execute: canExecute }
        });
        return permission;
    }
    /**
     * Bulk update permissions for a stage
     */
    async bulkUpdatePermissions(stageId, rolePermissions, userId) {
        await repairWorkflow_model_1.default.bulkUpdatePermissions(stageId, rolePermissions);
        await actionLog_model_1.default.create({
            user_id: userId,
            action_type: 'UPDATE',
            entity_type: 'RepairWorkflowPermission',
            entity_id: stageId,
            details: { stage_id: stageId, permissions: rolePermissions }
        });
    }
    // ========================================================================
    // USER ACCESS CHECKS
    // ========================================================================
    /**
     * Get workflow permissions for a user's role
     */
    async getUserWorkflowPermissions(roleId) {
        return await repairWorkflow_model_1.default.getUserWorkflowPermissions(roleId);
    }
    /**
     * Check if user can perform an action
     */
    async canUserPerformAction(roleId, stageKey, currentStatusId) {
        return await repairWorkflow_model_1.default.canUserPerformAction(roleId, stageKey, currentStatusId);
    }
    /**
     * Get available actions for a request based on user role and request status
     */
    async getAvailableActions(roleId, currentStatusId) {
        const permissions = await this.getUserWorkflowPermissions(roleId);
        // Filter to only actions available for the current status
        return permissions.filter(p => p.from_status_id === currentStatusId ||
            p.from_status_id === null // Actions like 'cancel' can be done from any status
        );
    }
}
exports.default = new RepairWorkflowService();
