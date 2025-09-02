import pool from '../config/database';

class EmployeeModel {
  async findById(id: string) {
    const query = 'SELECT * FROM employees WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  async findAll() {
    const query = 'SELECT * FROM employees ORDER BY full_name ASC';
    const result = await pool.query(query);
    return result.rows;
  }

  async findByLocation(location: string) {
    const query = 'SELECT * FROM employees WHERE branch_location = $1';
    const result = await pool.query(query, [location]);
    return result.rows;
  }
}

export default new EmployeeModel();