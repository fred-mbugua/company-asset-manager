import db from '../config/database';


// Defining the expected structure for the data returned by the join query
interface AssetReportData {
    id: number;
    asset_tag: string;
    type_name: string;
    manufacturer: string;
    model: string;
    serial_number: string;
    status_name: string;
    branch_id: string;
    department: string;
    purchase_date: Date;
    // Add other fields needed for the full report
}
class AssetModel {
    static async create(assetData: any) {
        const query = `
            INSERT INTO assets (asset_tag, asset_type, manufacturer, model, serial_number, status, purchase_date, purchase_price, notes, asset_type_id, asset_status_id, branch_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING *;
        `;
        const values = [assetData.asset_tag, assetData.asset_type, assetData.manufacturer, assetData.model, assetData.serial_number, assetData.status, assetData.purchase_date, assetData.purchase_price, assetData.notes, assetData.asset_type_id, assetData.asset_status_id, assetData.branch_id];
        const result = await db.query(query, values);
        return result.rows[0];
    }

    static async count(): Promise<number> {
        const query = `
        SELECT COUNT(*) as count 
        FROM assets;
    `;

        try {
            const result = await db.query(query);
            return parseInt(result.rows[0].count);
        } catch (error) {
            console.error('Error counting assets:', error);
            throw new Error('Failed to count assets');
        }
    }

    static async findAll(page: number = 1, itemsPerPage: number = 20) {
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
            db.query(query, [itemsPerPage, offset]),
            db.query(countQuery)
        ]);

        return {
            assets: result.rows,
            total: parseInt(countResult.rows[0].count),
            page,
            itemsPerPage,
            totalPages: Math.ceil(parseInt(countResult.rows[0].count) / itemsPerPage)
        };
    }

    static async findById(id: number) {
        const query = `SELECT * FROM assets WHERE id = $1;`;
        const result = await db.query(query, [id]);
        return result.rows[0];
    }

    static async update(id: number, updateData: any) {

        // console.log('Updating asset with data:', updateData);

        const query = `
            UPDATE assets SET asset_tag = $1, serial_number = $2, status = $3, purchase_price = $4, notes = $5, asset_status_id = $6
            WHERE id = $7
            RETURNING *;
        `;
        const values = [updateData.asset_tag, updateData.serial_number, updateData.status, updateData.purchase_price, updateData.notes, updateData.asset_status_id, id];
        const result = await db.query(query, values);
        return result.rows[0];
    }

    static async delete(id: number) {
        const query = `DELETE FROM assets WHERE id = $1;`;
        await db.query(query, [id]);
        return true;
    }

    static async search(filters: any) {
        const queryParams: any[] = [];
        const whereClauses: string[] = [];
        let paramIndex = 1;

        // Base Query with joins
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
                assets.asset_type,
                asset_statuses.name AS status_name,
                assets.status,
                branches.name AS location
            FROM
                assets
            INNER JOIN
                asset_types ON assets.asset_type_id = asset_types.id
            INNER JOIN
                asset_statuses ON assets.asset_status_id = asset_statuses.id
            LEFT JOIN
                branches ON assets.branch_id = branches.id
        `;

        // Dynamic Filtering
        if (filters.asset_tag) {
            whereClauses.push(`assets.asset_tag ILIKE $${paramIndex++}`);
            queryParams.push(`%${filters.asset_tag}%`);
        }

        if (filters.serial_number) {
            whereClauses.push(`assets.serial_number ILIKE $${paramIndex++}`);
            queryParams.push(`%${filters.serial_number}%`);
        }

        if (filters.type) {
            whereClauses.push(`asset_types.name ILIKE $${paramIndex++}`);
            queryParams.push(`%${filters.type}%`);
        }

        if (filters.status) {
            whereClauses.push(`asset_statuses.name ILIKE $${paramIndex++}`);
            queryParams.push(`%${filters.status}%`);
        }

        if (filters.location) {
            whereClauses.push(`branches.name ILIKE $${paramIndex++}`);
            queryParams.push(`%${filters.location}%`);
        }

        if (filters.from_date) {
            whereClauses.push(`assets.purchase_date >= $${paramIndex++}`);
            queryParams.push(filters.from_date);
        }

        if (filters.to_date) {
            whereClauses.push(`assets.purchase_date <= $${paramIndex++}`);
            queryParams.push(filters.to_date);
        }

        // Assemble WHERE clause
        if (whereClauses.length > 0) {
            query += ` WHERE ${whereClauses.join(' AND ')}`;
        }

        // Get total count before pagination
        const countQuery = query.replace(/SELECT[\s\S]*FROM/, 'SELECT COUNT(*) FROM');
        const countResult = await db.query(countQuery, queryParams);
        const totalCount = parseInt(countResult.rows[0].count);

        // Add ordering and pagination
        query += ` ORDER BY assets.purchase_date DESC`;
        
        if (filters.limit) {
            query += ` LIMIT $${paramIndex++}`;
            queryParams.push(filters.limit);
        }

        if (filters.offset) {
            query += ` OFFSET $${paramIndex++}`;
            queryParams.push(filters.offset);
        }

        const result = await db.query(query, queryParams);
        
        return {
            assets: result.rows,
            totalCount: totalCount
        };
    }

    static async findAllFiltered(filters: any): Promise<AssetReportData[]> {
        const queryParams: any[] = [];
        const whereClauses: string[] = [];
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
            const result = await db.query(query, queryParams);
            // console.log('Report Query Result Count:', result.rowCount);
            return result.rows;
        } catch (error) {
            console.error('Error fetching filtered asset report data:', error);
            throw new Error('Database error during report generation.');
        }
    }

    static async getAssetStatuses() {
        const query = `SELECT * FROM asset_statuses ORDER BY name;`;
        const result = await db.query(query);
        return result.rows;
    }    
}

export default AssetModel;