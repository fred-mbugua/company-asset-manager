// src/models/department.model.ts

import db from '../config/database';

class DepartmentModel {
    /**
     * Creates a new department in the database.
     */
    static async create(departmentData: any) {
        const query = `
            INSERT INTO departments (name)
            VALUES ($1)
            RETURNING *;
        `;
        const result = await db.query(query, [departmentData.name]);
        return result.rows[0];
    }

    /**
     * Retrieves a single department by its ID.
     */
    static async findById(id: number) {
        const query = `SELECT * FROM departments WHERE id = $1;`;
        const result = await db.query(query, [id]);
        return result.rows[0];
    }

    /**
     * Retrieves a single department by its name.
     */
    static async findByName(name: string) {
        const query = `SELECT * FROM departments WHERE name = $1;`;
        const result = await db.query(query, [name]);
        return result.rows[0];
    }

    /**
     * Retrieves all departments from the database.
     */
    static async findAll() {
        const query = `SELECT * FROM departments;`;
        const result = await db.query(query);
        return result.rows;
    }

    /**
     * Updates an existing department's details.
     */
    static async update(id: number, updateData: any) {
        const query = `
            UPDATE departments SET name = COALESCE($1, name)
            WHERE id = $2
            RETURNING *;
        `;
        const result = await db.query(query, [updateData.name, id]);
        return result.rows[0];
    }

    /**
     * Deletes a department from the database by ID.
     */
    static async delete(id: number) {
        const query = `
            DELETE FROM departments 
            WHERE id = $1;
        `;
        await db.query(query, [id]);
        return true;
    }
}

export default DepartmentModel;