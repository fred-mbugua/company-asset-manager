"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const expenseType_service_1 = __importDefault(require("../services/expenseType.service"));
/**
 * Controller class for handling Expense Type operations.
 */
exports.default = new class ExpenseTypeController {
    /**
     * Handles the creation of a new expense type.
     */
    async createExpenseType(req, res) {
        const { name, description } = req.body;
        if (!name || typeof name !== 'string' || name.trim() === '') {
            res.status(400).json({ success: false, message: 'Expense type name is required.' });
            return;
        }
        try {
            const newType = await expenseType_service_1.default.createType({ name: name.trim(), description });
            res.status(201).json({
                success: true,
                message: 'Expense type created successfully.',
                data: newType
            });
        }
        catch (error) {
            // Handle the specific duplication error
            if (error.message.startsWith('Duplicate expense type:')) {
                res.status(409).json({ success: false, message: error.message });
                return;
            }
            res.status(500).json({ success: false, message: 'Failed to create expense type.' });
        }
    }
    /**
     * Retrieves all expense types.
     */
    async getAllExpenseTypes(req, res) {
        try {
            const expenseTypes = await expenseType_service_1.default.findAll();
            res.status(200).json({ success: true, data: expenseTypes });
        }
        catch (error) {
            res.status(500).json({ success: false, message: 'Failed to retrieve expense types.' });
        }
    }
    /**
     * Retrieves a single expense type by ID.
     */
    async getExpenseTypeById(req, res) {
        try {
            const id = parseInt(req.params.id);
            const type = await expenseType_service_1.default.findById(id);
            res.status(200).json({ success: true, data: type });
        }
        catch (error) {
            res.status(404).json({ success: false, message: error.message });
        }
    }
    /**
     * Updates an expense type.
     */
    async updateExpenseType(req, res) {
        try {
            const id = parseInt(req.params.id);
            const { name, description } = req.body;
            const updated = await expenseType_service_1.default.update(id, { name, description });
            res.status(200).json({ success: true, message: 'Expense type updated successfully.', data: updated });
        }
        catch (error) {
            if (error.message.startsWith('Duplicate expense type:')) {
                res.status(409).json({ success: false, message: error.message });
                return;
            }
            res.status(500).json({ success: false, message: error.message });
        }
    }
    /**
     * Deletes an expense type.
     */
    async deleteExpenseType(req, res) {
        try {
            const id = parseInt(req.params.id);
            await expenseType_service_1.default.delete(id);
            res.status(200).json({ success: true, message: 'Expense type deleted successfully.' });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};
