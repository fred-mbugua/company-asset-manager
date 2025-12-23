"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetTypeModel = void 0;
const database_1 = __importDefault(require("../config/database"));
class AssetTypeModel {
    /**
     * Stores a new asset type. Handles unique constraint violation error.
     * @param data - The name and description of the asset type.
     * @returns The created asset type object.
     */
    async create(data) {
        const query = `
            INSERT INTO asset_types (name, description)
            VALUES ($1, $2)
            RETURNING id, name, description;
        `;
        const values = [data.name, data.description || null];
        try {
            const result = await database_1.default.query(query, values);
            return result.rows[0];
        }
        catch (error) {
            // PostgreSQL Error Code 23505 is for unique_violation
            if (error.code === '23505') {
                // Throw a standardized error that the Service layer can catch and handle.
                throw new Error(`Duplicate asset type: ${data.name}`);
            }
            throw error; // Re-throw any other database errors
        }
    }
    /**
     * Retrieves all asset types.
     */
    async findAll() {
        const query = `SELECT * FROM asset_types ORDER BY name;`;
        const result = await database_1.default.query(query);
        return result.rows;
    }
    /**
     * Finds a single asset type by ID.
     */
    async findById(id) {
        const query = `SELECT id, name, description FROM asset_types WHERE id = $1;`;
        const result = await database_1.default.query(query, [id]);
        return result.rows[0] || null;
    }
    /**
     * Updates an asset type.
     */
    async update(id, data) {
        const query = `
            UPDATE asset_types
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
                throw new Error('Asset type not found');
            }
            return result.rows[0];
        }
        catch (error) {
            if (error.code === '23505') {
                throw new Error(`Duplicate asset type: ${data.name}`);
            }
            throw error;
        }
    }
    /**
     * Deletes an asset type.
     */
    async delete(id) {
        const query = `DELETE FROM asset_types WHERE id = $1;`;
        const result = await database_1.default.query(query, [id]);
        if (result.rowCount === 0) {
            throw new Error('Asset type not found');
        }
    }
}
exports.AssetTypeModel = AssetTypeModel;
exports.default = new AssetTypeModel();
