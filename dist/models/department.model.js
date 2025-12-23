"use strict";
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
    // static async update(id: number, updateData: any) {
    //     const query = `
    //         UPDATE departments SET name = COALESCE($1, name)
    //         WHERE id = $2
    //         RETURNING *;
    //     `;
    //     const result = await db.query(query, [updateData.name, id]);
    //     return result.rows[0];
    // }
    /**
     * Updating an existing department.
     */
    static async update(id, deptData) {
        const setClauses = [];
        const values = [];
        let index = 1;
        // Dynamically building SET clause
        for (const key in deptData) {
            if (Object.prototype.hasOwnProperty.call(deptData, key) && key !== 'id') {
                setClauses.push(`${key} = $${index++}`);
                values.push(deptData[key]);
            }
        }
        if (setClauses.length === 0) {
            // Nothing to update
            return this.findById(id);
        }
        values.push(id); // ID is the last parameter
        const query = `
            UPDATE departments
            SET ${setClauses.join(', ')}
            WHERE id = $${index}
            RETURNING id, name;
        `;
        const result = await database_1.default.query(query, values);
        return result.rows[0] || null;
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
