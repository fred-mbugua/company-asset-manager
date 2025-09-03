"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("../config/database"));
class AssignmentModel {
    async create(assignmentData) {
        const query = 'INSERT INTO assignments (asset_id, employee_id, assignment_date) VALUES ($1, $2, NOW()) RETURNING *';
        const result = await database_1.default.query(query, [assignmentData.asset_id, assignmentData.employee_id]);
        return result.rows[0];
    }
    async findByAssetId(assetId) {
        const query = 'SELECT a.*, e.full_name as employee_name FROM assignments a JOIN employees e ON a.employee_id = e.id WHERE a.asset_id = $1 ORDER BY assignment_date DESC';
        const result = await database_1.default.query(query, [assetId]);
        return result.rows;
    }
    async findByEmployeeId(employeeId) {
        const query = 'SELECT a.*, asst.asset_tag, asst.asset_type, asst.manufacturer, asst.model FROM assignments a JOIN assets asst ON a.asset_id = asst.id WHERE a.employee_id = $1 AND a.return_date IS NULL';
        const result = await database_1.default.query(query, [employeeId]);
        return result.rows;
    }
    async returnAsset(assetId) {
        const query = 'UPDATE assignments SET return_date = NOW() WHERE asset_id = $1 AND return_date IS NULL RETURNING *';
        const result = await database_1.default.query(query, [assetId]);
        return result.rows[0];
    }
}
exports.default = new AssignmentModel();
