"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("../config/database"));
class SystemConfigurationModel {
    static async get() {
        const query = `SELECT * FROM system_configuration WHERE id = 1;`;
        const result = await database_1.default.query(query);
        if (result.rows.length === 0) {
            // Create default configuration if it doesn't exist
            return await this.createDefault();
        }
        return result.rows[0];
    }
    static async createDefault() {
        const query = `
            INSERT INTO system_configuration (id, app_name, storage_type)
            VALUES (1, 'Asset Management System', 'server')
            RETURNING *;
        `;
        const result = await database_1.default.query(query);
        return result.rows[0];
    }
    static async update(configData) {
        const fields = [];
        const values = [];
        let paramCount = 1;
        // Build dynamic update query
        Object.entries(configData).forEach(([key, value]) => {
            if (value !== undefined) {
                fields.push(`${key} = $${paramCount}`);
                values.push(value);
                paramCount++;
            }
        });
        if (fields.length === 0) {
            return await this.get();
        }
        // Add updated_at
        fields.push(`updated_at = now()`);
        const query = `
            UPDATE system_configuration 
            SET ${fields.join(', ')}
            WHERE id = 1
            RETURNING *;
        `;
        const result = await database_1.default.query(query, values);
        return result.rows[0];
    }
    static async getPublicConfig() {
        const config = await this.get();
        // Return only public-facing configuration (exclude sensitive Firebase keys)
        return {
            id: config.id,
            app_name: config.app_name,
            company_logo_url: config.company_logo_url,
            company_email: config.company_email,
            company_phone: config.company_phone,
            company_address: config.company_address,
            storage_type: config.storage_type
        };
    }
}
exports.default = SystemConfigurationModel;
