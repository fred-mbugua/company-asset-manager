import pool from '../config/database';

export interface IRole {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ICreateRole {
  name: string;
  description?: string;
  is_active?: boolean;
}

class RoleModel {
  async findByName(name: string): Promise<IRole | null> {
    const query = 'SELECT * FROM roles WHERE name = $1';
    const result = await pool.query(query, [name]);
    return result.rows[0] || null;
  }

  async findById(id: number): Promise<IRole | null> {
    const query = 'SELECT * FROM roles WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async findAll(includeInactive: boolean = false): Promise<IRole[]> {
    const query = includeInactive 
      ? 'SELECT * FROM roles ORDER BY name'
      : 'SELECT * FROM roles WHERE is_active = TRUE ORDER BY name';
    const result = await pool.query(query);
    return result.rows;
  }

  async create(data: ICreateRole): Promise<IRole> {
    const query = `
      INSERT INTO roles (name, description, is_active)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const isActive = data.is_active !== undefined ? data.is_active : true;
    const result = await pool.query(query, [data.name, data.description || null, isActive]);
    return result.rows[0];
  }

  async update(id: number, data: Partial<IRole>): Promise<IRole> {
    const query = `
      UPDATE roles
      SET name = COALESCE($1, name),
          description = COALESCE($2, description),
          is_active = COALESCE($3, is_active),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *;
    `;
    const result = await pool.query(query, [data.name, data.description, data.is_active, id]);
    return result.rows[0];
  }

  async delete(id: number): Promise<void> {
    await pool.query('DELETE FROM roles WHERE id = $1', [id]);
  }

  async toggleActive(id: number): Promise<IRole> {
    const query = `
      UPDATE roles
      SET is_active = NOT is_active,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *;
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  async countUsersWithRole(roleId: number): Promise<number> {
    const query = 'SELECT COUNT(*) as count FROM users WHERE role_id = $1';
    const result = await pool.query(query, [roleId]);
    return parseInt(result.rows[0].count);
  }
}

export default new RoleModel();