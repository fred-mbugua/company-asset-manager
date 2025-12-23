import db from '../config/database';

interface ExpenseAttachment {
    id: number;
    expense_id: number;
    file_name: string;
    file_path: string;
    file_size: number;
    file_type: string;
    storage_type: 'server' | 'firebase';
    notes: string | null;
    uploaded_by: number;
    uploaded_at: Date;
}

interface ExpenseAttachmentWithUser extends ExpenseAttachment {
    uploader_name: string;
    uploader_email: string;
}

class ExpenseAttachmentModel {
    static async create(attachmentData: {
        expense_id: number;
        file_name: string;
        file_path: string;
        file_size: number;
        file_type: string;
        storage_type: 'server' | 'firebase';
        notes?: string;
        uploaded_by: number;
    }): Promise<ExpenseAttachment> {
        const query = `
            INSERT INTO expense_attachments 
            (expense_id, file_name, file_path, file_size, file_type, storage_type, notes, uploaded_by)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *;
        `;
        const values = [
            attachmentData.expense_id,
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

    static async findByExpenseId(expenseId: number): Promise<ExpenseAttachmentWithUser[]> {
        const query = `
            SELECT 
                ea.*,
                CONCAT(u.first_name, ' ', u.last_name) as uploader_name,
                u.email as uploader_email
            FROM expense_attachments ea
            LEFT JOIN users u ON ea.uploaded_by = u.id
            WHERE ea.expense_id = $1
            ORDER BY ea.uploaded_at DESC;
        `;
        const result = await db.query(query, [expenseId]);
        return result.rows;
    }

    static async findById(id: number): Promise<ExpenseAttachment | null> {
        const query = `SELECT * FROM expense_attachments WHERE id = $1;`;
        const result = await db.query(query, [id]);
        return result.rows[0] || null;
    }

    static async delete(id: number): Promise<ExpenseAttachment> {
        const query = `DELETE FROM expense_attachments WHERE id = $1 RETURNING *;`;
        const result = await db.query(query, [id]);
        return result.rows[0];
    }

    static async count(expenseId: number): Promise<number> {
        const query = `SELECT COUNT(*) as count FROM expense_attachments WHERE expense_id = $1;`;
        const result = await db.query(query, [expenseId]);
        return parseInt(result.rows[0].count);
    }
}

export default ExpenseAttachmentModel;
