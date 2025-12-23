"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("../config/database"));
class AssignmentAttachmentModel {
    static async create(attachmentData) {
        const query = `
            INSERT INTO assignment_attachments 
            (assignment_id, file_name, file_path, file_size, file_type, storage_type, notes, uploaded_by)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *;
        `;
        const values = [
            attachmentData.assignment_id,
            attachmentData.file_name,
            attachmentData.file_path,
            attachmentData.file_size,
            attachmentData.file_type,
            attachmentData.storage_type,
            attachmentData.notes || null,
            attachmentData.uploaded_by
        ];
        const result = await database_1.default.query(query, values);
        return result.rows[0];
    }
    static async findByAssignmentId(assignmentId) {
        const query = `
            SELECT 
                aa.*,
                CONCAT(u.first_name, ' ', u.last_name) as uploader_name,
                u.email as uploader_email
            FROM assignment_attachments aa
            LEFT JOIN users u ON aa.uploaded_by = u.id
            WHERE aa.assignment_id = $1
            ORDER BY aa.uploaded_at DESC;
        `;
        const result = await database_1.default.query(query, [assignmentId]);
        return result.rows;
    }
    static async findById(id) {
        const query = `SELECT * FROM assignment_attachments WHERE id = $1;`;
        const result = await database_1.default.query(query, [id]);
        return result.rows[0] || null;
    }
    static async delete(id) {
        const query = `DELETE FROM assignment_attachments WHERE id = $1 RETURNING *;`;
        const result = await database_1.default.query(query, [id]);
        return result.rows[0];
    }
    static async count(assignmentId) {
        const query = `SELECT COUNT(*) as count FROM assignment_attachments WHERE assignment_id = $1;`;
        const result = await database_1.default.query(query, [assignmentId]);
        return parseInt(result.rows[0].count);
    }
}
exports.default = AssignmentAttachmentModel;
