"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("../config/database"));
class AssetModel {
    static async create(assetData) {
        const query = `
            INSERT INTO assets (asset_tag, asset_type, manufacturer, model, serial_number, status, location, purchase_date, purchase_price, notes)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *;
        `;
        const values = [assetData.asset_tag, assetData.asset_type, assetData.manufacturer, assetData.model, assetData.serial_number, assetData.status, assetData.location, assetData.purchase_date, assetData.purchase_price, assetData.notes];
        const result = await database_1.default.query(query, values);
        return result.rows[0];
    }
    static async findAll() {
        const query = `SELECT * FROM assets;`;
        const result = await database_1.default.query(query);
        return result.rows;
    }
    static async findById(id) {
        const query = `SELECT * FROM assets WHERE id = $1;`;
        const result = await database_1.default.query(query, [id]);
        return result.rows[0];
    }
    static async update(id, updateData) {
        console.log('Updating asset with data:', updateData);
        // asset_tag: document.getElementById('edit_tag').value,
        // serial_number: document.getElementById('edit_serial').value,
        // status: document.getElementById('edit_status').value,
        // purchase_price: parseFloat(document.getElementById('edit_price').value),
        // notes:
        const query = `
            UPDATE assets SET asset_tag = $1, serial_number = $2, status = $3, purchase_price = $4, notes = $5
            WHERE id = $6
            RETURNING *;
        `;
        const values = [updateData.asset_tag, updateData.serial_number, updateData.status, updateData.purchase_price, updateData.notes, id];
        const result = await database_1.default.query(query, values);
        return result.rows[0];
    }
    static async delete(id) {
        const query = `DELETE FROM assets WHERE id = $1;`;
        await database_1.default.query(query, [id]);
        return true;
    }
    static async search(query) {
        const searchQuery = `%${query.searchTerm}%`;
        const sql = `
            SELECT * FROM assets
            WHERE asset_tag ILIKE $1 OR description ILIKE $1;
        `;
        const result = await database_1.default.query(sql, [searchQuery]);
        return result.rows;
    }
}
exports.default = AssetModel;
