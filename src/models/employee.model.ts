import pool from '../config/database';

class EmployeeModel {

    async create(employeeData: any) {
        const query = `
            INSERT INTO employees (first_name, middle_name, last_name, branch_location, department, department_id, branch_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `;
        const values = [
            employeeData.first_name,
            employeeData.middle_name,
            employeeData.last_name,
            employeeData.branch_location,
            employeeData.department,
            employeeData.department_id,
            employeeData.branch_id
        ];
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    async update(employeeData: any) {
        const fields: string[] = [];
        const values: any[] = [];
        let paramCount = 1;

        if (employeeData.first_name !== undefined) {
            fields.push(`first_name = $${paramCount++}`);
            values.push(employeeData.first_name);
        }
        if (employeeData.middle_name !== undefined) {
            fields.push(`middle_name = $${paramCount++}`);
            values.push(employeeData.middle_name);
        }
        if (employeeData.last_name !== undefined) {
            fields.push(`last_name = $${paramCount++}`);
            values.push(employeeData.last_name);
        }
        if (employeeData.branch_location !== undefined) {
            fields.push(`branch_location = $${paramCount++}`);
            values.push(employeeData.branch_location);
        }
        if (employeeData.department !== undefined) {
            fields.push(`department = $${paramCount++}`);
            values.push(employeeData.department);
        }
        if (employeeData.department_id !== undefined) {
            fields.push(`department_id = $${paramCount++}`);
            values.push(employeeData.department_id);
        }
        if (employeeData.branch_id !== undefined) {
            fields.push(`branch_id = $${paramCount++}`);
            values.push(employeeData.branch_id);
        }

        if (fields.length === 0) {
            throw new Error('No fields to update');
        }

        values.push(employeeData.employee_id); // For WHERE clause
        const query = `
            UPDATE employees 
            SET ${fields.join(', ')}
            WHERE id = $${paramCount}
            RETURNING *;
        `;
        
        const result = await pool.query(query, values);

        // console.log('Employee update query executed:', query, values);
        return result.rows[0];
    }

    async findById(id: string) {
        const query = `
            SELECT 
                employees.*,
                branches.name AS branch_name,
                branches.location AS branch_location
            FROM employees
            LEFT JOIN branches ON employees.branch_id = branches.id
            WHERE employees.id = $1
        `;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    async findAll() {
        const query = 'SELECT * FROM employees ORDER BY first_name ASC';
        const result = await pool.query(query);
        return result.rows;
    }

    async findEmployeesSpecificData() {
        const query = `Select
    emp.*,
    users.email As emp_email
From
    employees emp Inner Join
    users On users.employee_id = emp.id
     ORDER BY first_name ASC`;
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