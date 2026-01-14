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
                COALESCE(departments.name, 'N/A') AS department,
                COALESCE(assigned_emp.first_name || ' ' || assigned_emp.last_name, 'N/A') AS assigned_employee_name,
                COALESCE(assigned_emp.company, 'N/A') AS employee_company
            From
                expenses Left Join
                assets On expenses.asset_id = assets.id Left Join
                expense_types On expenses.expense_type_id = expense_types.id Left Join
                assignments On assignments.asset_id = assets.id
                        And assignments.return_date Is Null Left Join
                employees On assignments.employee_id = employees.id Left Join
                branches On assets.branch_id = branches.id Left Join
                departments On employees.department_id = departments.id Left Join
                employees assigned_emp On expenses.assigned_employee_id = assigned_emp.id
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
                branches.name As location,
                COALESCE(assigned_emp.first_name || ' ' || assigned_emp.last_name, 'N/A') AS assigned_employee_name,
                COALESCE(assigned_emp.company, 'N/A') AS employee_company
            From
                expenses Left Join
                assets On expenses.asset_id = assets.id Left Join
                expense_types On expenses.expense_type_id = expense_types.id Left Join
                assignments On assignments.asset_id = assets.id
                        And assignments.return_date Is Null Left Join
                employees On assignments.employee_id = employees.id Left Join
                branches On assets.branch_id = branches.id Left Join
                departments On employees.department_id = departments.id Left Join
                employees assigned_emp On expenses.assigned_employee_id = assigned_emp.id
            ${where}
            ORDER BY expenses.date DESC;
        `;
        const result = await database_1.default.query(query, values);
        return result.rows;
    }
    /**
     * Get summarized repair expense report
     * Groups by asset and calculates total repair amount
     */
    async getRepairExpenseSummary(filters) {
        let where = `WHERE expense_types.name ILIKE '%repair%'`;
        const values = [];
        let paramIndex = 1;
        if (filters.from_date) {
            where += ` AND expenses.date >= $${paramIndex++}`;
            values.push(filters.from_date);
        }
        if (filters.to_date) {
            where += ` AND expenses.date <= $${paramIndex++}`;
            values.push(filters.to_date);
        }
        if (filters.asset_tag) {
            where += ` AND assets.asset_tag ILIKE $${paramIndex++}`;
            values.push(`%${filters.asset_tag}%`);
        }
        // Count query for pagination
        const countQuery = `
            SELECT COUNT(DISTINCT assets.id) as total
            FROM expenses
            INNER JOIN assets ON expenses.asset_id = assets.id
            INNER JOIN expense_types ON expenses.expense_type_id = expense_types.id
            ${where}
        `;
        const countResult = await database_1.default.query(countQuery, values);
        const totalCount = parseInt(countResult.rows[0].total);
        // Main query with pagination
        let query = `
            SELECT
                assets.id AS asset_id,
                COALESCE(emp.first_name || ' ' || emp.last_name, 'Unassigned') AS staff_name,
                COALESCE(emp.company, 'N/A') AS company,
                assets.asset_tag,
                branches.name AS location,
                assets.model,
                asset_statuses.name AS status,
                asset_types.name AS asset_type,
                SUM(expenses.amount) AS total_repair_amount,
                COUNT(expenses.id) AS repair_count
            FROM expenses
            INNER JOIN assets ON expenses.asset_id = assets.id
            INNER JOIN expense_types ON expenses.expense_type_id = expense_types.id
            INNER JOIN asset_types ON assets.asset_type_id = asset_types.id
            INNER JOIN asset_statuses ON assets.asset_status_id = asset_statuses.id
            LEFT JOIN branches ON assets.branch_id = branches.id
            LEFT JOIN employees emp ON expenses.assigned_employee_id = emp.id
            ${where}
            GROUP BY 
                assets.id, emp.first_name, emp.last_name, emp.company,
                assets.asset_tag, branches.name, assets.model,
                asset_statuses.name, asset_types.name
            ORDER BY total_repair_amount DESC
        `;
        // Add pagination
        if (filters.limit) {
            query += ` LIMIT $${paramIndex++}`;
            values.push(filters.limit);
        }
        if (filters.offset !== undefined) {
            query += ` OFFSET $${paramIndex++}`;
            values.push(filters.offset);
        }
        const result = await database_1.default.query(query, values);
        return { data: result.rows, totalCount };
    }
    /**
     * Get repair expense details for a specific asset
     */
    async getAssetRepairExpenses(assetId, filters) {
        let where = `WHERE expenses.asset_id = $1 AND expense_types.name ILIKE '%repair%'`;
        const values = [assetId];
        let paramIndex = 2;
        if (filters.from_date) {
            where += ` AND expenses.date >= $${paramIndex++}`;
            values.push(filters.from_date);
        }
        if (filters.to_date) {
            where += ` AND expenses.date <= $${paramIndex++}`;
            values.push(filters.to_date);
        }
        const query = `
            SELECT
                expenses.id,
                expenses.date,
                expenses.amount,
                expenses.vendor,
                expenses.invoice_number,
                expenses.notes,
                expense_types.name AS expense_type,
                COALESCE(emp.first_name || ' ' || emp.last_name, 'Unassigned') AS assigned_to,
                COALESCE(emp.company, 'N/A') AS company,
                assets.asset_tag,
                assets.model,
                assets.manufacturer,
                branches.name AS location,
                (SELECT COUNT(*) FROM expense_attachments WHERE expense_id = expenses.id) AS attachment_count,
                rr.id AS repair_request_id,
                rr.request_number AS repair_request_number,
                (SELECT COUNT(*) FROM repair_request_attachments WHERE repair_request_id = rr.id) AS repair_attachment_count
            FROM expenses
            INNER JOIN assets ON expenses.asset_id = assets.id
            INNER JOIN expense_types ON expenses.expense_type_id = expense_types.id
            LEFT JOIN branches ON assets.branch_id = branches.id
            LEFT JOIN employees emp ON expenses.assigned_employee_id = emp.id
            LEFT JOIN repair_requests rr ON rr.expense_id = expenses.id
            ${where}
            ORDER BY expenses.date DESC
        `;
        const result = await database_1.default.query(query, values);
        return result.rows;
    }
}
exports.ExpenseReportModel = ExpenseReportModel;
exports.default = new ExpenseReportModel();
