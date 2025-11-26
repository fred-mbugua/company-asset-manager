"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpenseTypeService = void 0;
const models_1 = require("../models");
class ExpenseTypeService {
    /**
     * Creates a new expense type.
     */
    async createType(data) {
        try {
            const newType = await models_1.ExpenseTypeModel.create(data);
            return newType;
        }
        catch (error) {
            // Translate the model's standardized error
            if (error.message.startsWith('Duplicate expense type:')) {
                throw new Error(error.message);
            }
            throw error;
        }
    }
    /**
     * Retrieves all expense types.
     */
    async findAll() {
        return models_1.ExpenseTypeModel.findAll();
    }
}
exports.ExpenseTypeService = ExpenseTypeService;
exports.default = new ExpenseTypeService();
