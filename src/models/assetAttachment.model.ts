import db from '../config/database';

interface AssetAttachment {
    id: number;
    asset_id: number;
    file_name: string;
    file_path: string;
    file_size: number;
    file_type: string;
    storage_type: 'server' | 'firebase';
    notes: string | null;
    uploaded_by: number;
    uploaded_at: Date;
}

interface AssetAttachmentWithUser extends AssetAttachment {
    uploader_name: string;
    uploader_email: string;
}

class AssetAttachmentModel {
    static async create(attachmentData: {
        asset_id: number;
        file_name: string;
        file_path: string;
        file_size: number;
        file_type: string;
        storage_type: 'server' | 'firebase';
        notes?: string;
        uploaded_by: number;
    }): Promise<AssetAttachment> {
        const query = `
            INSERT INTO asset_attachments 
            (asset_id, file_name, file_path, file_size, file_type, storage_type, notes, uploaded_by)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *;
        `;
        const values = [
            attachmentData.asset_id,
            attachmentData.file_name,
            attachmentData.file_path,
            attachmentData.file_size,
            attachmentData.file_type,
            attachmentData.storage_type,
            attachmentData.notes || null,
            attachmentData.uploaded_by
        ];
        const result = await db.query(query, values);
        return result.rows[0];
    }

    static async findByAssetId(assetId: number): Promise<AssetAttachmentWithUser[]> {
        const query = `
            SELECT 
                aa.*,
                CONCAT(u.first_name, ' ', u.last_name) as uploader_name,
                u.email as uploader_email
            FROM asset_attachments aa
            LEFT JOIN users u ON aa.uploaded_by = u.id
            WHERE aa.asset_id = $1
            ORDER BY aa.uploaded_at DESC;
        `;
        const result = await db.query(query, [assetId]);
        return result.rows;
    }

    static async findById(id: number): Promise<AssetAttachment | null> {
        const query = `SELECT * FROM asset_attachments WHERE id = $1;`;
        const result = await db.query(query, [id]);
        return result.rows[0] || null;
    }

    static async delete(id: number): Promise<AssetAttachment> {
        const query = `DELETE FROM asset_attachments WHERE id = $1 RETURNING *;`;
        const result = await db.query(query, [id]);
        return result.rows[0];
    }

    static async count(assetId: number): Promise<number> {
        const query = `SELECT COUNT(*) as count FROM asset_attachments WHERE asset_id = $1;`;
        const result = await db.query(query, [assetId]);
        return parseInt(result.rows[0].count);
    }
}

export default AssetAttachmentModel;
