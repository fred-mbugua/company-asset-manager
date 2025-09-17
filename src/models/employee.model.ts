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

  async findByEmployeeId(employeeId: string) {
        const query = `
            SELECT
                A.id,
                A.asset_tag,
                A.asset_type,
                A.manufacturer,
                A.model,
                A.serial_number,
                A.status,
                A.location,
                A.purchase_date,
                A.purchase_price,
                A.notes,
                E.id AS employee_id
            FROM
                assets AS A
            INNER JOIN
                assignments AS ASGN ON ASGN.asset_id = A.id
            INNER JOIN
                employees AS E ON ASGN.employee_id = E.id
            WHERE
                E.id = $1
            ORDER BY
                A.id DESC;
        `;
        const result = await pool.query(query, [employeeId]);
        return result.rows;
    }
}

export default new EmployeeModel();