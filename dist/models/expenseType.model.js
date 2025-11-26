"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpenseTypeModel = void 0;
const database_1 = __importDefault(require("../config/database"));
class ExpenseTypeModel {
    /**
     * Stores a new expense type, handling unique constraint violation.
     */
    async create(data) {
        const query = `
            INSERT INTO expense_types (name, description)
            VALUES ($1, $2)
            RETURNING id, name, description;
        `;
        const values = [data.name, data.description || null];
        try {
            const result = await database_1.default.query(query, values);
            return result.rows[0];
        }
        catch (error) {
            // PostgreSQL Error Code 23505 for unique_violation
            if (error.code === '23505') {
                throw new Error(`Duplicate expense type: ${data.name}`);
            }
            throw error;
        }
    }
    /**
     * Retrieves all expense types.
     */
    async findAll() {
        const query = `SELECT id, name, description FROM expense_types ORDER BY name;`;
        const result = await database_1.default.query(query);
        return result.rows;
    }
}
exports.ExpenseTypeModel = ExpenseTypeModel;
exports.default = new ExpenseTypeModel();
