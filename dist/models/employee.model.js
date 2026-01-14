"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("../config/database"));
class EmployeeModel {
    async create(employeeData) {
        const query = `
            INSERT INTO employees (first_name, middle_name, last_name, branch_location, department, department_id, branch_id, company)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *;
        `;
        const values = [
            employeeData.first_name,
            employeeData.middle_name,
            employeeData.last_name,
            employeeData.branch_location || null,
            employeeData.department || null,
            employeeData.department_id || null,
            employeeData.branch_id || null,
            employeeData.company || 'Jirani'
        ];
        const result = await database_1.default.query(query, values);
        return result.rows[0];
    }
    async bulkCreate(employees) {
        const client = await database_1.default.connect();
        try {
            await client.query('BEGIN');
            const results = [];
            for (const emp of employees) {
                const query = `
                    INSERT INTO employees (first_name, middle_name, last_name, branch_location, department, department_id, branch_id, company)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                    RETURNING *;
                `;
                const values = [
                    emp.first_name,
                    emp.middle_name || '',
                    emp.last_name,
                    emp.branch_location || '',
                    emp.department || '',
                    emp.department_id || null,
                    emp.branch_id,
                    emp.company || 'Jirani'
                ];
                const result = await client.query(query, values);
                results.push(result.rows[0]);
            }
            await client.query('COMMIT');
            return results;
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    async findAllCompanies() {
        const query = `SELECT DISTINCT name FROM companies WHERE is_active = true ORDER BY name ASC`;
        const result = await database_1.default.query(query);
        return result.rows.map(row => row.name);
    }
    async findAllCompaniesWithId() {
        const query = `SELECT id, name FROM companies WHERE is_active = true ORDER BY name ASC`;
        const result = await database_1.default.query(query);
        return result.rows;
    }
    async findCompanyByName(name) {
        const query = `SELECT id, name FROM companies WHERE LOWER(name) = LOWER($1) AND is_active = true LIMIT 1`;
        const result = await database_1.default.query(query, [name]);
        return result.rows[0] || null;
    }
    async getDefaultCompany() {
        const query = `SELECT id, name FROM companies WHERE name = 'Jirani Smart' AND is_active = true LIMIT 1`;
        const result = await database_1.default.query(query);
        return result.rows[0] || null;
    }
    async update(employeeData) {
        const fields = [];
        const values = [];
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
        if (employeeData.company !== undefined) {
            fields.push(`company = $${paramCount++}`);
            values.push(employeeData.company);
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
        const result = await database_1.default.query(query, values);
        // console.log('Employee update query executed:', query, values);
        return result.rows[0];
    }
    async findById(id) {
        const query = `
            SELECT 
                employees.*,
                branches.name AS branch_name,
                branches.location AS branch_location
            FROM employees
            LEFT JOIN branches ON employees.branch_id = branches.id
            WHERE employees.id = $1
        `;
        const result = await database_1.default.query(query, [id]);
        return result.rows[0];
    }
    async findAll() {
        const query = 'SELECT * FROM employees ORDER BY first_name ASC';
        const result = await database_1.default.query(query);
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
        const result = await database_1.default.query(query);
        return result.rows;
    }
    async findByLocation(location) {
        const query = 'SELECT * FROM employees WHERE branch_location = $1';
        const result = await database_1.default.query(query, [location]);
        return result.rows;
    }
    async findByEmployeeId(employeeId) {
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
        const result = await database_1.default.query(query, [employeeId]);
        return result.rows;
    }
}
exports.default = new EmployeeModel();
