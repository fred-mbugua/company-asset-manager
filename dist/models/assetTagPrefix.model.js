"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetTagPrefixModel = void 0;
const database_1 = __importDefault(require("../config/database"));
class AssetTagPrefixModel {
    /**
     * Get prefix configuration for an asset type
     */
    async findByAssetTypeId(assetTypeId) {
        const query = `
            SELECT * FROM asset_tag_prefixes 
            WHERE asset_type_id = $1;
        `;
        const result = await database_1.default.query(query, [assetTypeId]);
        return result.rows[0] || null;
    }
    /**
     * Get all prefix configurations
     */
    async findAll() {
        const query = `
            SELECT atp.*, at.name as type_name 
            FROM asset_tag_prefixes atp
            LEFT JOIN asset_types at ON atp.asset_type_id = at.id
            ORDER BY at.name ASC;
        `;
        const result = await database_1.default.query(query);
        return result.rows;
    }
    /**
     * Create or update prefix for an asset type
     */
    async upsert(assetTypeId, prefix) {
        const query = `
            INSERT INTO asset_tag_prefixes (asset_type_id, prefix, last_sequence)
            VALUES ($1, $2, 0)
            ON CONFLICT (asset_type_id) 
            DO UPDATE SET prefix = $2, updated_at = CURRENT_TIMESTAMP
            RETURNING *;
        `;
        const result = await database_1.default.query(query, [assetTypeId, prefix]);
        return result.rows[0];
    }
    /**
     * Generate the next asset tag for a given asset type
     * Uses a transaction with row locking to prevent duplicates
     * Checks the highest existing number in the assets table to ensure uniqueness
     */
    async generateNextTag(assetTypeId) {
        var _a;
        const client = await database_1.default.connect();
        try {
            await client.query('BEGIN');
            // Lock the row for update to prevent race conditions
            const lockQuery = `
                SELECT * FROM asset_tag_prefixes 
                WHERE asset_type_id = $1 
                FOR UPDATE;
            `;
            const prefixResult = await client.query(lockQuery, [assetTypeId]);
            let prefix;
            let nextSequence;
            if (prefixResult.rows.length === 0) {
                // No prefix configured, create a default one
                const typeQuery = `SELECT name FROM asset_types WHERE id = $1`;
                const typeResult = await client.query(typeQuery, [assetTypeId]);
                const typeName = ((_a = typeResult.rows[0]) === null || _a === void 0 ? void 0 : _a.name) || 'ASSET';
                // Create default prefix from first 3 characters
                prefix = 'ICT-' + typeName.substring(0, 3).toUpperCase();
            }
            else {
                prefix = prefixResult.rows[0].prefix;
            }
            // Get the highest existing number from ALL assets in the table
            // This ensures the new number is always higher than any existing asset tag globally
            const maxNumberQuery = `
                SELECT asset_tag FROM assets 
                WHERE asset_tag ~ '-[0-9]+$'
                ORDER BY CAST(SUBSTRING(asset_tag FROM '-([0-9]+)$') AS INTEGER) DESC 
                LIMIT 1;
            `;
            const maxNumberResult = await client.query(maxNumberQuery);
            let highestExistingNumber = 0;
            if (maxNumberResult.rows.length > 0) {
                const existingTag = maxNumberResult.rows[0].asset_tag;
                // Extract the numeric part from the asset tag (e.g., "ICT-LPT-007" -> 7)
                const match = existingTag.match(/-(\d+)$/);
                if (match) {
                    highestExistingNumber = parseInt(match[1], 10);
                }
            }
            // Get the stored sequence from asset_tag_prefixes
            const storedSequence = prefixResult.rows.length > 0 ? prefixResult.rows[0].last_sequence : 0;
            // The next sequence should be the maximum of stored sequence + 1 and highest existing + 1
            nextSequence = Math.max(storedSequence + 1, highestExistingNumber + 1);
            if (prefixResult.rows.length === 0) {
                // Insert new prefix record with the computed sequence
                await client.query(`INSERT INTO asset_tag_prefixes (asset_type_id, prefix, last_sequence) VALUES ($1, $2, $3)`, [assetTypeId, prefix, nextSequence]);
            }
            else {
                // Update the sequence to match or exceed the highest existing number
                await client.query(`UPDATE asset_tag_prefixes SET last_sequence = $1, updated_at = CURRENT_TIMESTAMP WHERE asset_type_id = $2`, [nextSequence, assetTypeId]);
            }
            await client.query('COMMIT');
            // Format the tag with padded sequence number (e.g., ICT-PRT-001)
            const paddedSequence = nextSequence.toString().padStart(3, '0');
            return `${prefix}-${paddedSequence}`;
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    /**
     * Check if an asset tag already exists
     */
    async tagExists(assetTag) {
        const query = `SELECT 1 FROM assets WHERE asset_tag = $1 LIMIT 1`;
        const result = await database_1.default.query(query, [assetTag]);
        return result.rows.length > 0;
    }
    /**
     * Update prefix for an asset type
     */
    async updatePrefix(assetTypeId, prefix) {
        const query = `
            UPDATE asset_tag_prefixes 
            SET prefix = $1, updated_at = CURRENT_TIMESTAMP
            WHERE asset_type_id = $2
            RETURNING *;
        `;
        const result = await database_1.default.query(query, [prefix, assetTypeId]);
        return result.rows[0];
    }
    /**
     * Get current sequence for display purposes
     * Also checks the highest existing number in the assets table
     */
    async getNextSequencePreview(assetTypeId) {
        var _a;
        const result = await this.findByAssetTypeId(assetTypeId);
        let prefix;
        let storedSequence;
        if (!result) {
            const typeQuery = `SELECT name FROM asset_types WHERE id = $1`;
            const typeResult = await database_1.default.query(typeQuery, [assetTypeId]);
            const typeName = ((_a = typeResult.rows[0]) === null || _a === void 0 ? void 0 : _a.name) || 'ASSET';
            prefix = 'ICT-' + typeName.substring(0, 3).toUpperCase();
            storedSequence = 0;
        }
        else {
            prefix = result.prefix;
            storedSequence = result.last_sequence;
        }
        // Get the highest existing number from ALL assets in the table
        const maxNumberQuery = `
            SELECT asset_tag FROM assets 
            WHERE asset_tag ~ '-[0-9]+$'
            ORDER BY CAST(SUBSTRING(asset_tag FROM '-([0-9]+)$') AS INTEGER) DESC 
            LIMIT 1;
        `;
        const maxNumberResult = await database_1.default.query(maxNumberQuery);
        let highestExistingNumber = 0;
        if (maxNumberResult.rows.length > 0) {
            const existingTag = maxNumberResult.rows[0].asset_tag;
            // Extract the numeric part from the asset tag (e.g., "ICT-LPT-007" -> 7)
            const match = existingTag.match(/-(\d+)$/);
            if (match) {
                highestExistingNumber = parseInt(match[1], 10);
            }
        }
        // The next number should be the maximum of stored sequence + 1 and highest existing + 1
        const nextNumber = Math.max(storedSequence + 1, highestExistingNumber + 1);
        return {
            prefix,
            nextNumber
        };
    }
}
exports.AssetTagPrefixModel = AssetTagPrefixModel;
exports.default = new AssetTagPrefixModel();
