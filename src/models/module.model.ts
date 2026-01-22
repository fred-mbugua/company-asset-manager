import pool from '../config/database';

export interface IModule {
  id: number;
  name: string;
  code: string;
  description?: string;
  parent_id?: number;
  icon?: string;
  route?: string;
  display_order: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ICreateModule {
  name: string;
  code: string;
  description?: string;
  parent_id?: number;
  icon?: string;
  route?: string;
  display_order?: number;
  is_active?: boolean;
}

export interface IModuleWithChildren extends IModule {
  children?: IModuleWithChildren[];
}

class ModuleModel {
  /**
   * Find module by ID
   */
  async findById(id: number): Promise<IModule | null> {
    const query = 'SELECT * FROM modules WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Find module by code
   */
  async findByCode(code: string): Promise<IModule | null> {
    const query = 'SELECT * FROM modules WHERE code = $1';
    const result = await pool.query(query, [code]);
    return result.rows[0] || null;
  }

  /**
   * Find all modules (flat list)
   */
  async findAll(includeInactive: boolean = false): Promise<IModule[]> {
    const query = includeInactive 
      ? 'SELECT * FROM modules ORDER BY display_order, name'
      : 'SELECT * FROM modules WHERE is_active = TRUE ORDER BY display_order, name';
    const result = await pool.query(query);
    return result.rows;
  }

  /**
   * Find all parent modules (top-level)
   */
  async findParentModules(includeInactive: boolean = false): Promise<IModule[]> {
    const query = includeInactive 
      ? 'SELECT * FROM modules WHERE parent_id IS NULL ORDER BY display_order, name'
      : 'SELECT * FROM modules WHERE parent_id IS NULL AND is_active = TRUE ORDER BY display_order, name';
    const result = await pool.query(query);
    return result.rows;
  }

  /**
   * Find child modules for a given parent
   */
  async findByParentId(parentId: number, includeInactive: boolean = false): Promise<IModule[]> {
    const query = includeInactive 
      ? 'SELECT * FROM modules WHERE parent_id = $1 ORDER BY display_order, name'
      : 'SELECT * FROM modules WHERE parent_id = $1 AND is_active = TRUE ORDER BY display_order, name';
    const result = await pool.query(query, [parentId]);
    return result.rows;
  }

  /**
   * Get modules hierarchy (nested structure)
   */
  async findAllHierarchy(includeInactive: boolean = false): Promise<IModuleWithChildren[]> {
    const allModules = await this.findAll(includeInactive);
    return this.buildHierarchy(allModules);
  }

  /**
   * Build hierarchy from flat module list
   */
  private buildHierarchy(modules: IModule[]): IModuleWithChildren[] {
    const moduleMap = new Map<number, IModuleWithChildren>();
    const rootModules: IModuleWithChildren[] = [];

    // First pass: create map of all modules
    modules.forEach(module => {
      moduleMap.set(module.id, { ...module, children: [] });
    });

    // Second pass: build hierarchy
    modules.forEach(module => {
      const moduleWithChildren = moduleMap.get(module.id)!;
      if (module.parent_id) {
        const parent = moduleMap.get(module.parent_id);
        if (parent) {
          parent.children!.push(moduleWithChildren);
        }
      } else {
        rootModules.push(moduleWithChildren);
      }
    });

    return rootModules;
  }

  /**
   * Create a new module
   */
  async create(data: ICreateModule): Promise<IModule> {
    const query = `
      INSERT INTO modules (name, code, description, parent_id, icon, route, display_order, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
    const displayOrder = data.display_order !== undefined ? data.display_order : 0;
    const isActive = data.is_active !== undefined ? data.is_active : true;
    const result = await pool.query(query, [
      data.name,
      data.code,
      data.description || null,
      data.parent_id || null,
      data.icon || null,
      data.route || null,
      displayOrder,
      isActive
    ]);
    return result.rows[0];
  }

  /**
   * Update a module
   */
  async update(id: number, data: Partial<IModule>): Promise<IModule> {
    const query = `
      UPDATE modules
      SET name = COALESCE($1, name),
          code = COALESCE($2, code),
          description = COALESCE($3, description),
          parent_id = COALESCE($4, parent_id),
          icon = COALESCE($5, icon),
          route = COALESCE($6, route),
          display_order = COALESCE($7, display_order),
          is_active = COALESCE($8, is_active),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $9
      RETURNING *;
    `;
    const result = await pool.query(query, [
      data.name,
      data.code,
      data.description,
      data.parent_id,
      data.icon,
      data.route,
      data.display_order,
      data.is_active,
      id
    ]);
    return result.rows[0];
  }

  /**
   * Delete a module
   */
  async delete(id: number): Promise<void> {
    await pool.query('DELETE FROM modules WHERE id = $1', [id]);
  }

  /**
   * Toggle module active status
   */
  async toggleActive(id: number): Promise<IModule> {
    const query = `
      UPDATE modules
      SET is_active = NOT is_active,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *;
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  /**
   * Check if module has child modules
   */
  async hasChildren(id: number): Promise<boolean> {
    const query = 'SELECT COUNT(*) as count FROM modules WHERE parent_id = $1';
    const result = await pool.query(query, [id]);
    return parseInt(result.rows[0].count) > 0;
  }
}

export default new ModuleModel();
