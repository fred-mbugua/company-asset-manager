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
    static async count() {
        const query = `
        SELECT COUNT(*) as count 
        FROM assets;
    `;
        try {
            const result = await database_1.default.query(query);
            return parseInt(result.rows[0].count);
        }
        catch (error) {
            console.error('Error counting assets:', error);
            throw new Error('Failed to count assets');
        }
    }
    static async findAll(page = 1, itemsPerPage = 20) {
        const offset = (page - 1) * itemsPerPage;
        const query = `
    Select
        assets.id,
        assets.asset_tag,
        assets.asset_type,
        assets.manufacturer,
        assets.model,
        assets.serial_number,
        assets.status,
        assets.purchase_date,
        assets.purchase_price,
        assets.notes,
        asset_types.name As type_name,
        asset_statuses.name As status_name,
        branches.name As location
    From
        assets Inner Join
        asset_types On assets.asset_type_id = asset_types.id Inner Join
        asset_statuses On assets.asset_status_id = asset_statuses.id Inner Join
        branches On assets.branch_id = branches.id
    Order By
        assets.purchase_date Desc
    Limit $1 Offset $2;`;
        const countQuery = `
    Select Count(*) 
    From assets`;
        const [result, countResult] = await Promise.all([
            database_1.default.query(query, [itemsPerPage, offset]),
            database_1.default.query(countQuery)
        ]);
        return {
            assets: result.rows,
            total: parseInt(countResult.rows[0].count),
            page,
            itemsPerPage,
            totalPages: Math.ceil(parseInt(countResult.rows[0].count) / itemsPerPage)
        };
    }
    static async findById(id) {
        const query = `SELECT * FROM assets WHERE id = $1;`;
        const result = await database_1.default.query(query, [id]);
        return result.rows[0];
    }
    static async update(id, updateData) {
        // console.log('Updating asset with data:', updateData);
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
    static async findAllFiltered(filters) {
        const queryParams = [];
        const whereClauses = [];
        let paramIndex = 1;
        // console.log('Filtering Asset Report with filters:', filters);
        // Base Query: Performing necessary joins to get all required report fields
        let query = `
            SELECT
                assets.id,
                assets.asset_tag,
                assets.manufacturer,
                assets.model,
                assets.serial_number,
                assets.purchase_date,
                assets.purchase_price,
                assets.notes,
                asset_types.name AS type_name,
                asset_statuses.name AS status_name,
                branches.name AS location
            FROM
                assets
            INNER JOIN
                asset_types ON assets.asset_type_id = asset_types.id
            INNER JOIN
                asset_statuses ON assets.asset_status_id = asset_statuses.id
            LEFT JOIN
                assignments ON assignments.asset_id = assets.id
            LEFT JOIN
                employees ON assignments.employee_id = employees.id
            LEFT JOIN
                branches ON assets.branch_id = branches.id
        `;
        // --- Dynamic Filtering ---
        // Filtering by Asset Type Name
        if (filters.type) {
            whereClauses.push(`asset_types.name ILIKE $${paramIndex++}`);
            queryParams.push(`%${filters.type}%`);
        }
        // Filtering by Location Name
        if (filters.location) {
            whereClauses.push(`branches.name ILIKE $${paramIndex++}`);
            queryParams.push(`%${filters.location}%`);
        }
        // Filtering by Asset Status Name
        if (filters.status) {
            whereClauses.push(`asset_statuses.name ILIKE $${paramIndex++}`);
            queryParams.push(`%${filters.status}%`);
        }
        // Filtering by Asset Tag (Partial or Exact Match)
        if (filters.asset_tag) {
            whereClauses.push(`assets.asset_tag ILIKE $${paramIndex++}`);
            queryParams.push(`%${filters.asset_tag}%`);
        }
        // Filtering by Purchase Date Range
        if (filters.from_date) {
            whereClauses.push(`assets.purchase_date >= $${paramIndex++}`);
            queryParams.push(filters.from_date);
        }
        if (filters.to_date) {
            whereClauses.push(`assets.purchase_date <= $${paramIndex++}`);
            queryParams.push(filters.to_date);
        }
        // --- Assembling the final WHERE clause ---
        if (whereClauses.length > 0) {
            query += ` WHERE ${whereClauses.join(' AND ')}`;
        }
        // Adding final ordering
        query += ` ORDER BY assets.asset_tag DESC;`;
        // --- Executing Query ---
        try {
            // console.log('Executing Report Query:', query);
            // console.log('With Parameters:', queryParams);
            const result = await database_1.default.query(query, queryParams);
            // console.log('Report Query Result Count:', result.rowCount);
            return result.rows;
        }
        catch (error) {
            console.error('Error fetching filtered asset report data:', error);
            throw new Error('Database error during report generation.');
        }
    }
}
exports.default = AssetModel;
