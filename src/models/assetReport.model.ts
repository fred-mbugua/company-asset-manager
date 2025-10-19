import db from '../config/database';

interface IAssetReportFilters {
    type?: string;
    status?: string;
    department?: string;
    location?: string;
    from_date?: string; // Expects YYYY-MM-DD format
    to_date?: string;   // Expects YYYY-MM-DD format
    // Add other filters as the system expands (e.g., manufacturer, serial_number)
}

// Data structure returned by the database
interface AssetReportData {
    id: number;
    asset_tag: string;
    type_name: string;
    manufacturer: string;
    model: string;
    serial_number: string;
    status_name: string;
    purchase_date: Date;
    purchase_price: number;
    notes: string;
    location: string;
}

export class AssetReportModel {

    /**
     * Fetches all asset records, filtered by criteria. For non-paginated exports.
     * @param filters - An object containing filtering criteria.
     * @returns A Promise resolving to an array of all filtered asset records.
     */
    async findAllFiltered(filters: IAssetReportFilters): Promise<AssetReportData[]> {
        
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
            WHERE
                1=1 -- Base condition to easily append AND clauses
        `;

        const values: any[] = [];
        let paramIndex = 1;

        // --- Apply Filters ---

        if (filters.type) {
            query += ` AND asset_types.name = $${paramIndex++}`;
            values.push(filters.type);
        }

        if (filters.status) {
            query += ` AND asset_statuses.name = $${paramIndex++}`;
            values.push(filters.status);
        }
        
        if (filters.location) {
            query += ` AND branches.name = $${paramIndex++}`;
            values.push(filters.location);
        }

        // --- Purchase Date Range Filter ---
        
        if (filters.from_date) {
            // Filter records purchased ON or AFTER the start date
            query += ` AND assets.purchase_date >= $${paramIndex++}`;
            values.push(filters.from_date);
        }

        if (filters.to_date) {
            // Filter records purchased ON or BEFORE the end date
            query += ` AND assets.purchase_date <= $${paramIndex++}`;
            values.push(filters.to_date);
        }

        query += ` ORDER BY assets.purchase_date DESC;`;

        // console.log('Asset Report Query:', query);
        // console.log('With Values:', values);

        // Execute Query
        const result = await db.query(query, values);
        // console.log('Asset Report Result Rows:', result.rows);
        return result.rows;
    }
}

export default new AssetReportModel();