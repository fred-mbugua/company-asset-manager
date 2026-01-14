"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("../config/database"));
// ============================================================================
// MODEL CLASS
// ============================================================================
class RepairWorkflowModel {
    // ========================================================================
    // WORKFLOW STAGES CRUD
    // ========================================================================
    /**
     * Get all workflow stages with status names
     */
    async findAllStages(includeInactive = false) {
        const query = `
            SELECT 
                ws.*,
                fs.name AS from_status_name,
                ts.name AS to_status_name
            FROM repair_workflow_stages ws
            LEFT JOIN repair_request_statuses fs ON ws.from_status_id = fs.id
            LEFT JOIN repair_request_statuses ts ON ws.to_status_id = ts.id
            ${!includeInactive ? 'WHERE ws.is_active = TRUE' : ''}
            ORDER BY ws.display_order, ws.stage_name;
        `;
        const result = await database_1.default.query(query);
        return result.rows;
    }
    /**
     * Get a single workflow stage by ID
     */
    async findStageById(id) {
        const query = `
            SELECT 
                ws.*,
                fs.name AS from_status_name,
                ts.name AS to_status_name
            FROM repair_workflow_stages ws
            LEFT JOIN repair_request_statuses fs ON ws.from_status_id = fs.id
            LEFT JOIN repair_request_statuses ts ON ws.to_status_id = ts.id
            WHERE ws.id = $1;
        `;
        const result = await database_1.default.query(query, [id]);
        return result.rows[0] || null;
    }
    /**
     * Get a workflow stage by key
     */
    async findStageByKey(stageKey) {
        const query = `
            SELECT 
                ws.*,
                fs.name AS from_status_name,
                ts.name AS to_status_name
            FROM repair_workflow_stages ws
            LEFT JOIN repair_request_statuses fs ON ws.from_status_id = fs.id
            LEFT JOIN repair_request_statuses ts ON ws.to_status_id = ts.id
            WHERE ws.stage_key = $1;
        `;
        const result = await database_1.default.query(query, [stageKey]);
        return result.rows[0] || null;
    }
    /**
     * Create a new workflow stage
     */
    async createStage(data) {
        const query = `
            INSERT INTO repair_workflow_stages (
                stage_key, stage_name, description, from_status_id, to_status_id,
                action_type, icon, button_color, display_order,
                requires_notes, requires_invoice, requires_payment
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING *;
        `;
        const values = [
            data.stage_key,
            data.stage_name,
            data.description || null,
            data.from_status_id || null,
            data.to_status_id || null,
            data.action_type,
            data.icon || 'uil-check',
            data.button_color || 'success',
            data.display_order || 0,
            data.requires_notes || false,
            data.requires_invoice || false,
            data.requires_payment || false
        ];
        const result = await database_1.default.query(query, values);
        return result.rows[0];
    }
    /**
     * Update a workflow stage
     */
    async updateStage(id, data) {
        const allowedFields = [
            'stage_key', 'stage_name', 'description', 'from_status_id', 'to_status_id',
            'action_type', 'icon', 'button_color', 'display_order', 'is_active',
            'requires_notes', 'requires_invoice', 'requires_payment'
        ];
        const updates = [];
        const values = [];
        let paramIndex = 1;
        for (const field of allowedFields) {
            if (data[field] !== undefined) {
                updates.push(`${field} = $${paramIndex}`);
                values.push(data[field]);
                paramIndex++;
            }
        }
        if (updates.length === 0) {
            throw new Error('No fields to update');
        }
        updates.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(id);
        const query = `
            UPDATE repair_workflow_stages
            SET ${updates.join(', ')}
            WHERE id = $${paramIndex}
            RETURNING *;
        `;
        const result = await database_1.default.query(query, values);
        return result.rows[0];
    }
    /**
     * Delete a workflow stage
     */
    async deleteStage(id) {
        await database_1.default.query('DELETE FROM repair_workflow_stages WHERE id = $1', [id]);
    }
    /**
     * Toggle stage active status
     */
    async toggleStageActive(id) {
        const query = `
            UPDATE repair_workflow_stages
            SET is_active = NOT is_active, updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *;
        `;
        const result = await database_1.default.query(query, [id]);
        return result.rows[0];
    }
    // ========================================================================
    // WORKFLOW PERMISSIONS
    // ========================================================================
    /**
     * Get all permissions for a workflow stage
     */
    async getPermissionsByStage(stageId) {
        const query = `
            SELECT 
                wp.*,
                ws.stage_key,
                ws.stage_name,
                r.name AS role_name
            FROM repair_workflow_permissions wp
            JOIN repair_workflow_stages ws ON wp.workflow_stage_id = ws.id
            JOIN roles r ON wp.role_id = r.id
            WHERE wp.workflow_stage_id = $1
            ORDER BY r.name;
        `;
        const result = await database_1.default.query(query, [stageId]);
        return result.rows;
    }
    /**
     * Get all permissions grouped by stage
     */
    async getAllPermissions() {
        const query = `
            SELECT 
                wp.*,
                ws.stage_key,
                ws.stage_name,
                r.name AS role_name
            FROM repair_workflow_permissions wp
            JOIN repair_workflow_stages ws ON wp.workflow_stage_id = ws.id
            JOIN roles r ON wp.role_id = r.id
            ORDER BY ws.display_order, r.name;
        `;
        const result = await database_1.default.query(query);
        return result.rows;
    }
    /**
     * Get permissions for a specific role
     */
    async getPermissionsByRole(roleId) {
        const query = `
            SELECT 
                wp.*,
                ws.stage_key,
                ws.stage_name,
                r.name AS role_name
            FROM repair_workflow_permissions wp
            JOIN repair_workflow_stages ws ON wp.workflow_stage_id = ws.id
            JOIN roles r ON wp.role_id = r.id
            WHERE wp.role_id = $1 AND ws.is_active = TRUE
            ORDER BY ws.display_order;
        `;
        const result = await database_1.default.query(query, [roleId]);
        return result.rows;
    }
    /**
     * Set permission for a role on a stage
     */
    async setPermission(stageId, roleId, canExecute) {
        const query = `
            INSERT INTO repair_workflow_permissions (workflow_stage_id, role_id, can_execute)
            VALUES ($1, $2, $3)
            ON CONFLICT (workflow_stage_id, role_id) 
            DO UPDATE SET can_execute = $3
            RETURNING *;
        `;
        const result = await database_1.default.query(query, [stageId, roleId, canExecute]);
        return result.rows[0];
    }
    /**
     * Remove permission
     */
    async removePermission(stageId, roleId) {
        await database_1.default.query('DELETE FROM repair_workflow_permissions WHERE workflow_stage_id = $1 AND role_id = $2', [stageId, roleId]);
    }
    /**
     * Bulk update permissions for a stage
     */
    async bulkUpdatePermissions(stageId, rolePermissions) {
        // First, remove all existing permissions for this stage
        await database_1.default.query('DELETE FROM repair_workflow_permissions WHERE workflow_stage_id = $1', [stageId]);
        // Then insert new permissions
        for (const perm of rolePermissions) {
            if (perm.canExecute) {
                await database_1.default.query('INSERT INTO repair_workflow_permissions (workflow_stage_id, role_id, can_execute) VALUES ($1, $2, $3)', [stageId, perm.roleId, true]);
            }
        }
    }
    // ========================================================================
    // USER WORKFLOW ACCESS
    // ========================================================================
    /**
     * Get available workflow actions for a user based on their role
     * Returns the stages that the user can execute
     */
    async getUserWorkflowPermissions(roleId) {
        const query = `
            SELECT 
                ws.stage_key,
                ws.stage_name,
                ws.from_status_id,
                ws.to_status_id,
                fs.name AS from_status_name,
                ws.action_type,
                ws.icon,
                ws.button_color,
                ws.requires_notes,
                ws.requires_invoice,
                ws.requires_payment
            FROM repair_workflow_stages ws
            JOIN repair_workflow_permissions wp ON ws.id = wp.workflow_stage_id
            LEFT JOIN repair_request_statuses fs ON ws.from_status_id = fs.id
            WHERE wp.role_id = $1 
            AND wp.can_execute = TRUE
            AND ws.is_active = TRUE
            ORDER BY ws.display_order;
        `;
        const result = await database_1.default.query(query, [roleId]);
        return result.rows;
    }
    /**
     * Check if a user can perform a specific action
     */
    async canUserPerformAction(roleId, stageKey, currentStatusId) {
        const query = `
            SELECT ws.id, ws.from_status_id
            FROM repair_workflow_stages ws
            JOIN repair_workflow_permissions wp ON ws.id = wp.workflow_stage_id
            WHERE ws.stage_key = $1
            AND wp.role_id = $2
            AND wp.can_execute = TRUE
            AND ws.is_active = TRUE;
        `;
        const result = await database_1.default.query(query, [stageKey, roleId]);
        if (result.rows.length === 0) {
            return false;
        }
        const stage = result.rows[0];
        // If stage has no from_status_id (like cancel), it can be performed from multiple statuses
        if (!stage.from_status_id) {
            return true;
        }
        // Check if current status matches the required from_status
        if (currentStatusId && stage.from_status_id !== currentStatusId) {
            return false;
        }
        return true;
    }
}
exports.default = new RepairWorkflowModel();
