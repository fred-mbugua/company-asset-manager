import pool from '../config/database';
import { PermissionAction, IPermissionWithModule } from './permission.model';

export interface IRolePermission {
  id: number;
  role_id: number;
  permission_id: number;
  branch_level_access: boolean;  // If true, data is filtered by user's branch
  company_level_access: boolean; // If true, data is filtered by accessible companies
  created_at: Date;
  updated_at: Date;
}

export interface IRolePermissionWithDetails extends IRolePermission {
  module_id: number;
  module_name: string;
  module_code: string;
  module_route?: string;
  action: PermissionAction;
  permission_description?: string;
}

export interface ICreateRolePermission {
  role_id: number;
  permission_id: number;
  branch_level_access?: boolean;
  company_level_access?: boolean;
}

export interface IRolePermissionBulkAssign {
  role_id: number;
  permission_ids: number[];
  branch_level_access?: boolean;
}

/**
 * Grouped role permissions by module for easy checking
 */
export interface IRolePermissionGrouped {
  module_code: string;
  module_name: string;
  module_route?: string;
  actions: {
    action: PermissionAction;
    has_permission: boolean;
    branch_level_access: boolean;
    company_level_access: boolean;
    permission_id: number;
  }[];
}

class RolePermissionModel {
  /**
   * Find role permission by ID
   */
  async findById(id: number): Promise<IRolePermission | null> {
    const query = 'SELECT * FROM role_permissions WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Find role permission by role and permission IDs
   */
  async findByRoleAndPermission(roleId: number, permissionId: number): Promise<IRolePermission | null> {
    const query = 'SELECT * FROM role_permissions WHERE role_id = $1 AND permission_id = $2';
    const result = await pool.query(query, [roleId, permissionId]);
    return result.rows[0] || null;
  }

  /**
   * Find all permissions for a role
   */
  async findByRoleId(roleId: number): Promise<IRolePermission[]> {
    const query = 'SELECT * FROM role_permissions WHERE role_id = $1';
    const result = await pool.query(query, [roleId]);
    return result.rows;
  }

  /**
   * Find all permissions for a role with module details
   */
  async findByRoleIdWithDetails(roleId: number): Promise<IRolePermissionWithDetails[]> {
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
    const result = await pool.query(query, [roleId]);
    return result.rows;
  }

  /**
   * Check if a role has a specific permission
   */
  async hasPermission(roleId: number, moduleCode: string, action: PermissionAction): Promise<{ hasAccess: boolean; branchLevelAccess: boolean }> {
    const query = `
      SELECT rp.*, m.code as module_code
      FROM role_permissions rp
      JOIN permissions p ON rp.permission_id = p.id
      JOIN modules m ON p.module_id = m.id
      WHERE rp.role_id = $1 AND m.code = $2 AND p.action = $3
        AND p.is_active = TRUE AND m.is_active = TRUE
    `;
    const result = await pool.query(query, [roleId, moduleCode, action]);
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
  async getPermissionsGroupedByModule(roleId: number): Promise<IRolePermissionGrouped[]> {
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
        rp.branch_level_access,
        rp.company_level_access
      FROM role_permissions rp
      WHERE rp.role_id = $1
    `;

    const [allPerms, rolePerms] = await Promise.all([
      pool.query(allPermissionsQuery),
      pool.query(rolePermissionsQuery, [roleId])
    ]);

    const rolePermMap = new Map<number, { branch: boolean; company: boolean }>();
    rolePerms.rows.forEach((rp: { permission_id: number; branch_level_access: boolean; company_level_access: boolean }) => {
      rolePermMap.set(rp.permission_id, { 
        branch: rp.branch_level_access, 
        company: rp.company_level_access || false 
      });
    });

    // Group by module
    const moduleMap = new Map<string, IRolePermissionGrouped>();
    
    allPerms.rows.forEach((perm: any) => {
      if (!moduleMap.has(perm.module_code)) {
        moduleMap.set(perm.module_code, {
          module_code: perm.module_code,
          module_name: perm.module_name,
          module_route: perm.module_route,
          actions: []
        });
      }
      
      const module = moduleMap.get(perm.module_code)!;
      const permData = rolePermMap.get(perm.permission_id);
      module.actions.push({
        action: perm.action,
        has_permission: rolePermMap.has(perm.permission_id),
        branch_level_access: permData?.branch || false,
        company_level_access: permData?.company || false,
        permission_id: perm.permission_id
      });
    });

    return Array.from(moduleMap.values());
  }

  /**
   * Create a new role permission
   */
  async create(data: ICreateRolePermission): Promise<IRolePermission> {
    const query = `
      INSERT INTO role_permissions (role_id, permission_id, branch_level_access)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const branchLevelAccess = data.branch_level_access !== undefined ? data.branch_level_access : false;
    const result = await pool.query(query, [
      data.role_id,
      data.permission_id,
      branchLevelAccess
    ]);
    return result.rows[0];
  }

  /**
   * Update a role permission
   */
  async update(id: number, data: Partial<IRolePermission>): Promise<IRolePermission> {
    const query = `
      UPDATE role_permissions
      SET branch_level_access = COALESCE($1, branch_level_access),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *;
    `;
    const result = await pool.query(query, [data.branch_level_access, id]);
    return result.rows[0];
  }

  /**
   * Update branch level access for all permissions of a specific module for a role
   */
  async updateBranchAccessByModule(roleId: number, moduleCode: string, branchLevelAccess: boolean): Promise<void> {
    const query = `
      UPDATE role_permissions rp
      SET branch_level_access = $3,
          updated_at = CURRENT_TIMESTAMP
      FROM permissions p
      WHERE rp.permission_id = p.id
        AND rp.role_id = $1
        AND p.module_code = $2;
    `;
    await pool.query(query, [roleId, moduleCode, branchLevelAccess]);
  }

  /**
   * Update company level access for all permissions of a specific module for a role
   */
  async updateCompanyAccessByModule(roleId: number, moduleCode: string, companyLevelAccess: boolean): Promise<void> {
    const query = `
      UPDATE role_permissions rp
      SET company_level_access = $3,
          updated_at = CURRENT_TIMESTAMP
      FROM permissions p
      WHERE rp.permission_id = p.id
        AND rp.role_id = $1
        AND p.module_code = $2;
    `;
    await pool.query(query, [roleId, moduleCode, companyLevelAccess]);
  }

  /**
   * Delete a role permission
   */
  async delete(id: number): Promise<void> {
    await pool.query('DELETE FROM role_permissions WHERE id = $1', [id]);
  }

  /**
   * Delete all permissions for a role
   */
  async deleteByRoleId(roleId: number): Promise<void> {
    await pool.query('DELETE FROM role_permissions WHERE role_id = $1', [roleId]);
  }

  /**
   * Bulk assign permissions to a role (replaces existing permissions)
   */
  async bulkAssign(roleId: number, permissionConfigs: { permission_id: number; branch_level_access: boolean; company_level_access?: boolean }[]): Promise<IRolePermission[]> {
    // Start transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Delete existing permissions for this role
      await client.query('DELETE FROM role_permissions WHERE role_id = $1', [roleId]);

      // Insert new permissions
      const results: IRolePermission[] = [];
      for (const config of permissionConfigs) {
        const result = await client.query(
          'INSERT INTO role_permissions (role_id, permission_id, branch_level_access, company_level_access) VALUES ($1, $2, $3, $4) RETURNING *',
          [roleId, config.permission_id, config.branch_level_access, config.company_level_access || false]
        );
        results.push(result.rows[0]);
      }

      await client.query('COMMIT');
      return results;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get all accessible module routes for a role
   */
  async getAccessibleRoutes(roleId: number): Promise<{ route: string; actions: PermissionAction[] }[]> {
    const query = `
      SELECT DISTINCT m.route, array_agg(DISTINCT p.action) as actions
      FROM role_permissions rp
      JOIN permissions p ON rp.permission_id = p.id
      JOIN modules m ON p.module_id = m.id
      WHERE rp.role_id = $1 AND m.route IS NOT NULL
        AND p.is_active = TRUE AND m.is_active = TRUE
      GROUP BY m.route
    `;
    const result = await pool.query(query, [roleId]);
    return result.rows;
  }

  /**
   * Clone permissions from one role to another
   */
  async clonePermissions(fromRoleId: number, toRoleId: number): Promise<IRolePermission[]> {
    const sourcePermissions = await this.findByRoleId(fromRoleId);
    const permissionConfigs = sourcePermissions.map(p => ({
      permission_id: p.permission_id,
      branch_level_access: p.branch_level_access,
      company_level_access: p.company_level_access
    }));
    return this.bulkAssign(toRoleId, permissionConfigs);
  }

  /**
   * Get company access for a role
   */
  async getCompanyAccess(roleId: number): Promise<{ company_id: number; company_name: string }[]> {
    const query = `
      SELECT rca.company_id, c.name as company_name
      FROM role_company_access rca
      JOIN companies c ON rca.company_id = c.id
      WHERE rca.role_id = $1
      ORDER BY c.name
    `;
    const result = await pool.query(query, [roleId]);
    return result.rows;
  }

  /**
   * Update company access for a role (replaces existing)
   */
  async updateCompanyAccess(roleId: number, companyIds: number[]): Promise<{ company_id: number; company_name: string }[]> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Delete existing company access
      await client.query('DELETE FROM role_company_access WHERE role_id = $1', [roleId]);

      // Insert new company access
      for (const companyId of companyIds) {
        await client.query(
          'INSERT INTO role_company_access (role_id, company_id) VALUES ($1, $2)',
          [roleId, companyId]
        );
      }

      await client.query('COMMIT');

      // Return updated company access
      return this.getCompanyAccess(roleId);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

export default new RolePermissionModel();
