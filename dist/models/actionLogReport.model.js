"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionLogReportModel = void 0;
const database_1 = __importDefault(require("../config/database"));
class ActionLogReportModel {
    /**
     * Helper function to build the dynamic WHERE clause for both data and count queries.
     */
    static buildWhereClause(filters, values) {
        let where = 'WHERE 1=1';
        let paramIndex = values.length + 1;
        if (filters.action_type) {
            where += ` AND action_logs.action_type = $${paramIndex++}`;
            values.push(filters.action_type);
        }
        if (filters.entity_type) {
            where += ` AND action_logs.entity_type = $${paramIndex++}`;
            values.push(filters.entity_type);
        }
        if (filters.user_id) {
            where += ` AND action_logs.user_id = $${paramIndex++}`;
            values.push(parseInt(filters.user_id, 10));
        }
        if (filters.from_date) {
            where += ` AND action_logs.created_at >= $${paramIndex++}`;
            values.push(filters.from_date);
        }
        if (filters.to_date) {
            where += ` AND action_logs.created_at <= $${paramIndex++}`;
            values.push(filters.to_date + ' 23:59:59'); // Include entire end date
        }
        return { where, nextIndex: paramIndex };
    }
    /**
     * Fetching paginated action log data and returns the total count.
     * Used primarily by the frontend to display a table with pagination controls.
     * @param filters - Filtering criteria (action_type, entity_type, dates, etc.)
     * @param options - Pagination options (limit, offset)
     * @returns An object containing the array of action logs and the total count
     */
    static async findPaginatedAndCount(filters, options) {
        const values = [];
        const { where } = this.buildWhereClause(filters, values);
        // Query for paginated data
        const dataQuery = `
            SELECT 
                action_logs.id,
                action_logs.user_id,
                users.first_name || ' ' || users.last_name AS user_name,
                action_logs.action_type,
                action_logs.entity_type,
                action_logs.entity_id,
                action_logs.details,
                action_logs.created_at
            FROM action_logs
            LEFT JOIN users ON action_logs.user_id = users.id
            ${where}
            ORDER BY action_logs.created_at DESC
            LIMIT $${values.length + 1} OFFSET $${values.length + 2};
        `;
        // Query for total count
        const countQuery = `
            SELECT COUNT(*) AS total
            FROM action_logs
            ${where};
        `;
        // Executing both queries
        const dataResult = await database_1.default.query(dataQuery, [...values, options.limit, options.offset]);
        const countResult = await database_1.default.query(countQuery, values);
        const logs = dataResult.rows;
        const totalCount = parseInt(countResult.rows[0].total, 10);
        return { logs, totalCount };
    }
    /**
     * Fetching ALL filtered action log data without pagination.
     * Used primarily for exporting reports to Excel.
     * @param filters - Filtering criteria.
     * @returns Array of all matching action logs
     */
    static async findAllFiltered(filters) {
        const values = [];
        const { where } = this.buildWhereClause(filters, values);
        const query = `
            SELECT 
                action_logs.id,
                action_logs.user_id,
                users.first_name || ' ' || users.last_name AS user_name,
                action_logs.action_type,
                action_logs.entity_type,
                action_logs.entity_id,
                action_logs.details,
                action_logs.created_at
            FROM action_logs
            LEFT JOIN users ON action_logs.user_id = users.id
            ${where}
            ORDER BY action_logs.created_at DESC;
        `;
        const result = await database_1.default.query(query, values);
        return result.rows;
    }
}
exports.ActionLogReportModel = ActionLogReportModel;
exports.default = ActionLogReportModel;
