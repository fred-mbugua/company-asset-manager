"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const repairWorkflow_service_1 = __importDefault(require("../services/repairWorkflow.service"));
const response_1 = require("../utils/response");
const logger_1 = __importDefault(require("../utils/logger"));
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
    async getAllStages(req, res) {
        try {
            const includeInactive = req.query.include_inactive === 'true';
            const stages = await repairWorkflow_service_1.default.getAllStages(includeInactive);
            (0, response_1.successResponse)(res, 200, 'Workflow stages retrieved successfully', stages);
        }
        catch (error) {
            logger_1.default.error('Error getting workflow stages:', error);
            (0, response_1.errorResponse)(res, 500, error.message || 'Failed to get workflow stages');
        }
    }
    /**
     * Get a single workflow stage
     */
    async getStageById(req, res) {
        try {
            const id = parseInt(req.params.id);
            const stage = await repairWorkflow_service_1.default.getStageById(id);
            if (!stage) {
                (0, response_1.errorResponse)(res, 404, 'Workflow stage not found');
                return;
            }
            (0, response_1.successResponse)(res, 200, 'Workflow stage retrieved successfully', stage);
        }
        catch (error) {
            logger_1.default.error('Error getting workflow stage:', error);
            (0, response_1.errorResponse)(res, 500, error.message || 'Failed to get workflow stage');
        }
    }
    /**
     * Create a new workflow stage
     */
    async createStage(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                (0, response_1.errorResponse)(res, 401, 'User not authenticated');
                return;
            }
            const { stage_key, stage_name, description, from_status_id, to_status_id, action_type, icon, button_color, display_order, requires_notes, requires_invoice, requires_payment } = req.body;
            if (!stage_key || !stage_name || !action_type) {
                (0, response_1.errorResponse)(res, 400, 'stage_key, stage_name, and action_type are required');
                return;
            }
            const stage = await repairWorkflow_service_1.default.createStage({
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
            (0, response_1.successResponse)(res, 201, 'Workflow stage created successfully', stage);
        }
        catch (error) {
            logger_1.default.error('Error creating workflow stage:', error);
            (0, response_1.errorResponse)(res, 500, error.message || 'Failed to create workflow stage');
        }
    }
    /**
     * Update a workflow stage
     */
    async updateStage(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                (0, response_1.errorResponse)(res, 401, 'User not authenticated');
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
            const stage = await repairWorkflow_service_1.default.updateStage(id, data, userId);
            (0, response_1.successResponse)(res, 200, 'Workflow stage updated successfully', stage);
        }
        catch (error) {
            logger_1.default.error('Error updating workflow stage:', error);
            (0, response_1.errorResponse)(res, 500, error.message || 'Failed to update workflow stage');
        }
    }
    /**
     * Delete a workflow stage
     */
    async deleteStage(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                (0, response_1.errorResponse)(res, 401, 'User not authenticated');
                return;
            }
            const id = parseInt(req.params.id);
            await repairWorkflow_service_1.default.deleteStage(id, userId);
            (0, response_1.successResponse)(res, 200, 'Workflow stage deleted successfully');
        }
        catch (error) {
            logger_1.default.error('Error deleting workflow stage:', error);
            (0, response_1.errorResponse)(res, 500, error.message || 'Failed to delete workflow stage');
        }
    }
    /**
     * Toggle stage active status
     */
    async toggleStageActive(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                (0, response_1.errorResponse)(res, 401, 'User not authenticated');
                return;
            }
            const id = parseInt(req.params.id);
            const stage = await repairWorkflow_service_1.default.toggleStageActive(id, userId);
            (0, response_1.successResponse)(res, 200, 'Workflow stage toggled successfully', stage);
        }
        catch (error) {
            logger_1.default.error('Error toggling workflow stage:', error);
            (0, response_1.errorResponse)(res, 500, error.message || 'Failed to toggle workflow stage');
        }
    }
    // ========================================================================
    // PERMISSIONS
    // ========================================================================
    /**
     * Get all permissions
     */
    async getAllPermissions(req, res) {
        try {
            const permissions = await repairWorkflow_service_1.default.getAllPermissions();
            (0, response_1.successResponse)(res, 200, 'Permissions retrieved successfully', permissions);
        }
        catch (error) {
            logger_1.default.error('Error getting permissions:', error);
            (0, response_1.errorResponse)(res, 500, error.message || 'Failed to get permissions');
        }
    }
    /**
     * Get permissions for a stage
     */
    async getStagePermissions(req, res) {
        try {
            const stageId = parseInt(req.params.id);
            const permissions = await repairWorkflow_service_1.default.getPermissionsByStage(stageId);
            (0, response_1.successResponse)(res, 200, 'Stage permissions retrieved successfully', permissions);
        }
        catch (error) {
            logger_1.default.error('Error getting stage permissions:', error);
            (0, response_1.errorResponse)(res, 500, error.message || 'Failed to get stage permissions');
        }
    }
    /**
     * Update permissions for a stage
     */
    async updateStagePermissions(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                (0, response_1.errorResponse)(res, 401, 'User not authenticated');
                return;
            }
            const stageId = parseInt(req.params.id);
            const { permissions } = req.body;
            if (!Array.isArray(permissions)) {
                (0, response_1.errorResponse)(res, 400, 'permissions must be an array');
                return;
            }
            const rolePermissions = permissions.map((p) => ({
                roleId: parseInt(p.roleId || p.role_id),
                canExecute: p.canExecute === true || p.canExecute === 'true' || p.can_execute === true
            }));
            await repairWorkflow_service_1.default.bulkUpdatePermissions(stageId, rolePermissions, userId);
            (0, response_1.successResponse)(res, 200, 'Permissions updated successfully');
        }
        catch (error) {
            logger_1.default.error('Error updating permissions:', error);
            (0, response_1.errorResponse)(res, 500, error.message || 'Failed to update permissions');
        }
    }
    // ========================================================================
    // USER ACCESS
    // ========================================================================
    /**
     * Get current user's workflow permissions
     */
    async getMyPermissions(req, res) {
        var _a;
        try {
            const roleId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.role_id;
            if (!roleId) {
                (0, response_1.errorResponse)(res, 401, 'User not authenticated');
                return;
            }
            const permissions = await repairWorkflow_service_1.default.getUserWorkflowPermissions(roleId);
            (0, response_1.successResponse)(res, 200, 'User permissions retrieved successfully', permissions);
        }
        catch (error) {
            logger_1.default.error('Error getting user permissions:', error);
            (0, response_1.errorResponse)(res, 500, error.message || 'Failed to get user permissions');
        }
    }
    /**
     * Get available actions for a specific request
     */
    async getAvailableActions(req, res) {
        var _a;
        try {
            const roleId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.role_id;
            if (!roleId) {
                (0, response_1.errorResponse)(res, 401, 'User not authenticated');
                return;
            }
            const statusId = parseInt(req.query.status_id);
            if (!statusId) {
                (0, response_1.errorResponse)(res, 400, 'status_id is required');
                return;
            }
            const actions = await repairWorkflow_service_1.default.getAvailableActions(roleId, statusId);
            (0, response_1.successResponse)(res, 200, 'Available actions retrieved successfully', actions);
        }
        catch (error) {
            logger_1.default.error('Error getting available actions:', error);
            (0, response_1.errorResponse)(res, 500, error.message || 'Failed to get available actions');
        }
    }
}
exports.default = new RepairWorkflowController();
