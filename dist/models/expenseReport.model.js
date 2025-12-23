"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpenseReportModel = void 0;
const database_1 = __importDefault(require("../config/database"));
class ExpenseReportModel {
    /**
     * Helper function to build the dynamic WHERE clause for both data and count queries.
     */
    buildWhereClause(filters, values) {
        let where = 'WHERE 1=1';
        let paramIndex = values.length + 1;
        if (filters.asset_tag) {
            where += ` AND assets.asset_tag ILIKE $${paramIndex++}`;
            values.push(`%${filters.asset_tag}%`);
        }
        if (filters.expense_type) {
            where += ` AND expense_types.name = $${paramIndex++}`;
            values.push(filters.expense_type);
        }
        if (filters.department) {
            // Filters based on the department of the asset's current assignment
            where += ` AND employees.department = $${paramIndex++}`;
            values.push(filters.department);
        }
        if (filters.location) {
            where += ` AND branches.name = $${paramIndex++}`;
            values.push(filters.location);
        }
        if (filters.from_date) {
            where += ` AND expenses.date >= $${paramIndex++}`;
            values.push(filters.from_date);
        }
        if (filters.to_date) {
            where += ` AND expenses.date <= $${paramIndex++}`;
            values.push(filters.to_date);
        }
        return { where, nextIndex: paramIndex };
    }
    /**
     * Fetching paginated expenses and the total count.
     */
    async findPaginatedAndCount(filters, options) {
        const values = [];
        const { where, nextIndex } = this.buildWhereClause(filters, values);
        // Fetch Paginated Data
        const dataQuery = `
            Select
                expenses.id,
                expenses.amount,
                expenses.date,
                expenses.vendor,
                expenses.invoice_number,
                expenses.notes,
                assets.asset_tag,
                expense_types.name As expense_type_name,
                branches.name As location,
                COALESCE(departments.name, 'N/A') AS department
            From
                expenses Left Join
                assets On expenses.asset_id = assets.id Left Join
                expense_types On expenses.expense_type_id = expense_types.id Left Join
                assignments On assignments.asset_id = assets.id
                        And assignments.return_date Is Null Left Join
                employees On assignments.employee_id = employees.id Left Join
                branches On assets.branch_id = branches.id Left Join
                departments On employees.department_id = departments.id
            ${where}
            ORDER BY expenses.date DESC
            LIMIT $${nextIndex} OFFSET $${nextIndex + 1};
        `;
        values.push(options.limit, options.offset);
        const expensesResult = await database_1.default.query(dataQuery, values);
        // Fetch Total Count
        const countQuery = `
            SELECT COUNT(expenses.id) AS total_count
            FROM expenses
            INNER JOIN assets ON expenses.asset_id = assets.id
            INNER JOIN expense_types ON expenses.expense_type_id = expense_types.id
            LEFT JOIN assignments ON assignments.asset_id = assets.id AND assignments.return_date IS NULL
            LEFT JOIN employees ON assignments.employee_id = employees.id
            LEFT JOIN branches ON assets.branch_id = branches.id
            ${where};
        `;
        const countValues = values.slice(0, values.length - 2); // Remove LIMIT and OFFSET
        const countResult = await database_1.default.query(countQuery, countValues);
        const totalCount = parseInt(countResult.rows[0].total_count, 10);
        return { expenses: expensesResult.rows, totalCount: totalCount };
    }
    /**
     * Fetches all filtered expense records (used for export).
     */
    async findAllFiltered(filters) {
        const values = [];
        const { where } = this.buildWhereClause(filters, values);
        // Uses the same main query but without LIMIT/OFFSET
        const query = `
            
            Select
                expenses.id,
                expenses.amount,
                expenses.date,
                expenses.vendor,
                expenses.invoice_number,
                expenses.notes,
                assets.asset_tag,
                expense_types.name As expense_type_name,
                Coalesce(departments.name, 'N/A') As department,
                branches.name As location
            From
                expenses Left Join
                assets On expenses.asset_id = assets.id Left Join
                expense_types On expenses.expense_type_id = expense_types.id Left Join
                assignments On assignments.asset_id = assets.id
                        And assignments.return_date Is Null Left Join
                employees On assignments.employee_id = employees.id Left Join
                branches On assets.branch_id = branches.id Left Join
                departments On employees.department_id = departments.id
            ${where}
            ORDER BY expenses.date DESC;
        `;
        const result = await database_1.default.query(query, values);
        return result.rows;
    }
}
exports.ExpenseReportModel = ExpenseReportModel;
exports.default = new ExpenseReportModel();
