"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("../config/database"));
class BranchModel {
    static async create(branchData) {
        const query = `
            INSERT INTO branches (name, location)
            VALUES ($1, $2)
            RETURNING *;
        `;
        const result = await database_1.default.query(query, [branchData.name, branchData.location]);
        return result.rows[0];
    }
    static async findById(id) {
        const query = `SELECT * FROM branches WHERE id = $1;`;
        const result = await database_1.default.query(query, [id]);
        return result.rows[0];
    }
    static async findByName(name) {
        const query = `SELECT * FROM branches WHERE LOWER(name) = LOWER($1) OR LOWER(location) = LOWER($1);`;
        const result = await database_1.default.query(query, [name.trim()]);
        return result.rows[0];
    }
    static async findAll() {
        const query = `SELECT * FROM branches ORDER BY created_at;`;
        const result = await database_1.default.query(query);
        return result.rows;
    }
    /**
     * Updating an existing branch.
     */
    static async update(id, branchData) {
        const setClauses = [];
        const values = [];
        let index = 1;
        // Dynamically building SET clause
        for (const key in branchData) {
            if (Object.prototype.hasOwnProperty.call(branchData, key) && key !== 'id') {
                setClauses.push(`${key} = $${index++}`);
                values.push(branchData[key]);
            }
        }
        if (setClauses.length === 0) {
            // Nothing to update
            return this.findById(id);
        }
        values.push(id); // ID is the last parameter
        const query = `
            UPDATE branches
            SET ${setClauses.join(', ')}
            WHERE id = $${index}
            RETURNING id, name, location, created_at, updated_at;
        `;
        const result = await database_1.default.query(query, values);
        return result.rows[0] || null;
    }
    /**
     * Deleting a branch.
     */
    static async delete(id) {
        var _a;
        const query = `DELETE FROM branches WHERE id = $1;`;
        const result = await database_1.default.query(query, [id]);
        return ((_a = result.rowCount) !== null && _a !== void 0 ? _a : 0) > 0;
    }
}
exports.default = BranchModel;
