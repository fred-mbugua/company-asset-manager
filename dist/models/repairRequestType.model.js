"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepairRequestTypeModel = void 0;
const database_1 = __importDefault(require("../config/database"));
// ============================================================================
// MODEL CLASS
// ============================================================================
class RepairRequestTypeModel {
    /**
     * Creates a new repair request type
     */
    async create(data) {
        const query = `
            INSERT INTO repair_request_types (name, description, is_active)
            VALUES ($1, $2, $3)
            RETURNING *;
        `;
        const values = [
            data.name,
            data.description || null,
            data.is_active !== undefined ? data.is_active : true
        ];
        try {
            const result = await database_1.default.query(query, values);
            return result.rows[0];
        }
        catch (error) {
            if (error.code === '23505') {
                throw new Error(`Duplicate repair request type: ${data.name}`);
            }
            throw error;
        }
    }
    /**
     * Retrieves all repair request types
     */
    async findAll(includeInactive = false) {
        let query = `SELECT * FROM repair_request_types`;
        if (!includeInactive) {
            query += ` WHERE is_active = true`;
        }
        query += ` ORDER BY name;`;
        const result = await database_1.default.query(query);
        return result.rows;
    }
    /**
     * Finds a repair request type by ID
     */
    async findById(id) {
        const query = `SELECT * FROM repair_request_types WHERE id = $1;`;
        const result = await database_1.default.query(query, [id]);
        return result.rows[0] || null;
    }
    /**
     * Updates a repair request type
     */
    async update(id, data) {
        const query = `
            UPDATE repair_request_types
            SET name = COALESCE($1, name),
                description = COALESCE($2, description),
                is_active = COALESCE($3, is_active),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $4
            RETURNING *;
        `;
        const values = [data.name, data.description, data.is_active, id];
        try {
            const result = await database_1.default.query(query, values);
            if (result.rows.length === 0) {
                throw new Error('Repair request type not found');
            }
            return result.rows[0];
        }
        catch (error) {
            if (error.code === '23505') {
                throw new Error(`Duplicate repair request type: ${data.name}`);
            }
            throw error;
        }
    }
    /**
     * Deletes a repair request type
     */
    async delete(id) {
        // First check if type is in use
        const checkQuery = `SELECT COUNT(*) FROM repair_requests WHERE request_type_id = $1;`;
        const checkResult = await database_1.default.query(checkQuery, [id]);
        if (parseInt(checkResult.rows[0].count) > 0) {
            throw new Error('Cannot delete repair request type that is in use. Consider deactivating it instead.');
        }
        const query = `DELETE FROM repair_request_types WHERE id = $1;`;
        const result = await database_1.default.query(query, [id]);
        if (result.rowCount === 0) {
            throw new Error('Repair request type not found');
        }
    }
    /**
     * Toggles active status
     */
    async toggleActive(id) {
        const query = `
            UPDATE repair_request_types
            SET is_active = NOT is_active,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *;
        `;
        const result = await database_1.default.query(query, [id]);
        if (result.rows.length === 0) {
            throw new Error('Repair request type not found');
        }
        return result.rows[0];
    }
}
exports.RepairRequestTypeModel = RepairRequestTypeModel;
exports.default = new RepairRequestTypeModel();
