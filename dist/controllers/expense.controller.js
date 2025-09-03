"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const services_1 = require("../services");
const logger_1 = __importDefault(require("../utils/logger"));
class ExpenseController {
    async addExpense(req, res) {
        try {
            const newExpense = await services_1.ExpenseService.addExpense(req.body);
            res.status(201).json(newExpense);
        }
        catch (error) {
            logger_1.default.error('Failed to add expense:', error);
            res.status(400).json({ error: 'Invalid expense data' });
        }
    }
}
exports.default = new ExpenseController();
