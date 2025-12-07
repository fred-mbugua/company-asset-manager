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
}
exports.default = new ReportModel();
