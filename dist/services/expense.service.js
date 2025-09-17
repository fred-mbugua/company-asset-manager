"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../models");
const actionLog_service_1 = __importDefault(require("./actionLog.service"));
class ExpenseService {
    async addExpense(expenseData, userId) {
        const newExpense = await models_1.ExpenseModel.create(expenseData);
        await actionLog_service_1.default.logAction(userId, 'CREATE', 'Expense', newExpense.id, { asset_id: newExpense.asset_id, amount: newExpense.amount });
        return newExpense;
    }
    async getAll() {
        return models_1.ExpenseModel.findallAssets();
    }
    async getExpensesByAssetId(assetId) {
        const expense = await models_1.ExpenseModel.findByAssetId(assetId);
        if (!expense) {
            throw new Error('Expense not found');
        }
        return expense;
    }
    async getExpensesByTimePeriod(startDate, endDate) {
        return models_1.ExpenseModel.findByTimePeriod(startDate, endDate);
    }
    async update(id, updateData, userId) {
        const expense = await this.getExpensesByAssetId(id);
        const changes = { old_data: expense, new_data: updateData };
        const updatedExpense = await models_1.ExpenseModel.update(id, updateData);
        await actionLog_service_1.default.logAction(userId, 'UPDATE', 'Expense', id, changes);
        return updatedExpense;
    }
    async delete(id, userId) {
        const expense = await this.getExpensesByAssetId(id);
        await models_1.ExpenseModel.delete(id);
        await actionLog_service_1.default.logAction(userId, 'DELETE', 'Expense', id);
        return { message: 'Expense deleted successfully.' };
    }
}
exports.default = new ExpenseService();
