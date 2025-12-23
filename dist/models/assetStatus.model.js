"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetStatusModel = void 0;
const database_1 = __importDefault(require("../config/database"));
class AssetStatusModel {
    /**
     * Stores a new asset status, preventing duplicates.
     */
    async create(data) {
        var _a;
        const query = `
            INSERT INTO asset_statuses (name, is_available, description)
            VALUES ($1, $2, $3)
            RETURNING id, name, is_available, description;
        `;
        const values = [
            data.name,
            (_a = data.is_available) !== null && _a !== void 0 ? _a : false, // Default to FALSE if not provided
            data.description || null
        ];
        try {
            const result = await database_1.default.query(query, values);
            return result.rows[0];
        }
        catch (error) {
            // PostgreSQL Error Code 23505 for unique_violation
            if (error.code === '23505') {
                throw new Error(`Duplicate asset status: ${data.name}`);
            }
            throw error;
        }
    }
    /**
     * Retrieves all asset statuses.
     */
    async findAll() {
        const query = `SELECT id, name, is_available, description FROM asset_statuses ORDER BY name;`;
        const result = await database_1.default.query(query);
        return result.rows;
    }
    /**
     * Finds a single asset status by ID.
     */
    async findById(id) {
        const query = `SELECT id, name, is_available, description FROM asset_statuses WHERE id = $1;`;
        const result = await database_1.default.query(query, [id]);
        return result.rows[0] || null;
    }
    /**
     * Updates an asset status.
     */
    async update(id, data) {
        const query = `
            UPDATE asset_statuses
            SET name = COALESCE($1, name),
                is_available = COALESCE($2, is_available),
                description = COALESCE($3, description),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $4
            RETURNING id, name, is_available, description;
        `;
        const values = [data.name, data.is_available, data.description, id];
        try {
            const result = await database_1.default.query(query, values);
            if (result.rows.length === 0) {
                throw new Error('Asset status not found');
            }
            return result.rows[0];
        }
        catch (error) {
            if (error.code === '23505') {
                throw new Error(`Duplicate asset status: ${data.name}`);
            }
            throw error;
        }
    }
    /**
     * Deletes an asset status.
     */
    async delete(id) {
        const query = `DELETE FROM asset_statuses WHERE id = $1;`;
        const result = await database_1.default.query(query, [id]);
        if (result.rowCount === 0) {
            throw new Error('Asset status not found');
        }
    }
}
exports.AssetStatusModel = AssetStatusModel;
exports.default = new AssetStatusModel();
