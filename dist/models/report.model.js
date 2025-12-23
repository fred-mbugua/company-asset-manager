"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("../config/database"));
class ReportModel {
    async getTotalAssetValue() {
        const query = 'SELECT SUM(purchase_price) AS total_value FROM assets';
        const result = await database_1.default.query(query);
        return result.rows[0].total_value;
    }
    async getTotalValueByCategory(assetType) {
        const query = 'SELECT SUM(purchase_price) AS total_value FROM assets WHERE asset_type = $1';
        const result = await database_1.default.query(query, [assetType]);
        return result.rows[0].total_value;
    }
    async getTotalAssetCount() {
        const query = 'SELECT COUNT(*) FROM assets';
        const result = await database_1.default.query(query);
        return result.rows[0].count;
    }
    async getTotalExpenseSum() {
        const query = 'SELECT SUM(amount) FROM expenses';
        const result = await database_1.default.query(query);
        return result.rows[0].sum;
    }
    async getExpenseDetailForAllAssets() {
        const query = `
      Select
        expenses.id,
        expense_types.name,
        assets.asset_tag,
        assets.manufacturer,
        assets.model,
        assets.serial_number,
        assets.status,
        assets.purchase_date,
        assets.purchase_price,
        assets.notes As assets_notes,
        expenses.asset_id,
        expenses."date" As expense_date,
        expenses.amount As expense_amount,
        expenses.vendor,
        expenses.invoice_number,
        expenses.notes As expense_notes,
        (assets.purchase_price + expenses.amount) As expense_total,
        Sum(expenses.amount) Over () As expense_subtotal,
        branches.name As branch_name,
        branches.location As branch_location
    From
        expenses Inner Join
        expense_types On expenses.expense_type_id = expense_types.id Inner Join
        assets On expenses.asset_id = assets.id Inner Join
        branches On assets.branch_id = branches.id
    `;
        const result = await database_1.default.query(query);
        return result.rows;
    }
    async getAssetsByType() {
        const query = `
      SELECT 
        asset_types.name AS type_name, 
        COUNT(*) AS count,
        SUM(assets.purchase_price) AS total_value
      FROM assets 
      INNER JOIN asset_types ON assets.asset_type_id = asset_types.id
      GROUP BY asset_types.name
      ORDER BY count DESC
    `;
        const result = await database_1.default.query(query);
        return result.rows;
    }
    async getAssetsByStatus() {
        const query = `
      SELECT 
        asset_statuses.name AS status_name, 
        COUNT(*) AS count
      FROM assets 
      INNER JOIN asset_statuses ON assets.asset_status_id = asset_statuses.id
      GROUP BY asset_statuses.name
      ORDER BY count DESC
    `;
        const result = await database_1.default.query(query);
        return result.rows;
    }
    async getAssetsByBranch() {
        const query = `
      SELECT 
        branches.name AS branch_name, 
        COUNT(*) AS count,
        SUM(assets.purchase_price) AS total_value
      FROM assets 
      INNER JOIN branches ON assets.branch_id = branches.id
      GROUP BY branches.name
      ORDER BY count DESC
    `;
        const result = await database_1.default.query(query);
        return result.rows;
    }
    async getMonthlyExpenses(months = 6) {
        const query = `
      SELECT 
        TO_CHAR(date, 'Mon YYYY') AS month,
        SUM(amount) AS total
      FROM expenses
      WHERE date >= CURRENT_DATE - INTERVAL '${months} months'
      GROUP BY TO_CHAR(date, 'Mon YYYY'), DATE_TRUNC('month', date)
      ORDER BY DATE_TRUNC('month', date) ASC
    `;
        const result = await database_1.default.query(query);
        return result.rows;
    }
    async getRecentAssignments(limit = 10) {
        const query = `
      SELECT 
        assignments.assignment_date,
        CONCAT(employees.first_name, ' ', employees.middle_name, ' ', employees.last_name) AS employee_name,
        assets.asset_tag,
        asset_types.name AS asset_type
      FROM assignments
      INNER JOIN employees ON assignments.employee_id = employees.id
      INNER JOIN assets ON assignments.asset_id = assets.id
      INNER JOIN asset_types ON assets.asset_type_id = asset_types.id
      WHERE assignments.return_date IS NULL
      ORDER BY assignments.assignment_date DESC
      LIMIT $1
    `;
        const result = await database_1.default.query(query, [limit]);
        return result.rows;
    }
    async getTopExpensiveAssets(limit = 5) {
        const query = `
      SELECT 
        assets.asset_tag,
        asset_types.name AS asset_type,
        assets.manufacturer,
        assets.model,
        assets.purchase_price,
        COALESCE(SUM(expenses.amount), 0) AS total_expenses,
        (assets.purchase_price + COALESCE(SUM(expenses.amount), 0)) AS total_cost
      FROM assets
      INNER JOIN asset_types ON assets.asset_type_id = asset_types.id
      LEFT JOIN expenses ON assets.id = expenses.asset_id
      GROUP BY assets.id, assets.asset_tag, asset_types.name, assets.manufacturer, 
               assets.model, assets.purchase_price
      ORDER BY total_cost DESC
      LIMIT $1
    `;
        const result = await database_1.default.query(query, [limit]);
        return result.rows;
    }
    async getAssignmentStats() {
        const query = `
      SELECT 
        COUNT(CASE WHEN return_date IS NULL THEN 1 END) AS active_assignments,
        COUNT(CASE WHEN return_date IS NOT NULL THEN 1 END) AS returned_assignments,
        COUNT(*) AS total_assignments
      FROM assignments
    `;
        const result = await database_1.default.query(query);
        return result.rows[0];
    }
    async getRecentExpenses(limit = 10) {
        const query = `
      SELECT 
        expenses.date AS expense_date,
        expenses.amount,
        expense_types.name AS expense_type,
        assets.asset_tag,
        expenses.vendor
      FROM expenses
      INNER JOIN expense_types ON expenses.expense_type_id = expense_types.id
      INNER JOIN assets ON expenses.asset_id = assets.id
      ORDER BY expenses.date DESC
      LIMIT $1
    `;
        const result = await database_1.default.query(query, [limit]);
        return result.rows;
    }
}
exports.default = new ReportModel();
