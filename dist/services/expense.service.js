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
    async getExpenseById(id) {
        const expense = await models_1.ExpenseModel.findById(id);
        if (!expense) {
            throw new Error('Expense not found');
        }
        return expense;
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
    /**
     * Fetches paginated expense data and the total count.
     * @param filters - Filtering criteria (asset_tag, expense_type, dates, etc.)
     * @param limit - Number of records per page.
     * @param offset - Starting offset for pagination.
     */
    async getPaginatedExpenses(filters, limit, offset) {
        // Calls the model function created previously
        return models_1.ExpenseReportModel.findPaginatedAndCount(filters, { limit, offset });
    }
    /**
     * Fetches ALL filtered expense data (used primarily for Excel export).
     * @param filters - Filtering criteria.
     */
    async getAllFilteredExpenses(filters) {
        // Calls the model function created previously
        return models_1.ExpenseReportModel.findAllFiltered(filters);
    }
}
exports.default = new ExpenseService();
