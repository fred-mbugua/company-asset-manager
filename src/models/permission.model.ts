import pool from '../config/database';

/**
 * Permission actions that can be assigned
 */
export type PermissionAction = 'read' | 'create' | 'update' | 'delete';

export interface IPermission {
  id: number;
  module_id: number;
  action: PermissionAction;
  description?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface IPermissionWithModule extends IPermission {
  module_name: string;
  module_code: string;
  module_route?: string;
}

export interface ICreatePermission {
  module_id: number;
  action: PermissionAction;
  description?: string;
  is_active?: boolean;
}

class PermissionModel {
  /**
   * Find permission by ID
   */
  async findById(id: number): Promise<IPermission | null> {
    const query = 'SELECT * FROM permissions WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Find permission by module and action
   */
  async findByModuleAndAction(moduleId: number, action: PermissionAction): Promise<IPermission | null> {
    const query = 'SELECT * FROM permissions WHERE module_id = $1 AND action = $2';
    const result = await pool.query(query, [moduleId, action]);
    return result.rows[0] || null;
  }

  /**
   * Find all permissions
   */
  async findAll(includeInactive: boolean = false): Promise<IPermission[]> {
    const query = includeInactive 
      ? 'SELECT * FROM permissions ORDER BY module_id, action'
      : 'SELECT * FROM permissions WHERE is_active = TRUE ORDER BY module_id, action';
    const result = await pool.query(query);
    return result.rows;
  }

  /**
   * Find all permissions with module details
   */
  async findAllWithModules(includeInactive: boolean = false): Promise<IPermissionWithModule[]> {
    const query = includeInactive 
      ? `SELECT p.*, m.name as module_name, m.code as module_code, m.route as module_route
         FROM permissions p
         JOIN modules m ON p.module_id = m.id
         ORDER BY m.display_order, m.name, p.action`
      : `SELECT p.*, m.name as module_name, m.code as module_code, m.route as module_route
         FROM permissions p
         JOIN modules m ON p.module_id = m.id
         WHERE p.is_active = TRUE AND m.is_active = TRUE
         ORDER BY m.display_order, m.name, p.action`;
    const result = await pool.query(query);
    return result.rows;
  }

  /**
   * Find permissions by module ID
   */
  async findByModuleId(moduleId: number, includeInactive: boolean = false): Promise<IPermission[]> {
    const query = includeInactive 
      ? 'SELECT * FROM permissions WHERE module_id = $1 ORDER BY action'
      : 'SELECT * FROM permissions WHERE module_id = $1 AND is_active = TRUE ORDER BY action';
    const result = await pool.query(query, [moduleId]);
    return result.rows;
  }

  /**
   * Create a new permission
   */
  async create(data: ICreatePermission): Promise<IPermission> {
    const query = `
      INSERT INTO permissions (module_id, action, description, is_active)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const isActive = data.is_active !== undefined ? data.is_active : true;
    const result = await pool.query(query, [
      data.module_id,
      data.action,
      data.description || null,
      isActive
    ]);
    return result.rows[0];
  }

  /**
   * Update a permission
   */
  async update(id: number, data: Partial<IPermission>): Promise<IPermission> {
    const query = `
      UPDATE permissions
      SET module_id = COALESCE($1, module_id),
          action = COALESCE($2, action),
          description = COALESCE($3, description),
          is_active = COALESCE($4, is_active),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *;
    `;
    const result = await pool.query(query, [
      data.module_id,
      data.action,
      data.description,
      data.is_active,
      id
    ]);
    return result.rows[0];
  }

  /**
   * Delete a permission
   */
  async delete(id: number): Promise<void> {
    await pool.query('DELETE FROM permissions WHERE id = $1', [id]);
  }

  /**
   * Toggle permission active status
   */
  async toggleActive(id: number): Promise<IPermission> {
    const query = `
      UPDATE permissions
      SET is_active = NOT is_active,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *;
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  /**
   * Bulk create permissions for a module (all actions)
   */
  async bulkCreateForModule(moduleId: number, actions: PermissionAction[] = ['read', 'create', 'update', 'delete']): Promise<IPermission[]> {
    const permissions: IPermission[] = [];
    for (const action of actions) {
      const existing = await this.findByModuleAndAction(moduleId, action);
      if (!existing) {
        const permission = await this.create({ module_id: moduleId, action });
        permissions.push(permission);
      }
    }
    return permissions;
  }
}

export default new PermissionModel();
