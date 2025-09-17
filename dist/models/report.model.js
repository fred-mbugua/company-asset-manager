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
}
exports.default = new ReportModel();
