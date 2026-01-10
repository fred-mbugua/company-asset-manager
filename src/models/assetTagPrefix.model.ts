import db from '../config/database';

interface IAssetTagPrefix {
    id: number;
    asset_type_id: number;
    prefix: string;
    last_sequence: number;
    created_at: Date;
    updated_at: Date;
}

export class AssetTagPrefixModel {
    /**
     * Get prefix configuration for an asset type
     */
    async findByAssetTypeId(assetTypeId: number): Promise<IAssetTagPrefix | null> {
        const query = `
            SELECT * FROM asset_tag_prefixes 
            WHERE asset_type_id = $1;
        `;
        const result = await db.query(query, [assetTypeId]);
        return result.rows[0] || null;
    }

    /**
     * Get all prefix configurations
     */
    async findAll(): Promise<IAssetTagPrefix[]> {
        const query = `
            SELECT atp.*, at.name as type_name 
            FROM asset_tag_prefixes atp
            LEFT JOIN asset_types at ON atp.asset_type_id = at.id
            ORDER BY at.name ASC;
        `;
        const result = await db.query(query);
        return result.rows;
    }

    /**
     * Create or update prefix for an asset type
     */
    async upsert(assetTypeId: number, prefix: string): Promise<IAssetTagPrefix> {
        const query = `
            INSERT INTO asset_tag_prefixes (asset_type_id, prefix, last_sequence)
            VALUES ($1, $2, 0)
            ON CONFLICT (asset_type_id) 
            DO UPDATE SET prefix = $2, updated_at = CURRENT_TIMESTAMP
            RETURNING *;
        `;
        const result = await db.query(query, [assetTypeId, prefix]);
        return result.rows[0];
    }

    /**
     * Generate the next asset tag for a given asset type
     * Uses a transaction with row locking to prevent duplicates
     */
    async generateNextTag(assetTypeId: number): Promise<string> {
        const client = await db.connect();
        
        try {
            await client.query('BEGIN');
            
            // Lock the row for update to prevent race conditions
            const lockQuery = `
                SELECT * FROM asset_tag_prefixes 
                WHERE asset_type_id = $1 
                FOR UPDATE;
            `;
            const prefixResult = await client.query(lockQuery, [assetTypeId]);
            
            let prefix: string;
            let nextSequence: number;
            
            if (prefixResult.rows.length === 0) {
                // No prefix configured, create a default one
                const typeQuery = `SELECT name FROM asset_types WHERE id = $1`;
                const typeResult = await client.query(typeQuery, [assetTypeId]);
                const typeName = typeResult.rows[0]?.name || 'ASSET';
                
                // Create default prefix from first 3 characters
                prefix = 'ICT-' + typeName.substring(0, 3).toUpperCase();
                nextSequence = 1;
                
                // Insert new prefix record
                await client.query(
                    `INSERT INTO asset_tag_prefixes (asset_type_id, prefix, last_sequence) VALUES ($1, $2, $3)`,
                    [assetTypeId, prefix, nextSequence]
                );
            } else {
                prefix = prefixResult.rows[0].prefix;
                nextSequence = prefixResult.rows[0].last_sequence + 1;
                
                // Update the sequence
                await client.query(
                    `UPDATE asset_tag_prefixes SET last_sequence = $1, updated_at = CURRENT_TIMESTAMP WHERE asset_type_id = $2`,
                    [nextSequence, assetTypeId]
                );
            }
            
            await client.query('COMMIT');
            
            // Format the tag with padded sequence number (e.g., ICT-PRT-001)
            const paddedSequence = nextSequence.toString().padStart(3, '0');
            return `${prefix}-${paddedSequence}`;
            
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Check if an asset tag already exists
     */
    async tagExists(assetTag: string): Promise<boolean> {
        const query = `SELECT 1 FROM assets WHERE asset_tag = $1 LIMIT 1`;
        const result = await db.query(query, [assetTag]);
        return result.rows.length > 0;
    }

    /**
     * Update prefix for an asset type
     */
    async updatePrefix(assetTypeId: number, prefix: string): Promise<IAssetTagPrefix> {
        const query = `
            UPDATE asset_tag_prefixes 
            SET prefix = $1, updated_at = CURRENT_TIMESTAMP
            WHERE asset_type_id = $2
            RETURNING *;
        `;
        const result = await db.query(query, [prefix, assetTypeId]);
        return result.rows[0];
    }

    /**
     * Get current sequence for display purposes
     */
    async getNextSequencePreview(assetTypeId: number): Promise<{ prefix: string; nextNumber: number }> {
        const result = await this.findByAssetTypeId(assetTypeId);
        if (!result) {
            const typeQuery = `SELECT name FROM asset_types WHERE id = $1`;
            const typeResult = await db.query(typeQuery, [assetTypeId]);
            const typeName = typeResult.rows[0]?.name || 'ASSET';
            return {
                prefix: 'ICT-' + typeName.substring(0, 3).toUpperCase(),
                nextNumber: 1
            };
        }
        return {
            prefix: result.prefix,
            nextNumber: result.last_sequence + 1
        };
    }
}

export default new AssetTagPrefixModel();
