"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("../config/database"));
class ModuleModel {
    /**
     * Find module by ID
     */
    async findById(id) {
        const query = 'SELECT * FROM modules WHERE id = $1';
        const result = await database_1.default.query(query, [id]);
        return result.rows[0] || null;
    }
    /**
     * Find module by code
     */
    async findByCode(code) {
        const query = 'SELECT * FROM modules WHERE code = $1';
        const result = await database_1.default.query(query, [code]);
        return result.rows[0] || null;
    }
    /**
     * Find all modules (flat list)
     */
    async findAll(includeInactive = false) {
        const query = includeInactive
            ? 'SELECT * FROM modules ORDER BY display_order, name'
            : 'SELECT * FROM modules WHERE is_active = TRUE ORDER BY display_order, name';
        const result = await database_1.default.query(query);
        return result.rows;
    }
    /**
     * Find all parent modules (top-level)
     */
    async findParentModules(includeInactive = false) {
        const query = includeInactive
            ? 'SELECT * FROM modules WHERE parent_id IS NULL ORDER BY display_order, name'
            : 'SELECT * FROM modules WHERE parent_id IS NULL AND is_active = TRUE ORDER BY display_order, name';
        const result = await database_1.default.query(query);
        return result.rows;
    }
    /**
     * Find child modules for a given parent
     */
    async findByParentId(parentId, includeInactive = false) {
        const query = includeInactive
            ? 'SELECT * FROM modules WHERE parent_id = $1 ORDER BY display_order, name'
            : 'SELECT * FROM modules WHERE parent_id = $1 AND is_active = TRUE ORDER BY display_order, name';
        const result = await database_1.default.query(query, [parentId]);
        return result.rows;
    }
    /**
     * Get modules hierarchy (nested structure)
     */
    async findAllHierarchy(includeInactive = false) {
        const allModules = await this.findAll(includeInactive);
        return this.buildHierarchy(allModules);
    }
    /**
     * Build hierarchy from flat module list
     */
    buildHierarchy(modules) {
        const moduleMap = new Map();
        const rootModules = [];
        // First pass: create map of all modules
        modules.forEach(module => {
            moduleMap.set(module.id, { ...module, children: [] });
        });
        // Second pass: build hierarchy
        modules.forEach(module => {
            const moduleWithChildren = moduleMap.get(module.id);
            if (module.parent_id) {
                const parent = moduleMap.get(module.parent_id);
                if (parent) {
                    parent.children.push(moduleWithChildren);
                }
            }
            else {
                rootModules.push(moduleWithChildren);
            }
        });
        return rootModules;
    }
    /**
     * Create a new module
     */
    async create(data) {
        const query = `
      INSERT INTO modules (name, code, description, parent_id, icon, route, display_order, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
        const displayOrder = data.display_order !== undefined ? data.display_order : 0;
        const isActive = data.is_active !== undefined ? data.is_active : true;
        const result = await database_1.default.query(query, [
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
    async update(id, data) {
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
        const result = await database_1.default.query(query, [
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
    async delete(id) {
        await database_1.default.query('DELETE FROM modules WHERE id = $1', [id]);
    }
    /**
     * Toggle module active status
     */
    async toggleActive(id) {
        const query = `
      UPDATE modules
      SET is_active = NOT is_active,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *;
    `;
        const result = await database_1.default.query(query, [id]);
        return result.rows[0];
    }
    /**
     * Check if module has child modules
     */
    async hasChildren(id) {
        const query = 'SELECT COUNT(*) as count FROM modules WHERE parent_id = $1';
        const result = await database_1.default.query(query, [id]);
        return parseInt(result.rows[0].count) > 0;
    }
}
exports.default = new ModuleModel();
