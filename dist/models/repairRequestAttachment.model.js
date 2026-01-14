"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepairRequestAttachmentModel = void 0;
const database_1 = __importDefault(require("../config/database"));
// ============================================================================
// MODEL CLASS
// ============================================================================
class RepairRequestAttachmentModel {
    /**
     * Creates a new attachment
     */
    async create(data) {
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
        const result = await database_1.default.query(query, values);
        return result.rows[0];
    }
    /**
     * Find all attachments for a repair request
     */
    async findByRequestId(requestId) {
        const query = `
            SELECT 
                rra.*,
                CONCAT(u.first_name, ' ', u.last_name) AS uploader_name
            FROM repair_request_attachments rra
            LEFT JOIN users u ON rra.uploaded_by = u.id
            WHERE rra.repair_request_id = $1
            ORDER BY rra.uploaded_at DESC;
        `;
        const result = await database_1.default.query(query, [requestId]);
        return result.rows;
    }
    /**
     * Find attachment by ID
     */
    async findById(id) {
        const query = `
            SELECT 
                rra.*,
                CONCAT(u.first_name, ' ', u.last_name) AS uploader_name
            FROM repair_request_attachments rra
            LEFT JOIN users u ON rra.uploaded_by = u.id
            WHERE rra.id = $1;
        `;
        const result = await database_1.default.query(query, [id]);
        return result.rows[0] || null;
    }
    /**
     * Find attachments by type
     */
    async findByType(requestId, attachmentType) {
        const query = `
            SELECT 
                rra.*,
                CONCAT(u.first_name, ' ', u.last_name) AS uploader_name
            FROM repair_request_attachments rra
            LEFT JOIN users u ON rra.uploaded_by = u.id
            WHERE rra.repair_request_id = $1 AND rra.attachment_type = $2
            ORDER BY rra.uploaded_at DESC;
        `;
        const result = await database_1.default.query(query, [requestId, attachmentType]);
        return result.rows;
    }
    /**
     * Update attachment
     */
    async update(id, data) {
        const allowedFields = ['file_name', 'notes', 'attachment_type'];
        const updates = [];
        const values = [];
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
        const result = await database_1.default.query(query, values);
        if (result.rows.length === 0) {
            throw new Error('Attachment not found');
        }
        return result.rows[0];
    }
    /**
     * Delete attachment
     */
    async delete(id) {
        // First get the attachment to return its info (needed for file deletion)
        const attachment = await this.findById(id);
        if (!attachment) {
            throw new Error('Attachment not found');
        }
        const query = `DELETE FROM repair_request_attachments WHERE id = $1;`;
        await database_1.default.query(query, [id]);
        return attachment;
    }
    /**
     * Count attachments for a repair request
     */
    async countByRequestId(requestId) {
        const query = `SELECT COUNT(*) FROM repair_request_attachments WHERE repair_request_id = $1;`;
        const result = await database_1.default.query(query, [requestId]);
        return parseInt(result.rows[0].count);
    }
    /**
     * Get invoice attachments for a repair request
     */
    async getInvoiceAttachments(requestId) {
        return this.findByType(requestId, 'invoice');
    }
}
exports.RepairRequestAttachmentModel = RepairRequestAttachmentModel;
exports.default = new RepairRequestAttachmentModel();
