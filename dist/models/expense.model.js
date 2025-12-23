"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("../config/database"));
class ExpenseModel {
    async create(expenseData) {
        // console.log('Creating expense with data:', expenseData);
        const query = 'INSERT INTO expenses (asset_id, date, amount, vendor, invoice_number, notes, expense_type_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *';
        const result = await database_1.default.query(query, [
            expenseData.asset_id,
            expenseData.date,
            expenseData.amount,
            expenseData.vendor,
            expenseData.invoice_number,
            expenseData.notes,
            expenseData.expense_type_id,
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
        et.name as expense_type_name
      FROM expenses e
      LEFT JOIN assets a ON e.asset_id = a.id
      LEFT JOIN expense_types et ON e.expense_type_id = et.id
      WHERE e.id = $1
    `;
        const result = await database_1.default.query(query, [id]);
        return result.rows[0];
    }
    async findByAssetId(assetId) {
        const query = 'SELECT * FROM expenses WHERE asset_id = $1 ORDER BY date DESC';
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
}
exports.default = new ExpenseModel();
