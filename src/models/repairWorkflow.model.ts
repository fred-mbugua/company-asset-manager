import db from '../config/database';
import logger from '../utils/logger';

// ============================================================================
// INTERFACES
// ============================================================================

export interface IWorkflowStage {
    id: number;
    stage_key: string;
    stage_name: string;
    description?: string;
    from_status_id?: number;
    to_status_id?: number;
    action_type: string;
    icon: string;
    button_color: string;
    display_order: number;
    is_active: boolean;
    requires_notes: boolean;
    requires_invoice: boolean;
    requires_payment: boolean;
    created_at: Date;
    updated_at: Date;
    // Joined fields
    from_status_name?: string;
    to_status_name?: string;
}

export interface IWorkflowPermission {
    id: number;
    workflow_stage_id: number;
    role_id: number;
    can_execute: boolean;
    created_at: Date;
    // Joined fields
    stage_key?: string;
    stage_name?: string;
    role_name?: string;
}

export interface ICreateWorkflowStage {
    stage_key: string;
    stage_name: string;
    description?: string;
    from_status_id?: number;
    to_status_id?: number;
    action_type: string;
    icon?: string;
    button_color?: string;
    display_order?: number;
    requires_notes?: boolean;
    requires_invoice?: boolean;
    requires_payment?: boolean;
}

export interface IUserWorkflowPermissions {
    stage_key: string;
    stage_name: string;
    from_status_id: number | null;
    to_status_id: number | null;
    from_status_name: string | null;
    action_type: string;
    icon: string;
    button_color: string;
    requires_notes: boolean;
    requires_invoice: boolean;
    requires_payment: boolean;
}

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
    async findAllStages(includeInactive: boolean = false): Promise<IWorkflowStage[]> {
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
        const result = await db.query(query);
        return result.rows;
    }

    /**
     * Get a single workflow stage by ID
     */
    async findStageById(id: number): Promise<IWorkflowStage | null> {
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
        const result = await db.query(query, [id]);
        return result.rows[0] || null;
    }

    /**
     * Get a workflow stage by key
     */
    async findStageByKey(stageKey: string): Promise<IWorkflowStage | null> {
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
        const result = await db.query(query, [stageKey]);
        return result.rows[0] || null;
    }

    /**
     * Create a new workflow stage
     */
    async createStage(data: ICreateWorkflowStage): Promise<IWorkflowStage> {
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
        const result = await db.query(query, values);
        return result.rows[0];
    }

    /**
     * Update a workflow stage
     */
    async updateStage(id: number, data: Partial<IWorkflowStage>): Promise<IWorkflowStage> {
        const allowedFields = [
            'stage_key', 'stage_name', 'description', 'from_status_id', 'to_status_id',
            'action_type', 'icon', 'button_color', 'display_order', 'is_active',
            'requires_notes', 'requires_invoice', 'requires_payment'
        ];
        
        const updates: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        for (const field of allowedFields) {
            if (data[field as keyof IWorkflowStage] !== undefined) {
                updates.push(`${field} = $${paramIndex}`);
                values.push(data[field as keyof IWorkflowStage]);
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

        const result = await db.query(query, values);
        return result.rows[0];
    }

    /**
     * Delete a workflow stage
     */
    async deleteStage(id: number): Promise<void> {
        await db.query('DELETE FROM repair_workflow_stages WHERE id = $1', [id]);
    }

    /**
     * Toggle stage active status
     */
    async toggleStageActive(id: number): Promise<IWorkflowStage> {
        const query = `
            UPDATE repair_workflow_stages
            SET is_active = NOT is_active, updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *;
        `;
        const result = await db.query(query, [id]);
        return result.rows[0];
    }

    // ========================================================================
    // WORKFLOW PERMISSIONS
    // ========================================================================

    /**
     * Get all permissions for a workflow stage
     */
    async getPermissionsByStage(stageId: number): Promise<IWorkflowPermission[]> {
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
        const result = await db.query(query, [stageId]);
        return result.rows;
    }

    /**
     * Get all permissions grouped by stage
     */
    async getAllPermissions(): Promise<IWorkflowPermission[]> {
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
        const result = await db.query(query);
        return result.rows;
    }

    /**
     * Get permissions for a specific role
     */
    async getPermissionsByRole(roleId: number): Promise<IWorkflowPermission[]> {
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
        const result = await db.query(query, [roleId]);
        return result.rows;
    }

    /**
     * Set permission for a role on a stage
     */
    async setPermission(stageId: number, roleId: number, canExecute: boolean): Promise<IWorkflowPermission> {
        const query = `
            INSERT INTO repair_workflow_permissions (workflow_stage_id, role_id, can_execute)
            VALUES ($1, $2, $3)
            ON CONFLICT (workflow_stage_id, role_id) 
            DO UPDATE SET can_execute = $3
            RETURNING *;
        `;
        const result = await db.query(query, [stageId, roleId, canExecute]);
        return result.rows[0];
    }

    /**
     * Remove permission
     */
    async removePermission(stageId: number, roleId: number): Promise<void> {
        await db.query(
            'DELETE FROM repair_workflow_permissions WHERE workflow_stage_id = $1 AND role_id = $2',
            [stageId, roleId]
        );
    }

    /**
     * Bulk update permissions for a stage
     */
    async bulkUpdatePermissions(stageId: number, rolePermissions: { roleId: number; canExecute: boolean }[]): Promise<void> {
        // First, remove all existing permissions for this stage
        await db.query('DELETE FROM repair_workflow_permissions WHERE workflow_stage_id = $1', [stageId]);

        // Then insert new permissions
        for (const perm of rolePermissions) {
            if (perm.canExecute) {
                await db.query(
                    'INSERT INTO repair_workflow_permissions (workflow_stage_id, role_id, can_execute) VALUES ($1, $2, $3)',
                    [stageId, perm.roleId, true]
                );
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
    async getUserWorkflowPermissions(roleId: number): Promise<IUserWorkflowPermissions[]> {
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
        const result = await db.query(query, [roleId]);
        return result.rows;
    }

    /**
     * Check if a user can perform a specific action
     */
    async canUserPerformAction(roleId: number, stageKey: string, currentStatusId?: number): Promise<boolean> {
        const query = `
            SELECT ws.id, ws.from_status_id
            FROM repair_workflow_stages ws
            JOIN repair_workflow_permissions wp ON ws.id = wp.workflow_stage_id
            WHERE ws.stage_key = $1
            AND wp.role_id = $2
            AND wp.can_execute = TRUE
            AND ws.is_active = TRUE;
        `;
        const result = await db.query(query, [stageKey, roleId]);
        
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

export default new RepairWorkflowModel();
