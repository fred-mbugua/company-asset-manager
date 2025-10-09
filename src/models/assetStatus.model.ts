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
}

export default new AssetStatusModel();