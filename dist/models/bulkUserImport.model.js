"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("../config/database"));
class BulkUserImportModel {
    /**
     * Create a new bulk import batch
     */
    async createBatch(importedBy, importType, totalRecords) {
        const query = `
            INSERT INTO bulk_user_imports (imported_by, import_type, total_records, status)
            VALUES ($1, $2, $3, 'processing')
            RETURNING *;
        `;
        const result = await database_1.default.query(query, [importedBy, importType, totalRecords]);
        return result.rows[0];
    }
    /**
     * Update batch status
     */
    async updateBatchStatus(batchId, status, successfulRecords, failedRecords) {
        let query = `UPDATE bulk_user_imports SET status = $1`;
        const values = [status];
        let paramIndex = 2;
        if (successfulRecords !== undefined) {
            query += `, successful_records = $${paramIndex++}`;
            values.push(successfulRecords);
        }
        if (failedRecords !== undefined) {
            query += `, failed_records = $${paramIndex++}`;
            values.push(failedRecords);
        }
        if (status === 'completed' || status === 'failed') {
            query += `, completed_at = NOW()`;
        }
        query += ` WHERE id = $${paramIndex} RETURNING *;`;
        values.push(batchId);
        const result = await database_1.default.query(query, values);
        return result.rows[0];
    }
    /**
     * Add an imported user record
     */
    async addImportedUser(data) {
        const query = `
            INSERT INTO bulk_imported_users 
            (bulk_import_id, user_id, employee_id, email, first_name, last_name, 
             auto_generated_password, import_status, error_message)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *;
        `;
        const values = [
            data.bulk_import_id,
            data.user_id || null,
            data.employee_id || null,
            data.email,
            data.first_name,
            data.last_name,
            data.auto_generated_password,
            data.import_status,
            data.error_message || null
        ];
        const result = await database_1.default.query(query, values);
        return result.rows[0];
    }
    /**
     * Get all import batches with pagination
     */
    async getAllBatches(limit = 20, offset = 0) {
        const countQuery = `SELECT COUNT(*) FROM bulk_user_imports;`;
        const countResult = await database_1.default.query(countQuery);
        const totalCount = parseInt(countResult.rows[0].count);
        const query = `
            SELECT 
                bui.*,
                u.email AS imported_by_email,
                u.first_name || ' ' || u.last_name AS imported_by_name
            FROM bulk_user_imports bui
            LEFT JOIN users u ON bui.imported_by = u.id
            ORDER BY bui.created_at DESC
            LIMIT $1 OFFSET $2;
        `;
        const result = await database_1.default.query(query, [limit, offset]);
        return { batches: result.rows, totalCount };
    }
    /**
     * Get a specific batch by ID
     */
    async getBatchById(batchId) {
        const query = `
            SELECT 
                bui.*,
                u.email AS imported_by_email,
                u.first_name || ' ' || u.last_name AS imported_by_name
            FROM bulk_user_imports bui
            LEFT JOIN users u ON bui.imported_by = u.id
            WHERE bui.id = $1;
        `;
        const result = await database_1.default.query(query, [batchId]);
        return result.rows[0] || null;
    }
    /**
     * Get imported users for a specific batch
     */
    async getImportedUsersByBatchId(batchId) {
        const query = `
            SELECT 
                biu.*,
                CASE 
                    WHEN biu.password_changed = TRUE THEN NULL 
                    ELSE biu.auto_generated_password 
                END AS visible_password
            FROM bulk_imported_users biu
            WHERE biu.bulk_import_id = $1
            ORDER BY biu.id ASC;
        `;
        const result = await database_1.default.query(query, [batchId]);
        return result.rows;
    }
    /**
     * Mark user's password as changed
     */
    async markPasswordChanged(userId) {
        // Update in bulk_imported_users
        const query1 = `
            UPDATE bulk_imported_users 
            SET password_changed = TRUE, password_changed_at = NOW()
            WHERE user_id = $1;
        `;
        await database_1.default.query(query1, [userId]);
        // Update in users table
        const query2 = `
            UPDATE users 
            SET is_password_changed = TRUE, password_changed_at = NOW()
            WHERE id = $1;
        `;
        await database_1.default.query(query2, [userId]);
    }
    /**
     * Mark password as sent
     */
    async markPasswordSent(importedUserId) {
        const query = `
            UPDATE bulk_imported_users 
            SET password_sent = TRUE, password_sent_at = NOW()
            WHERE id = $1;
        `;
        await database_1.default.query(query, [importedUserId]);
    }
    /**
     * Check if a user was bulk imported
     */
    async isBulkImported(userId) {
        var _a;
        const query = `SELECT is_bulk_imported FROM users WHERE id = $1;`;
        const result = await database_1.default.query(query, [userId]);
        return ((_a = result.rows[0]) === null || _a === void 0 ? void 0 : _a.is_bulk_imported) || false;
    }
    /**
     * Get all pending passwords (not sent) for a batch
     */
    async getPendingPasswordsForBatch(batchId) {
        const query = `
            SELECT * FROM bulk_imported_users
            WHERE bulk_import_id = $1 
            AND import_status = 'success'
            AND password_sent = FALSE
            AND password_changed = FALSE;
        `;
        const result = await database_1.default.query(query, [batchId]);
        return result.rows;
    }
    /**
     * Get bulk import info for a specific user by user_id
     */
    async getBulkImportInfoByUserId(userId) {
        const query = `
            SELECT 
                biu.*,
                CASE 
                    WHEN biu.password_changed = TRUE THEN NULL 
                    ELSE biu.auto_generated_password 
                END AS visible_password
            FROM bulk_imported_users biu
            WHERE biu.user_id = $1
            ORDER BY biu.created_at DESC
            LIMIT 1;
        `;
        const result = await database_1.default.query(query, [userId]);
        return result.rows[0] || null;
    }
    /**
     * Get imported users by batch ID with pagination and search
     */
    async getImportedUsersByBatchIdPaginated(batchId, options) {
        const { limit = 10, offset = 0, search = '' } = options;
        let whereClause = 'WHERE biu.bulk_import_id = $1';
        const values = [batchId];
        let paramIndex = 2;
        if (search) {
            whereClause += ` AND (
                biu.first_name ILIKE $${paramIndex} OR 
                biu.last_name ILIKE $${paramIndex} OR 
                biu.email ILIKE $${paramIndex} OR
                CONCAT(biu.first_name, ' ', biu.last_name) ILIKE $${paramIndex}
            )`;
            values.push(`%${search}%`);
            paramIndex++;
        }
        // Count query
        const countQuery = `
            SELECT COUNT(*) as total
            FROM bulk_imported_users biu
            ${whereClause};
        `;
        const countResult = await database_1.default.query(countQuery, values);
        const totalCount = parseInt(countResult.rows[0].total, 10);
        // Data query
        const dataQuery = `
            SELECT 
                biu.*,
                CASE 
                    WHEN biu.password_changed = TRUE THEN NULL 
                    ELSE biu.auto_generated_password 
                END AS visible_password
            FROM bulk_imported_users biu
            ${whereClause}
            ORDER BY biu.id ASC
            LIMIT $${paramIndex} OFFSET $${paramIndex + 1};
        `;
        values.push(limit, offset);
        const result = await database_1.default.query(dataQuery, values);
        return { users: result.rows, totalCount };
    }
}
exports.default = new BulkUserImportModel();
