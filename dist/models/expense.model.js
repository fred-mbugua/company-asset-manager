"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("../config/database"));
// Helper function to build access filter for expenses (joins to assets for branch filtering)
function buildAccessFilter(AccessFilterContext) {
    const conditions = [];
    const params = [];
    if (!AccessFilterContext) {
        return { conditions, params };
    }
    // Admin users with no branch/company restrictions see everything
    if (AccessFilterContext.isAdmin &&
        !AccessFilterContext.branchLevelAccess &&
        !AccessFilterContext.companyLevelAccess) {
        return { conditions, params };
    }
    // Branch level access - filter by asset branch_id
    if (AccessFilterContext.branchLevelAccess &&
        AccessFilterContext.accessibleBranchIds &&
        AccessFilterContext.accessibleBranchIds.length > 0) {
        params.push(AccessFilterContext.accessibleBranchIds);
        conditions.push(`a.branch_id = ANY($${params.length})`);
    }
    // Company level access - filter by asset company (through branch)
    if (AccessFilterContext.companyLevelAccess &&
        AccessFilterContext.accessibleCompanyIds &&
        AccessFilterContext.accessibleCompanyIds.length > 0) {
        params.push(AccessFilterContext.accessibleCompanyIds);
        conditions.push(`b.company_id = ANY($${params.length})`);
    }
    return { conditions, params };
}
class ExpenseModel {
    async create(expenseData) {
        // console.log('Creating expense with data:', expenseData);
        const query = 'INSERT INTO expenses (asset_id, date, amount, vendor, invoice_number, notes, expense_type_id, assigned_employee_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *';
        const result = await database_1.default.query(query, [
            expenseData.asset_id,
            expenseData.date,
            expenseData.amount,
            expenseData.vendor,
            expenseData.invoice_number,
            expenseData.notes,
            expenseData.expense_type_id,
            expenseData.assigned_employee_id || null,
        ]);
        return result.rows[0];
    }
    async findById(id) {
        const query = `
      SELECT 
        e.*,
        a.asset_tag,
        a.manufacturer,
        a.model,
        et.name as expense_type_name,
        emp.first_name || ' ' || emp.last_name AS assigned_employee_name,
        emp.company AS employee_company,
        rr.id AS repair_request_id,
        rr.request_number AS repair_request_number,
        rr.title AS repair_request_title
      FROM expenses e
      LEFT JOIN assets a ON e.asset_id = a.id
      LEFT JOIN expense_types et ON e.expense_type_id = et.id
      LEFT JOIN employees emp ON e.assigned_employee_id = emp.id
      LEFT JOIN repair_requests rr ON rr.expense_id = e.id
      WHERE e.id = $1
    `;
        const result = await database_1.default.query(query, [id]);
        return result.rows[0];
    }
    async findByAssetId(assetId) {
        const query = `
      SELECT 
        e.*,
        emp.first_name || ' ' || emp.last_name AS assigned_employee_name
      FROM expenses e
      LEFT JOIN employees emp ON e.assigned_employee_id = emp.id
      WHERE e.asset_id = $1 
      ORDER BY e.date DESC
    `;
        const result = await database_1.default.query(query, [assetId]);
        return result.rows;
    }
    async findByTimePeriod(startDate, endDate) {
        const query = 'SELECT * FROM expenses WHERE date BETWEEN $1 AND $2 ORDER BY date ASC';
        const result = await database_1.default.query(query, [startDate, endDate]);
        return result.rows;
    }
    async findallAssets() {
        const query = 'SELECT * FROM expenses ORDER BY date DESC';
        const result = await database_1.default.query(query);
        return result.rows;
    }
    async findAll(AccessFilterContext) {
        const { conditions, params } = buildAccessFilter(AccessFilterContext);
        let query = `
      SELECT 
        e.*,
        a.asset_tag,
        a.manufacturer,
        a.model,
        a.branch_id,
        et.name as expense_type_name,
        emp.first_name || ' ' || emp.last_name AS assigned_employee_name,
        b.name AS branch_name,
        c.name AS company_name
      FROM expenses e
      LEFT JOIN assets a ON e.asset_id = a.id
      LEFT JOIN branches b ON a.branch_id = b.id
      LEFT JOIN companies c ON b.company_id = c.id
      LEFT JOIN expense_types et ON e.expense_type_id = et.id
      LEFT JOIN employees emp ON e.assigned_employee_id = emp.id
    `;
        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(' AND ')}`;
        }
        query += ` ORDER BY e.date DESC`;
        const result = await database_1.default.query(query, params);
        return result.rows;
    }
    async update(id, updateData) {
        const fields = [];
        const values = [];
        let index = 1;
        for (const key in updateData) {
            fields.push(`${key} = $${index}`);
            values.push(updateData[key]);
            index++;
        }
        const query = `UPDATE expenses SET ${fields.join(', ')} WHERE id = $${index} RETURNING *`;
        values.push(id);
        const result = await database_1.default.query(query, values);
        return result.rows[0];
    }
    async delete(id) {
        const query = 'DELETE FROM expenses WHERE id = $1';
        await database_1.default.query(query, [id]);
        return { message: 'Expense deleted successfully.' };
    }
    /**
     * Get the current employee assigned to an asset (if any)
     */
    async getCurrentAssignedEmployee(assetId) {
        const query = `
      SELECT 
        e.id,
        e.first_name || ' ' || e.last_name AS full_name,
        e.company
      FROM employees e
      INNER JOIN assignments a ON a.employee_id = e.id
      WHERE a.asset_id = $1 AND a.return_date IS NULL
      ORDER BY a.assignment_date DESC
      LIMIT 1
    `;
        const result = await database_1.default.query(query, [assetId]);
        return result.rows[0] || null;
    }
}
exports.default = new ExpenseModel();
