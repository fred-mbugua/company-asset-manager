import db from '../config/database';

// ============================================================================
// INTERFACES
// ============================================================================

export interface IRepairRequestAttachment {
    id: number;
    repair_request_id: number;
    file_name: string;
    file_path: string;
    file_size?: number;
    file_type?: string;
    storage_type: 'server' | 'firebase';
    attachment_type: string;
    notes?: string;
    uploaded_by: number;
    uploaded_at: Date;
    
    // Joined fields
    uploader_name?: string;
}

export interface ICreateRepairRequestAttachment {
    repair_request_id: number;
    file_name: string;
    file_path: string;
    file_size?: number;
    file_type?: string;
    storage_type?: 'server' | 'firebase';
    attachment_type?: string;
    notes?: string;
    uploaded_by: number;
}

// ============================================================================
// MODEL CLASS
// ============================================================================

export class RepairRequestAttachmentModel {
    /**
     * Creates a new attachment
     */
    async create(data: ICreateRepairRequestAttachment): Promise<IRepairRequestAttachment> {
        const query = `
            INSERT INTO repair_request_attachments 
            (repair_request_id, file_name, file_path, file_size, file_type, storage_type, attachment_type, notes, uploaded_by)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *;
        `;
        const values = [
            data.repair_request_id,
            data.file_name,
            data.file_path,
            data.file_size || null,
            data.file_type || null,
            data.storage_type || 'server',
            data.attachment_type || 'general',
            data.notes || null,
            data.uploaded_by
        ];

        const result = await db.query(query, values);
        return result.rows[0];
    }

    /**
     * Find all attachments for a repair request
     */
    async findByRequestId(requestId: number): Promise<IRepairRequestAttachment[]> {
        const query = `
            SELECT 
                rra.*,
                CONCAT(u.first_name, ' ', u.last_name) AS uploader_name
            FROM repair_request_attachments rra
            LEFT JOIN users u ON rra.uploaded_by = u.id
            WHERE rra.repair_request_id = $1
            ORDER BY rra.uploaded_at DESC;
        `;
        const result = await db.query(query, [requestId]);
        return result.rows;
    }

    /**
     * Find attachment by ID
     */
    async findById(id: number): Promise<IRepairRequestAttachment | null> {
        const query = `
            SELECT 
                rra.*,
                CONCAT(u.first_name, ' ', u.last_name) AS uploader_name
            FROM repair_request_attachments rra
            LEFT JOIN users u ON rra.uploaded_by = u.id
            WHERE rra.id = $1;
        `;
        const result = await db.query(query, [id]);
        return result.rows[0] || null;
    }

    /**
     * Find attachments by type
     */
    async findByType(requestId: number, attachmentType: string): Promise<IRepairRequestAttachment[]> {
        const query = `
            SELECT 
                rra.*,
                CONCAT(u.first_name, ' ', u.last_name) AS uploader_name
            FROM repair_request_attachments rra
            LEFT JOIN users u ON rra.uploaded_by = u.id
            WHERE rra.repair_request_id = $1 AND rra.attachment_type = $2
            ORDER BY rra.uploaded_at DESC;
        `;
        const result = await db.query(query, [requestId, attachmentType]);
        return result.rows;
    }

    /**
     * Update attachment
     */
    async update(id: number, data: Partial<ICreateRepairRequestAttachment>): Promise<IRepairRequestAttachment> {
        const allowedFields = ['file_name', 'notes', 'attachment_type'];
        const updates: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        for (const [key, value] of Object.entries(data)) {
            if (allowedFields.includes(key)) {
                updates.push(`${key} = $${paramIndex++}`);
                values.push(value);
            }
        }

        if (updates.length === 0) {
            throw new Error('No valid fields to update');
        }

        values.push(id);
        const query = `
            UPDATE repair_request_attachments
            SET ${updates.join(', ')}
            WHERE id = $${paramIndex}
            RETURNING *;
        `;

        const result = await db.query(query, values);
        if (result.rows.length === 0) {
            throw new Error('Attachment not found');
        }
        return result.rows[0];
    }

    /**
     * Delete attachment
     */
    async delete(id: number): Promise<IRepairRequestAttachment> {
        // First get the attachment to return its info (needed for file deletion)
        const attachment = await this.findById(id);
        if (!attachment) {
            throw new Error('Attachment not found');
        }

        const query = `DELETE FROM repair_request_attachments WHERE id = $1;`;
        await db.query(query, [id]);
        
        return attachment;
    }

    /**
     * Count attachments for a repair request
     */
    async countByRequestId(requestId: number): Promise<number> {
        const query = `SELECT COUNT(*) FROM repair_request_attachments WHERE repair_request_id = $1;`;
        const result = await db.query(query, [requestId]);
        return parseInt(result.rows[0].count);
    }

    /**
     * Get invoice attachments for a repair request
     */
    async getInvoiceAttachments(requestId: number): Promise<IRepairRequestAttachment[]> {
        return this.findByType(requestId, 'invoice');
    }
}

export default new RepairRequestAttachmentModel();
