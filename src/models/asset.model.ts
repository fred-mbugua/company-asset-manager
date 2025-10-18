import db from '../config/database';


// Define the expected structure for the data returned by the join query
interface AssetReportData {
    id: number;
    asset_tag: string;
    type_name: string;
    manufacturer: string;
    model: string;
    serial_number: string;
    status_name: string;
    location: string;
    department: string;
    purchase_date: Date;
    // Add other fields you need for the full report
}
class AssetModel {
    static async create(assetData: any) {
        const query = `
            INSERT INTO assets (asset_tag, asset_type, manufacturer, model, serial_number, status, location, purchase_date, purchase_price, notes)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *;
        `;
        const values = [assetData.asset_tag, assetData.asset_type, assetData.manufacturer, assetData.model, assetData.serial_number, assetData.status, assetData.location, assetData.purchase_date, assetData.purchase_price, assetData.notes];
        const result = await db.query(query, values);
        return result.rows[0];
    }

    static async findAll() {
        const query = `
        Select
            assets.id,
            assets.asset_tag,
            assets.asset_type,
            assets.manufacturer,
            assets.model,
            assets.serial_number,
            assets.status,
            assets.location,
            assets.purchase_date,
            assets.purchase_price,
            assets.notes,
            asset_types.name As type_name,
            asset_statuses.name As status_name
        From
            assets Inner Join
            asset_types On assets.asset_type_id = asset_types.id Inner Join
            asset_statuses On assets.asset_status_id = asset_statuses.id
        Order By
            assets.purchase_date Desc LIMIT 20;`;
        const result = await db.query(query);
        return result.rows;
    }

    static async findById(id: number) {
        const query = `SELECT * FROM assets WHERE id = $1;`;
        const result = await db.query(query, [id]);
        return result.rows[0];
    }
    
    static async update(id: number, updateData: any) {

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

    /**
     * Fetches all assets, applying dynamic filters. Designed for full reports (no LIMIT/OFFSET).
     * @param filters - An object containing filtering criteria (e.g., { type: 'Laptop', location: 'NY' }).
     * @returns A promise resolving to an array of all matching asset records.
     */
    static async findAllFiltered(filters: any): Promise<AssetReportData[]> {
        const queryParams: any[] = [];
        const whereClauses: string[] = [];
        let paramIndex = 1;

        // Base Query: Perform necessary joins to get all required report fields
        let query = `
            SELECT
                a.id,
                a.asset_tag,
                at.name AS type_name,
                a.manufacturer,
                a.model,
                a.serial_number,
                ast.name AS status_name,
                l.name AS location,
                d.name AS department,
                a.purchase_date
            FROM
                assets a
            LEFT JOIN asset_types at ON a.asset_type_id = at.id
            LEFT JOIN asset_statuses ast ON a.asset_status_id = ast.id
            LEFT JOIN locations l ON a.location_id = l.id
            LEFT JOIN departments d ON a.department_id = d.id
        `;
        
        // --- Dynamic Filtering ---

        // Filter by Asset Type Name
        if (filters.type) {
            whereClauses.push(`at.name ILIKE $${paramIndex++}`);
            queryParams.push(`%${filters.type}%`);
        }

        // Filter by Location Name
        if (filters.location) {
            whereClauses.push(`l.name ILIKE $${paramIndex++}`);
            queryParams.push(`%${filters.location}%`);
        }

        // Filter by Department Name
        if (filters.department) {
            whereClauses.push(`d.name ILIKE $${paramIndex++}`);
            queryParams.push(`%${filters.department}%`);
        }
        
        // Filter by Asset Status Name (Example if you add this filter later)
        if (filters.status) {
            whereClauses.push(`ast.name ILIKE $${paramIndex++}`);
            queryParams.push(`%${filters.status}%`);
        }

        // Filter by Asset Tag (Partial or Exact Match)
        if (filters.asset_tag) {
            whereClauses.push(`a.asset_tag ILIKE $${paramIndex++}`);
            queryParams.push(`%${filters.asset_tag}%`);
        }


        // --- Assemble the final WHERE clause ---
        if (whereClauses.length > 0) {
            query += ` WHERE ${whereClauses.join(' AND ')}`;
        }

        // Add final ordering
        query += ` ORDER BY a.asset_tag ASC;`;
        
        // --- Execute Query ---
        try {
            console.log('Executing Report Query:', query);
            const result = await db.query(query, queryParams);
            return result.rows;
        } catch (error) {
            console.error('Error fetching filtered asset report data:', error);
            throw new Error('Database error during report generation.');
        }
    }
}

export default AssetModel;