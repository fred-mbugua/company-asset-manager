"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("../config/database"));
class AssetModel {
    async findAll() {
        const query = 'SELECT * FROM assets';
        const result = await database_1.default.query(query);
        return result.rows;
    }
    async findById(id) {
        const query = 'SELECT * FROM assets WHERE id = $1';
        const result = await database_1.default.query(query, [id]);
        return result.rows[0];
    }
    async create(asset) {
        const query = `
      INSERT INTO assets (asset_tag, asset_type, manufacturer, model, serial_number, status, location, purchase_date, purchase_price, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `;
        const result = await database_1.default.query(query, [
            asset.asset_tag, asset.asset_type, asset.manufacturer, asset.model, asset.serial_number, asset.status, asset.location, asset.purchase_date, asset.purchase_price, asset.notes
        ]);
        return result.rows[0];
    }
    async update(id, asset) {
        const query = `
      UPDATE assets
      SET asset_tag = $1, asset_type = $2, manufacturer = $3, model = $4, serial_number = $5, status = $6, location = $7, purchase_date = $8, purchase_price = $9, notes = $10
      WHERE id = $11
      RETURNING *;
    `;
        const result = await database_1.default.query(query, [
            asset.asset_tag, asset.asset_type, asset.manufacturer, asset.model, asset.serial_number, asset.status, asset.location, asset.purchase_date, asset.purchase_price, asset.notes, id
        ]);
        return result.rows[0];
    }
    async delete(id) {
        const query = 'DELETE FROM assets WHERE id = $1 RETURNING *';
        const result = await database_1.default.query(query, [id]);
        return result.rows[0];
    }
    async search(query) {
        let baseQuery = 'SELECT * FROM assets';
        const values = [];
        const conditions = [];
        if (query.asset_tag) {
            conditions.push(`asset_tag = $${conditions.length + 1}`);
            values.push(query.asset_tag);
        }
        if (query.serial_number) {
            conditions.push(`serial_number = $${conditions.length + 1}`);
            values.push(query.serial_number);
        }
        if (query.asset_type) {
            conditions.push(`asset_type = $${conditions.length + 1}`);
            values.push(query.asset_type);
        }
        if (query.location) {
            conditions.push(`location = $${conditions.length + 1}`);
            values.push(query.location);
        }
        if (conditions.length > 0) {
            baseQuery += ' WHERE ' + conditions.join(' AND ');
        }
        const result = await database_1.default.query(baseQuery, values);
        return result.rows;
    }
}
exports.default = new AssetModel();
