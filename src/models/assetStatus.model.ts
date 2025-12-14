import db from '../config/database';

interface IAssetStatus {
    id: number;
    name: string;
    is_available: boolean;
    description?: string;
}

interface ICreateAssetStatus {
    name: string;
    is_available?: boolean;
    description?: string;
}

export class AssetStatusModel {

    /**
     * Stores a new asset status, preventing duplicates.
     */
    async create(data: ICreateAssetStatus): Promise<IAssetStatus> {
        const query = `
            INSERT INTO asset_statuses (name, is_available, description)
            VALUES ($1, $2, $3)
            RETURNING id, name, is_available, description;
        `;
        const values = [
            data.name, 
            data.is_available ?? false, // Default to FALSE if not provided
            data.description || null
        ];

        try {
            const result = await db.query(query, values);
            return result.rows[0];
        } catch (error: any) {
            // PostgreSQL Error Code 23505 for unique_violation
            if (error.code === '23505') {
                throw new Error(`Duplicate asset status: ${data.name}`);
            }
            throw error;
        }
    }

    /**
     * Retrieves all asset statuses.
     */
    async findAll(): Promise<IAssetStatus[]> {
        const query = `SELECT id, name, is_available, description FROM asset_statuses ORDER BY name;`;
        const result = await db.query(query);
        return result.rows;
    }

    /**
     * Finds a single asset status by ID.
     */
    async findById(id: number): Promise<IAssetStatus | null> {
        const query = `SELECT id, name, is_available, description FROM asset_statuses WHERE id = $1;`;
        const result = await db.query(query, [id]);
        return result.rows[0] || null;
    }

    /**
     * Updates an asset status.
     */
    async update(id: number, data: Partial<ICreateAssetStatus>): Promise<IAssetStatus> {
        const query = `
            UPDATE asset_statuses
            SET name = COALESCE($1, name),
                is_available = COALESCE($2, is_available),
                description = COALESCE($3, description),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $4
            RETURNING id, name, is_available, description;
        `;
        const values = [data.name, data.is_available, data.description, id];

        try {
            const result = await db.query(query, values);
            if (result.rows.length === 0) {
                throw new Error('Asset status not found');
            }
            return result.rows[0];
        } catch (error: any) {
            if (error.code === '23505') {
                throw new Error(`Duplicate asset status: ${data.name}`);
            }
            throw error;
        }
    }

    /**
     * Deletes an asset status.
     */
    async delete(id: number): Promise<void> {
        const query = `DELETE FROM asset_statuses WHERE id = $1;`;
        const result = await db.query(query, [id]);
        if (result.rowCount === 0) {
            throw new Error('Asset status not found');
        }
    }
}

export default new AssetStatusModel();