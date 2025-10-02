"use strict";
// import pool from '../config/database';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// class AssignmentModel {
//   async create(assignmentData: { asset_id: string; employee_id: string }) {
//     const query = 'INSERT INTO assignments (asset_id, employee_id, assignment_date) VALUES ($1, $2, NOW()) RETURNING *';
//     const result = await pool.query(query, [assignmentData.asset_id, assignmentData.employee_id]);
//     return result.rows[0];
//   }
//   async findByAssetId(assetId: string) {
//     const query = 'SELECT a.*, e.full_name as employee_name FROM assignments a JOIN employees e ON a.employee_id = e.id WHERE a.asset_id = $1 ORDER BY assignment_date DESC';
//     const result = await pool.query(query, [assetId]);
//     return result.rows;
//   }
//   async findByEmployeeId(employeeId: string) {
//     const query = 'SELECT a.*, asst.asset_tag, asst.asset_type, asst.manufacturer, asst.model FROM assignments a JOIN assets asst ON a.asset_id = asst.id WHERE a.employee_id = $1 AND a.return_date IS NULL';
//     const result = await pool.query(query, [employeeId]);
//     return result.rows;
//   }
//   async returnAsset(assetId: string) {
//     const query = 'UPDATE assignments SET return_date = NOW() WHERE asset_id = $1 AND return_date IS NULL RETURNING *';
//     const result = await pool.query(query, [assetId]);
//     return result.rows[0];
//   }
// }
// export default new AssignmentModel();
const database_1 = __importDefault(require("../config/database"));
class AssignmentModel {
    static async create(assignmentData) {
        // console.log('Creating assignment with data:', assignmentData);
        const query = `
            INSERT INTO assignments (asset_id, employee_id, assignment_date, return_date, notes)
            VALUES ($1, $2, NOW(), NULL, $3)
            RETURNING *;
        `;
        const values = [assignmentData.asset_id, assignmentData.employee_id, assignmentData.notes];
        const result = await database_1.default.query(query, values);
        return result.rows[0];
    }
    static async findAll() {
        const query = `SELECT * FROM assignments;`;
        const result = await database_1.default.query(query);
        return result.rows;
    }
    static async findById(id) {
        const query = `SELECT * FROM assignments WHERE id = $1;`;
        const result = await database_1.default.query(query, [id]);
        return result.rows[0];
    }
    static async update(id, updateData) {
        const query = `
            UPDATE assignments SET asset_id = COALESCE($1, asset_id), employee_id = COALESCE($2, employee_id), assigned_date = COALESCE($3, assigned_date), returned_date = COALESCE($4, returned_date), notes = COALESCE($5, notes)
            WHERE id = $6
            RETURNING *;
        `;
        const values = [updateData.asset_id, updateData.employee_id, updateData.assigned_date, updateData.returned_date, updateData.notes, id];
        const result = await database_1.default.query(query, values);
        return result.rows[0];
    }
    static async delete(id) {
        const query = `DELETE FROM assignments WHERE id = $1;`;
        await database_1.default.query(query, [id]);
        return true;
    }
    static async findActiveByAssetId(assetId) {
        const query = `
            SELECT * FROM assignments 
            WHERE asset_id = $1 AND return_date IS NULL;
        `;
        const result = await database_1.default.query(query, [assetId]);
        return result.rows[0];
    }
    static async findByEmployeeId(employeeId) {
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
exports.default = AssignmentModel;
