import db from '../config/database';

interface IAssetType {
    id: number;
    name: string;
    description?: string;
}

interface ICreateAssetType {
    name: string;
    description?: string;
}

export class AssetTypeModel {

    /**
     * Stores a new asset type. Handles unique constraint violation error.
     * @param data - The name and description of the asset type.
     * @returns The created asset type object.
     */
    async create(data: ICreateAssetType): Promise<IAssetType> {
        const query = `
            INSERT INTO asset_types (name, description)
            VALUES ($1, $2)
            RETURNING id, name, description;
        `;
        const values = [data.name, data.description || null];

        try {
            const result = await db.query(query, values);
            return result.rows[0];
        } catch (error: any) {
            // PostgreSQL Error Code 23505 is for unique_violation
            if (error.code === '23505') {
                // Throw a standardized error that the Service layer can catch and handle.
                throw new Error(`Duplicate asset type: ${data.name}`);
            }
            throw error; // Re-throw any other database errors
        }
    }

    /**
     * Retrieves all asset types.
     */
    async findAll(): Promise<IAssetType[]> {
        const query = `SELECT * FROM asset_types ORDER BY name;`;
        const result = await db.query(query);
        return result.rows;
    }

    /**
     * Finds a single asset type by ID.
     */
    async findById(id: number): Promise<IAssetType | null> {
        const query = `SELECT id, name, description FROM asset_types WHERE id = $1;`;
        const result = await db.query(query, [id]);
        return result.rows[0] || null;
    }

    /**
     * Updates an asset type.
     */
    async update(id: number, data: Partial<ICreateAssetType>): Promise<IAssetType> {
        const query = `
            UPDATE asset_types
            SET name = COALESCE($1, name),
                description = COALESCE($2, description),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $3
            RETURNING id, name, description;
        `;
        const values = [data.name, data.description, id];

        try {
            const result = await db.query(query, values);
            if (result.rows.length === 0) {
                throw new Error('Asset type not found');
            }
            return result.rows[0];
        } catch (error: any) {
            if (error.code === '23505') {
                throw new Error(`Duplicate asset type: ${data.name}`);
            }
            throw error;
        }
    }

    /**
     * Deletes an asset type.
     */
    async delete(id: number): Promise<void> {
        const query = `DELETE FROM asset_types WHERE id = $1;`;
        const result = await db.query(query, [id]);
        if (result.rowCount === 0) {
            throw new Error('Asset type not found');
        }
    }
}

export default new AssetTypeModel();