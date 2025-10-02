"use strict";
// src/models/department.model.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("../config/database"));
class DepartmentModel {
    /**
     * Creates a new department in the database.
     */
    static async create(departmentData) {
        const query = `
            INSERT INTO departments (name)
            VALUES ($1)
            RETURNING *;
        `;
        const result = await database_1.default.query(query, [departmentData.name]);
        return result.rows[0];
    }
    /**
     * Retrieves a single department by its ID.
     */
    static async findById(id) {
        const query = `SELECT * FROM departments WHERE id = $1;`;
        const result = await database_1.default.query(query, [id]);
        return result.rows[0];
    }
    /**
     * Retrieves a single department by its name.
     */
    static async findByName(name) {
        const query = `SELECT * FROM departments WHERE name = $1;`;
        const result = await database_1.default.query(query, [name]);
        return result.rows[0];
    }
    /**
     * Retrieves all departments from the database.
     */
    static async findAll() {
        const query = `SELECT * FROM departments;`;
        const result = await database_1.default.query(query);
        return result.rows;
    }
    /**
     * Updates an existing department's details.
     */
    static async update(id, updateData) {
        const query = `
            UPDATE departments SET name = COALESCE($1, name)
            WHERE id = $2
            RETURNING *;
        `;
        const result = await database_1.default.query(query, [updateData.name, id]);
        return result.rows[0];
    }
    /**
     * Deletes a department from the database by ID.
     */
    static async delete(id) {
        const query = `
            DELETE FROM departments 
            WHERE id = $1;
        `;
        await database_1.default.query(query, [id]);
        return true;
    }
}
exports.default = DepartmentModel;
