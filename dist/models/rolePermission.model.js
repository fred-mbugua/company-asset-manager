"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("../config/database"));
class RolePermissionModel {
    /**
     * Find role permission by ID
     */
    async findById(id) {
        const query = 'SELECT * FROM role_permissions WHERE id = $1';
        const result = await database_1.default.query(query, [id]);
        return result.rows[0] || null;
    }
    /**
     * Find role permission by role and permission IDs
     */
    async findByRoleAndPermission(roleId, permissionId) {
        const query = 'SELECT * FROM role_permissions WHERE role_id = $1 AND permission_id = $2';
        const result = await database_1.default.query(query, [roleId, permissionId]);
        return result.rows[0] || null;
    }
    /**
     * Find all permissions for a role
     */
    async findByRoleId(roleId) {
        const query = 'SELECT * FROM role_permissions WHERE role_id = $1';
        const result = await database_1.default.query(query, [roleId]);
        return result.rows;
    }
    /**
     * Find all permissions for a role with module details
     */
    async findByRoleIdWithDetails(roleId) {
        const query = `
      SELECT 
        rp.*,
        p.module_id,
        p.action,
        p.description as permission_description,
        m.name as module_name,
        m.code as module_code,
        m.route as module_route
      FROM role_permissions rp
      JOIN permissions p ON rp.permission_id = p.id
      JOIN modules m ON p.module_id = m.id
      WHERE rp.role_id = $1 AND p.is_active = TRUE AND m.is_active = TRUE
      ORDER BY m.display_order, m.name, p.action
    `;
        const result = await database_1.default.query(query, [roleId]);
        return result.rows;
    }
    /**
     * Check if a role has a specific permission
     */
    async hasPermission(roleId, moduleCode, action) {
        const query = `
      SELECT rp.*, m.code as module_code
      FROM role_permissions rp
      JOIN permissions p ON rp.permission_id = p.id
      JOIN modules m ON p.module_id = m.id
      WHERE rp.role_id = $1 AND m.code = $2 AND p.action = $3
        AND p.is_active = TRUE AND m.is_active = TRUE
    `;
        const result = await database_1.default.query(query, [roleId, moduleCode, action]);
        if (result.rows.length === 0) {
            return { hasAccess: false, branchLevelAccess: false };
        }
        return {
            hasAccess: true,
            branchLevelAccess: result.rows[0].branch_level_access
        };
    }
    /**
     * Get all permissions for a role grouped by module
     */
    async getPermissionsGroupedByModule(roleId) {
        const allPermissionsQuery = `
      SELECT 
        p.id as permission_id,
        p.action,
        m.code as module_code,
        m.name as module_name,
        m.route as module_route,
        m.display_order
      FROM permissions p
      JOIN modules m ON p.module_id = m.id
      WHERE p.is_active = TRUE AND m.is_active = TRUE
      ORDER BY m.display_order, m.name, p.action
    `;
        const rolePermissionsQuery = `
      SELECT 
        rp.permission_id,
        rp.branch_level_access
      FROM role_permissions rp
      WHERE rp.role_id = $1
    `;
        const [allPerms, rolePerms] = await Promise.all([
            database_1.default.query(allPermissionsQuery),
            database_1.default.query(rolePermissionsQuery, [roleId])
        ]);
        const rolePermMap = new Map();
        rolePerms.rows.forEach((rp) => {
            rolePermMap.set(rp.permission_id, rp.branch_level_access);
        });
        // Group by module
        const moduleMap = new Map();
        allPerms.rows.forEach((perm) => {
            if (!moduleMap.has(perm.module_code)) {
                moduleMap.set(perm.module_code, {
                    module_code: perm.module_code,
                    module_name: perm.module_name,
                    module_route: perm.module_route,
                    actions: []
                });
            }
            const module = moduleMap.get(perm.module_code);
            module.actions.push({
                action: perm.action,
                has_permission: rolePermMap.has(perm.permission_id),
                branch_level_access: rolePermMap.get(perm.permission_id) || false,
                permission_id: perm.permission_id
            });
        });
        return Array.from(moduleMap.values());
    }
    /**
     * Create a new role permission
     */
    async create(data) {
        const query = `
      INSERT INTO role_permissions (role_id, permission_id, branch_level_access)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
        const branchLevelAccess = data.branch_level_access !== undefined ? data.branch_level_access : false;
        const result = await database_1.default.query(query, [
            data.role_id,
            data.permission_id,
            branchLevelAccess
        ]);
        return result.rows[0];
    }
    /**
     * Update a role permission
     */
    async update(id, data) {
        const query = `
      UPDATE role_permissions
      SET branch_level_access = COALESCE($1, branch_level_access),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *;
    `;
        const result = await database_1.default.query(query, [data.branch_level_access, id]);
        return result.rows[0];
    }
    /**
     * Delete a role permission
     */
    async delete(id) {
        await database_1.default.query('DELETE FROM role_permissions WHERE id = $1', [id]);
    }
    /**
     * Delete all permissions for a role
     */
    async deleteByRoleId(roleId) {
        await database_1.default.query('DELETE FROM role_permissions WHERE role_id = $1', [roleId]);
    }
    /**
     * Bulk assign permissions to a role (replaces existing permissions)
     */
    async bulkAssign(roleId, permissionConfigs) {
        // Start transaction
        const client = await database_1.default.connect();
        try {
            await client.query('BEGIN');
            // Delete existing permissions for this role
            await client.query('DELETE FROM role_permissions WHERE role_id = $1', [roleId]);
            // Insert new permissions
            const results = [];
            for (const config of permissionConfigs) {
                const result = await client.query('INSERT INTO role_permissions (role_id, permission_id, branch_level_access) VALUES ($1, $2, $3) RETURNING *', [roleId, config.permission_id, config.branch_level_access]);
                results.push(result.rows[0]);
            }
            await client.query('COMMIT');
            return results;
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    /**
     * Get all accessible module routes for a role
     */
    async getAccessibleRoutes(roleId) {
        const query = `
      SELECT DISTINCT m.route, array_agg(DISTINCT p.action) as actions
      FROM role_permissions rp
      JOIN permissions p ON rp.permission_id = p.id
      JOIN modules m ON p.module_id = m.id
      WHERE rp.role_id = $1 AND m.route IS NOT NULL
        AND p.is_active = TRUE AND m.is_active = TRUE
      GROUP BY m.route
    `;
        const result = await database_1.default.query(query, [roleId]);
        return result.rows;
    }
    /**
     * Clone permissions from one role to another
     */
    async clonePermissions(fromRoleId, toRoleId) {
        const sourcePermissions = await this.findByRoleId(fromRoleId);
        const permissionConfigs = sourcePermissions.map(p => ({
            permission_id: p.permission_id,
            branch_level_access: p.branch_level_access
        }));
        return this.bulkAssign(toRoleId, permissionConfigs);
    }
}
exports.default = new RolePermissionModel();
