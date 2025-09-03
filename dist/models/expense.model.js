"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("../config/database"));
class ExpenseModel {
    async create(expenseData) {
        const query = 'INSERT INTO expenses (asset_id, expense_type, date, amount, vendor, invoice_number, notes) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *';
        const result = await database_1.default.query(query, [
            expenseData.asset_id,
            expenseData.expense_type,
            expenseData.date,
            expenseData.amount,
            expenseData.vendor,
            expenseData.invoice_number,
            expenseData.notes,
        ]);
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
}
exports.default = new ExpenseModel();
