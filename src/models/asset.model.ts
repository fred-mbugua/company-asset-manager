import db from '../config/database';

class AssetModel {
    static async create(assetData: any) {
        const query = `
            INSERT INTO assets (asset_tag, serial_number, description, purchase_date, purchase_price)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `;
        const values = [assetData.asset_tag, assetData.serial_number, assetData.description, assetData.purchase_date, assetData.purchase_price];
        const result = await db.query(query, values);
        return result.rows[0];
    }

    static async findAll() {
        const query = `SELECT * FROM assets;`;
        const result = await db.query(query);
        return result.rows;
    }

    static async findById(id: number) {
        const query = `SELECT * FROM assets WHERE id = $1;`;
        const result = await db.query(query, [id]);
        return result.rows[0];
    }
    
    static async update(id: number, updateData: any) {
        const query = `
            UPDATE assets SET asset_tag = $1, serial_number = $2, description = $3, purchase_date = $4, purchase_price = $5
            WHERE id = $6
            RETURNING *;
        `;
        const values = [updateData.asset_tag, updateData.serial_number, updateData.description, updateData.purchase_date, updateData.purchase_price, id];
        const result = await db.query(query, values);
        return result.rows[0];
    }

    static async delete(id: number) {
        const query = `DELETE FROM assets WHERE id = $1;`;
        await db.query(query, [id]);
        return true;
    }

    static async search(query: any) {
        const searchQuery = `%${query.searchTerm}%`;
        const sql = `
            SELECT * FROM assets
            WHERE asset_tag ILIKE $1 OR description ILIKE $1;
        `;
        const result = await db.query(sql, [searchQuery]);
        return result.rows;
    }
}

export default AssetModel;