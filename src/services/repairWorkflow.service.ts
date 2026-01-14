import RepairWorkflowModel, { IWorkflowStage, ICreateWorkflowStage, IUserWorkflowPermissions } from '../models/repairWorkflow.model';
import ActionLogModel from '../models/actionLog.model';
import logger from '../utils/logger';

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
    async getAllStages(includeInactive: boolean = false): Promise<IWorkflowStage[]> {
        return await RepairWorkflowModel.findAllStages(includeInactive);
    }

    /**
     * Get a single stage by ID
     */
    async getStageById(id: number): Promise<IWorkflowStage | null> {
        return await RepairWorkflowModel.findStageById(id);
    }

    /**
     * Get a stage by key
     */
    async getStageByKey(stageKey: string): Promise<IWorkflowStage | null> {
        return await RepairWorkflowModel.findStageByKey(stageKey);
    }

    /**
     * Create a new workflow stage
     */
    async createStage(data: ICreateWorkflowStage, userId: number): Promise<IWorkflowStage> {
        const stage = await RepairWorkflowModel.createStage(data);

        await ActionLogModel.create({
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
    async updateStage(id: number, data: Partial<IWorkflowStage>, userId: number): Promise<IWorkflowStage> {
        const stage = await RepairWorkflowModel.updateStage(id, data);

        await ActionLogModel.create({
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
    async deleteStage(id: number, userId: number): Promise<void> {
        const stage = await RepairWorkflowModel.findStageById(id);
        if (!stage) {
            throw new Error('Workflow stage not found');
        }

        await RepairWorkflowModel.deleteStage(id);

        await ActionLogModel.create({
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
    async toggleStageActive(id: number, userId: number): Promise<IWorkflowStage> {
        const stage = await RepairWorkflowModel.toggleStageActive(id);

        await ActionLogModel.create({
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
        return await RepairWorkflowModel.getAllPermissions();
    }

    /**
     * Get permissions for a stage
     */
    async getPermissionsByStage(stageId: number) {
        return await RepairWorkflowModel.getPermissionsByStage(stageId);
    }

    /**
     * Set permission for a role on a stage
     */
    async setPermission(stageId: number, roleId: number, canExecute: boolean, userId: number) {
        const permission = await RepairWorkflowModel.setPermission(stageId, roleId, canExecute);

        await ActionLogModel.create({
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
    async bulkUpdatePermissions(
        stageId: number, 
        rolePermissions: { roleId: number; canExecute: boolean }[],
        userId: number
    ): Promise<void> {
        await RepairWorkflowModel.bulkUpdatePermissions(stageId, rolePermissions);

        await ActionLogModel.create({
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
    async getUserWorkflowPermissions(roleId: number): Promise<IUserWorkflowPermissions[]> {
        return await RepairWorkflowModel.getUserWorkflowPermissions(roleId);
    }

    /**
     * Check if user can perform an action
     */
    async canUserPerformAction(roleId: number, stageKey: string, currentStatusId?: number): Promise<boolean> {
        return await RepairWorkflowModel.canUserPerformAction(roleId, stageKey, currentStatusId);
    }

    /**
     * Get available actions for a request based on user role and request status
     */
    async getAvailableActions(roleId: number, currentStatusId: number): Promise<IUserWorkflowPermissions[]> {
        const permissions = await this.getUserWorkflowPermissions(roleId);
        
        // Filter to only actions available for the current status
        return permissions.filter(p => 
            p.from_status_id === currentStatusId || 
            p.from_status_id === null // Actions like 'cancel' can be done from any status
        );
    }
}

export default new RepairWorkflowService();
