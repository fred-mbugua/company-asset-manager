"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("../config/database"));
class EmployeeModel {
    async create(employeeData) {
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
        const result = await database_1.default.query(query, values);
        return result.rows[0];
    }
    async findById(id) {
        const query = 'SELECT * FROM employees WHERE id = $1';
        const result = await database_1.default.query(query, [id]);
        return result.rows[0];
    }
    async findAll() {
        const query = 'SELECT * FROM employees ORDER BY full_name ASC';
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
