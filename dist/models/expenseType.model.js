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
    /**
     * Finds a single expense type by ID.
     */
    async findById(id) {
        const query = `SELECT id, name, description FROM expense_types WHERE id = $1;`;
        const result = await database_1.default.query(query, [id]);
        return result.rows[0] || null;
    }
    /**
     * Updates an expense type.
     */
    async update(id, data) {
        const query = `
            UPDATE expense_types
            SET name = COALESCE($1, name),
                description = COALESCE($2, description),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $3
            RETURNING id, name, description;
        `;
        const values = [data.name, data.description, id];
        try {
            const result = await database_1.default.query(query, values);
            if (result.rows.length === 0) {
                throw new Error('Expense type not found');
            }
            return result.rows[0];
        }
        catch (error) {
            if (error.code === '23505') {
                throw new Error(`Duplicate expense type: ${data.name}`);
            }
            throw error;
        }
    }
    /**
     * Deletes an expense type.
     */
    async delete(id) {
        const query = `DELETE FROM expense_types WHERE id = $1;`;
        const result = await database_1.default.query(query, [id]);
        if (result.rowCount === 0) {
            throw new Error('Expense type not found');
        }
    }
}
exports.ExpenseTypeModel = ExpenseTypeModel;
exports.default = new ExpenseTypeModel();
