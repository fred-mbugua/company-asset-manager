import { Request, Response } from 'express';
import RepairWorkflowService from '../services/repairWorkflow.service';
import { successResponse, errorResponse } from '../utils/response';
import logger from '../utils/logger';
import { AuthenticatedRequest } from '../types';

// ============================================================================
// CONTROLLER CLASS
// ============================================================================

class RepairWorkflowController {
    // ========================================================================
    // WORKFLOW STAGES
    // ========================================================================

    /**
     * Get all workflow stages
     */
    async getAllStages(req: Request, res: Response): Promise<void> {
        try {
            const includeInactive = req.query.include_inactive === 'true';
            const stages = await RepairWorkflowService.getAllStages(includeInactive);
            successResponse(res, 200, 'Workflow stages retrieved successfully', stages);
        } catch (error: any) {
            logger.error('Error getting workflow stages:', error);
            errorResponse(res, 500, error.message || 'Failed to get workflow stages');
        }
    }

    /**
     * Get a single workflow stage
     */
    async getStageById(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            const stage = await RepairWorkflowService.getStageById(id);
            
            if (!stage) {
                errorResponse(res, 404, 'Workflow stage not found');
                return;
            }

            successResponse(res, 200, 'Workflow stage retrieved successfully', stage);
        } catch (error: any) {
            logger.error('Error getting workflow stage:', error);
            errorResponse(res, 500, error.message || 'Failed to get workflow stage');
        }
    }

    /**
     * Create a new workflow stage
     */
    async createStage(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            if (!userId) {
                errorResponse(res, 401, 'User not authenticated');
                return;
            }

            const { stage_key, stage_name, description, from_status_id, to_status_id,
                    action_type, icon, button_color, display_order,
                    requires_notes, requires_invoice, requires_payment } = req.body;

            if (!stage_key || !stage_name || !action_type) {
                errorResponse(res, 400, 'stage_key, stage_name, and action_type are required');
                return;
            }

            const stage = await RepairWorkflowService.createStage({
                stage_key,
                stage_name,
                description,
                from_status_id: from_status_id ? parseInt(from_status_id) : undefined,
                to_status_id: to_status_id ? parseInt(to_status_id) : undefined,
                action_type,
                icon,
                button_color,
                display_order: display_order ? parseInt(display_order) : 0,
                requires_notes: requires_notes === true || requires_notes === 'true',
                requires_invoice: requires_invoice === true || requires_invoice === 'true',
                requires_payment: requires_payment === true || requires_payment === 'true'
            }, userId);

            successResponse(res, 201, 'Workflow stage created successfully', stage);
        } catch (error: any) {
            logger.error('Error creating workflow stage:', error);
            errorResponse(res, 500, error.message || 'Failed to create workflow stage');
        }
    }

    /**
     * Update a workflow stage
     */
    async updateStage(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            if (!userId) {
                errorResponse(res, 401, 'User not authenticated');
                return;
            }

            const id = parseInt(req.params.id);
            const data = req.body;

            // Convert string booleans to actual booleans
            if (data.requires_notes !== undefined) {
                data.requires_notes = data.requires_notes === true || data.requires_notes === 'true';
            }
            if (data.requires_invoice !== undefined) {
                data.requires_invoice = data.requires_invoice === true || data.requires_invoice === 'true';
            }
            if (data.requires_payment !== undefined) {
                data.requires_payment = data.requires_payment === true || data.requires_payment === 'true';
            }
            if (data.is_active !== undefined) {
                data.is_active = data.is_active === true || data.is_active === 'true';
            }

            const stage = await RepairWorkflowService.updateStage(id, data, userId);
            successResponse(res, 200, 'Workflow stage updated successfully', stage);
        } catch (error: any) {
            logger.error('Error updating workflow stage:', error);
            errorResponse(res, 500, error.message || 'Failed to update workflow stage');
        }
    }

    /**
     * Delete a workflow stage
     */
    async deleteStage(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            if (!userId) {
                errorResponse(res, 401, 'User not authenticated');
                return;
            }

            const id = parseInt(req.params.id);
            await RepairWorkflowService.deleteStage(id, userId);
            successResponse(res, 200, 'Workflow stage deleted successfully');
        } catch (error: any) {
            logger.error('Error deleting workflow stage:', error);
            errorResponse(res, 500, error.message || 'Failed to delete workflow stage');
        }
    }

    /**
     * Toggle stage active status
     */
    async toggleStageActive(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            if (!userId) {
                errorResponse(res, 401, 'User not authenticated');
                return;
            }

            const id = parseInt(req.params.id);
            const stage = await RepairWorkflowService.toggleStageActive(id, userId);
            successResponse(res, 200, 'Workflow stage toggled successfully', stage);
        } catch (error: any) {
            logger.error('Error toggling workflow stage:', error);
            errorResponse(res, 500, error.message || 'Failed to toggle workflow stage');
        }
    }

    // ========================================================================
    // PERMISSIONS
    // ========================================================================

    /**
     * Get all permissions
     */
    async getAllPermissions(req: Request, res: Response): Promise<void> {
        try {
            const permissions = await RepairWorkflowService.getAllPermissions();
            successResponse(res, 200, 'Permissions retrieved successfully', permissions);
        } catch (error: any) {
            logger.error('Error getting permissions:', error);
            errorResponse(res, 500, error.message || 'Failed to get permissions');
        }
    }

    /**
     * Get permissions for a stage
     */
    async getStagePermissions(req: Request, res: Response): Promise<void> {
        try {
            const stageId = parseInt(req.params.id);
            const permissions = await RepairWorkflowService.getPermissionsByStage(stageId);
            successResponse(res, 200, 'Stage permissions retrieved successfully', permissions);
        } catch (error: any) {
            logger.error('Error getting stage permissions:', error);
            errorResponse(res, 500, error.message || 'Failed to get stage permissions');
        }
    }

    /**
     * Update permissions for a stage
     */
    async updateStagePermissions(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            if (!userId) {
                errorResponse(res, 401, 'User not authenticated');
                return;
            }

            const stageId = parseInt(req.params.id);
            const { permissions } = req.body;

            if (!Array.isArray(permissions)) {
                errorResponse(res, 400, 'permissions must be an array');
                return;
            }

            const rolePermissions = permissions.map((p: any) => ({
                roleId: parseInt(p.roleId || p.role_id),
                canExecute: p.canExecute === true || p.canExecute === 'true' || p.can_execute === true
            }));

            await RepairWorkflowService.bulkUpdatePermissions(stageId, rolePermissions, userId);
            successResponse(res, 200, 'Permissions updated successfully');
        } catch (error: any) {
            logger.error('Error updating permissions:', error);
            errorResponse(res, 500, error.message || 'Failed to update permissions');
        }
    }

    // ========================================================================
    // USER ACCESS
    // ========================================================================

    /**
     * Get current user's workflow permissions
     */
    async getMyPermissions(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const roleId = req.user?.role_id;
            if (!roleId) {
                errorResponse(res, 401, 'User not authenticated');
                return;
            }

            const permissions = await RepairWorkflowService.getUserWorkflowPermissions(roleId);
            successResponse(res, 200, 'User permissions retrieved successfully', permissions);
        } catch (error: any) {
            logger.error('Error getting user permissions:', error);
            errorResponse(res, 500, error.message || 'Failed to get user permissions');
        }
    }

    /**
     * Get available actions for a specific request
     */
    async getAvailableActions(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const roleId = req.user?.role_id;
            if (!roleId) {
                errorResponse(res, 401, 'User not authenticated');
                return;
            }

            const statusId = parseInt(req.query.status_id as string);
            if (!statusId) {
                errorResponse(res, 400, 'status_id is required');
                return;
            }

            const actions = await RepairWorkflowService.getAvailableActions(roleId, statusId);
            successResponse(res, 200, 'Available actions retrieved successfully', actions);
        } catch (error: any) {
            logger.error('Error getting available actions:', error);
            errorResponse(res, 500, error.message || 'Failed to get available actions');
        }
    }
}

export default new RepairWorkflowController();
