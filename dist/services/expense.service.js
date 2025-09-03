"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../models");
class ExpenseService {
    async addExpense(expenseData) {
        return models_1.ExpenseModel.create(expenseData);
    }
    async getExpensesByAsset(assetId) {
        return models_1.ExpenseModel.findByAssetId(assetId);
    }
    async getExpensesByTimePeriod(startDate, endDate) {
        return models_1.ExpenseModel.findByTimePeriod(startDate, endDate);
    }
}
exports.default = new ExpenseService();
