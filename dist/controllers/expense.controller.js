"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const services_1 = require("../services");
const response_1 = require("../utils/response");
const logger_1 = __importDefault(require("../utils/logger"));
class ExpenseController {
    async addExpense(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const newExpense = await services_1.ExpenseService.addExpense(req.body, userId);
            (0, response_1.successResponse)(res, 201, 'Expense added successfully', newExpense);
        }
        catch (error) {
            logger_1.default.error('Failed to add expense:', error);
            (0, response_1.errorResponse)(res, 400, 'Invalid expense data');
        }
    }
    async getAll(req, res) {
        try {
            const expenses = await services_1.ExpenseService.getAll();
            (0, response_1.successResponse)(res, 200, 'Expenses retrieved successfully', expenses);
        }
        catch (error) {
            logger_1.default.error('Failed to retrieve expenses:', error);
            (0, response_1.errorResponse)(res, 500, error.message);
        }
    }
    async getById(req, res) {
        try {
            const expense = await services_1.ExpenseService.getExpenseById(Number(req.params.id));
            (0, response_1.successResponse)(res, 200, 'Expense retrieved successfully', expense);
        }
        catch (error) {
            logger_1.default.error(`Failed to retrieve expense with ID ${req.params.id}:`, error);
            (0, response_1.errorResponse)(res, 404, error.message);
        }
    }
    async getByAssetId(req, res) {
        try {
            const expenses = await services_1.ExpenseService.getExpensesByAssetId(Number(req.params.assetId));
            (0, response_1.successResponse)(res, 200, 'Expenses retrieved successfully', expenses);
        }
        catch (error) {
            logger_1.default.error(`Failed to retrieve expenses for asset ID ${req.params.assetId}:`, error);
            (0, response_1.errorResponse)(res, 404, error.message);
        }
    }
    async update(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const updatedExpense = await services_1.ExpenseService.update(Number(req.params.id), req.body, userId);
            (0, response_1.successResponse)(res, 200, 'Expense updated successfully', updatedExpense);
        }
        catch (error) {
            logger_1.default.error(`Failed to update expense with ID ${req.params.id}:`, error);
            (0, response_1.errorResponse)(res, 404, error.message);
        }
    }
    async delete(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const result = await services_1.ExpenseService.delete(Number(req.params.id), userId);
            (0, response_1.successResponse)(res, 200, result.message);
        }
        catch (error) {
            logger_1.default.error(`Failed to delete expense with ID ${req.params.id}:`, error);
            (0, response_1.errorResponse)(res, 404, error.message);
        }
    }
}
exports.default = new ExpenseController();
