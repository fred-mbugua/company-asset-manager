"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssignmentReportModel = void 0;
const database_1 = __importDefault(require("../config/database"));
class AssignmentReportModel {
    constructor() {
        // Base SQL SELECT and FROM clauses for readability
        this.BASE_QUERY_SELECT = `
        SELECT
            assignments.id,
            assets.asset_tag,
            assets.manufacturer,
            assets.model,
            employees.department,
            assignments.assignment_date,
            assignments.return_date,
            assignments.notes,
            employees.first_name || ' ' || employees.last_name AS employee_name
        FROM assignments
        INNER JOIN assets ON assignments.asset_id = assets.id
        INNER JOIN employees ON assignments.employee_id = employees.id
        INNER JOIN branches ON assets.branch_id = branches.id -- Join branch for location filter
    `;
    }
    // --- Helper function to build the dynamic WHERE clause ---
    buildWhereClause(filters, values) {
        let where = 'WHERE 1=1';
        let paramIndex = values.length + 1;
        if (filters.asset_tag) {
            where += ` AND assets.asset_tag ILIKE $${paramIndex++}`;
            values.push(`%${filters.asset_tag}%`);
        }
        if (filters.department) {
            where += ` AND employees.department = $${paramIndex++}`;
            values.push(filters.department);
        }
        if (filters.employee_name) {
            where += ` AND (employees.first_name || ' ' || employees.last_name) ILIKE $${paramIndex++}`;
            values.push(`%${filters.employee_name}%`);
        }
        if (filters.location) {
            where += ` AND branches.name = $${paramIndex++}`;
            values.push(filters.location);
        }
        if (filters.from_date) {
            where += ` AND assignments.assignment_date >= $${paramIndex++}`;
            values.push(filters.from_date);
        }
        if (filters.to_date) {
            where += ` AND assignments.assignment_date <= $${paramIndex++}`;
            values.push(filters.to_date);
        }
        return { where, nextIndex: paramIndex };
    }
    /**
     * Fetching paginated assignments and the total count.
     */
    async findPaginatedAndCount(filters, options) {
        const values = [];
        const { where, nextIndex } = this.buildWhereClause(filters, values);
        // Fetching Paginated Data
        const dataQuery = `
            ${this.BASE_QUERY_SELECT}
            ${where}
            ORDER BY assignments.assignment_date DESC
            LIMIT $${nextIndex} OFFSET $${nextIndex + 1};
        `;
        values.push(options.limit, options.offset);
        const assignmentsResult = await database_1.default.query(dataQuery, values);
        // Fetching Total Count
        const countQuery = `
            SELECT COUNT(assignments.id) AS total_count
            FROM assignments
            INNER JOIN assets ON assignments.asset_id = assets.id
            INNER JOIN employees ON assignments.employee_id = employees.id
            INNER JOIN branches ON assets.branch_id = branches.id
            ${where};
        `;
        const countValues = values.slice(0, values.length - 2);
        const countResult = await database_1.default.query(countQuery, countValues);
        const totalCount = parseInt(countResult.rows[0].total_count, 10);
        return { assignments: assignmentsResult.rows, totalCount: totalCount };
    }
    /**
     * Fetching all filtered assignment records (used for export).
     */
    async findAllFiltered(filters) {
        const values = [];
        const { where } = this.buildWhereClause(filters, values);
        const query = `
            ${this.BASE_QUERY_SELECT}
            ${where}
            ORDER BY assignments.assignment_date DESC;
        `;
        const result = await database_1.default.query(query, values);
        return result.rows;
    }
}
exports.AssignmentReportModel = AssignmentReportModel;
exports.default = new AssignmentReportModel();
