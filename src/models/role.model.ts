import pool from '../config/database';

class RoleModel {
  async findByName(name: string) {
    const query = 'SELECT * FROM roles WHERE name = $1';
    const result = await pool.query(query, [name]);
    return result.rows[0];
  }

  async findById(id: number) {
    const query = 'SELECT * FROM roles WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  async findAll() {
    const query = 'SELECT * FROM roles';
    const result = await pool.query(query);
    return result.rows;
  }
}

export default new RoleModel();