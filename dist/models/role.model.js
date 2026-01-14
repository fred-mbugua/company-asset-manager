"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("../config/database"));
class RoleModel {
    async findByName(name) {
        const query = 'SELECT * FROM roles WHERE name = $1';
        const result = await database_1.default.query(query, [name]);
        return result.rows[0] || null;
    }
    async findById(id) {
        const query = 'SELECT * FROM roles WHERE id = $1';
        const result = await database_1.default.query(query, [id]);
        return result.rows[0] || null;
    }
    async findAll(includeInactive = false) {
        const query = includeInactive
            ? 'SELECT * FROM roles ORDER BY name'
            : 'SELECT * FROM roles WHERE is_active = TRUE ORDER BY name';
        const result = await database_1.default.query(query);
        return result.rows;
    }
    async create(data) {
        const query = `
      INSERT INTO roles (name, description, is_active)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
        const isActive = data.is_active !== undefined ? data.is_active : true;
        const result = await database_1.default.query(query, [data.name, data.description || null, isActive]);
        return result.rows[0];
    }
    async update(id, data) {
        const query = `
      UPDATE roles
      SET name = COALESCE($1, name),
          description = COALESCE($2, description),
          is_active = COALESCE($3, is_active),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *;
    `;
        const result = await database_1.default.query(query, [data.name, data.description, data.is_active, id]);
        return result.rows[0];
    }
    async delete(id) {
        await database_1.default.query('DELETE FROM roles WHERE id = $1', [id]);
    }
    async toggleActive(id) {
        const query = `
      UPDATE roles
      SET is_active = NOT is_active,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *;
    `;
        const result = await database_1.default.query(query, [id]);
        return result.rows[0];
    }
    async countUsersWithRole(roleId) {
        const query = 'SELECT COUNT(*) as count FROM users WHERE role_id = $1';
        const result = await database_1.default.query(query, [roleId]);
        return parseInt(result.rows[0].count);
    }
}
exports.default = new RoleModel();
