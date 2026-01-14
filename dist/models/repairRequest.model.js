"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepairRequestModel = void 0;
const database_1 = __importDefault(require("../config/database"));
// ============================================================================
// MODEL CLASS
// ============================================================================
class RepairRequestModel {
    /**
     * Creates a new repair request
     */
    async create(data) {
        var _a;
        // Get initial status
        const statusQuery = `
            SELECT id FROM repair_request_statuses 
            WHERE is_active = true 
            ORDER BY display_order 
            LIMIT 1;
        `;
        const statusResult = await database_1.default.query(statusQuery);
        const initialStatusId = (_a = statusResult.rows[0]) === null || _a === void 0 ? void 0 : _a.id;
        if (!initialStatusId) {
            throw new Error('No active repair request status found. Please configure statuses first.');
        }
        const query = `
            INSERT INTO repair_requests (
                asset_id, request_type_id, priority_id, status_id,
                title, description, requested_by, branch_id, department_id
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *;
        `;
        const values = [
            data.asset_id || null,
            data.request_type_id,
            data.priority_id,
            initialStatusId,
            data.title,
            data.description,
            data.requested_by,
            data.branch_id || null,
            data.department_id || null
        ];
        const result = await database_1.default.query(query, values);
        return result.rows[0];
    }
    /**
     * Find all repair requests with pagination and filters
     */
    async findAll(filters = {}, page = 1, limit = 20) {
        const offset = (page - 1) * limit;
        const conditions = [];
        const values = [];
        let paramIndex = 1;
        // Build dynamic WHERE conditions
        if (filters.status_id) {
            conditions.push(`rr.status_id = $${paramIndex++}`);
            values.push(filters.status_id);
        }
        if (filters.priority_id) {
            conditions.push(`rr.priority_id = $${paramIndex++}`);
            values.push(filters.priority_id);
        }
        if (filters.request_type_id) {
            conditions.push(`rr.request_type_id = $${paramIndex++}`);
            values.push(filters.request_type_id);
        }
        if (filters.branch_id) {
            conditions.push(`rr.branch_id = $${paramIndex++}`);
            values.push(filters.branch_id);
        }
        if (filters.department_id) {
            conditions.push(`rr.department_id = $${paramIndex++}`);
            values.push(filters.department_id);
        }
        if (filters.requested_by) {
            conditions.push(`rr.requested_by = $${paramIndex++}`);
            values.push(filters.requested_by);
        }
        if (filters.asset_id) {
            conditions.push(`rr.asset_id = $${paramIndex++}`);
            values.push(filters.asset_id);
        }
        if (filters.search) {
            conditions.push(`(
                rr.request_number ILIKE $${paramIndex} OR 
                rr.title ILIKE $${paramIndex} OR 
                rr.description ILIKE $${paramIndex} OR
                a.asset_tag ILIKE $${paramIndex}
            )`);
            values.push(`%${filters.search}%`);
            paramIndex++;
        }
        if (filters.date_from) {
            conditions.push(`rr.created_at >= $${paramIndex++}`);
            values.push(filters.date_from);
        }
        if (filters.date_to) {
            conditions.push(`rr.created_at <= $${paramIndex++}`);
            values.push(filters.date_to);
        }
        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
        // Count query
        const countQuery = `
            SELECT COUNT(*) 
            FROM repair_requests rr
            LEFT JOIN assets a ON rr.asset_id = a.id
            ${whereClause};
        `;
        const countResult = await database_1.default.query(countQuery, values);
        const total = parseInt(countResult.rows[0].count);
        // Main query with joins
        const query = `
            SELECT 
                rr.*,
                a.asset_tag,
                a.model AS asset_model,
                a.manufacturer AS asset_manufacturer,
                rt.name AS request_type_name,
                rp.name AS priority_name,
                rp.color_code AS priority_color,
                rs.name AS status_name,
                rs.color_code AS status_color,
                CONCAT(u.first_name, ' ', u.last_name) AS requester_name,
                u.email AS requester_email,
                b.name AS branch_name,
                d.name AS department_name,
                CONCAT(ict.first_name, ' ', ict.last_name) AS ict_reviewer_name,
                CONCAT(fin.first_name, ' ', fin.last_name) AS finance_reviewer_name
            FROM repair_requests rr
            LEFT JOIN assets a ON rr.asset_id = a.id
            LEFT JOIN repair_request_types rt ON rr.request_type_id = rt.id
            LEFT JOIN repair_request_priorities rp ON rr.priority_id = rp.id
            LEFT JOIN repair_request_statuses rs ON rr.status_id = rs.id
            LEFT JOIN users u ON rr.requested_by = u.id
            LEFT JOIN branches b ON rr.branch_id = b.id
            LEFT JOIN departments d ON rr.department_id = d.id
            LEFT JOIN users ict ON rr.ict_reviewed_by = ict.id
            LEFT JOIN users fin ON rr.finance_reviewed_by = fin.id
            ${whereClause}
            ORDER BY rr.created_at DESC
            LIMIT $${paramIndex++} OFFSET $${paramIndex};
        `;
        values.push(limit, offset);
        const result = await database_1.default.query(query, values);
        return { requests: result.rows, total };
    }
    /**
     * Find repair request by ID
     */
    async findById(id) {
        const query = `
            SELECT 
                rr.*,
                a.asset_tag,
                a.model AS asset_model,
                a.manufacturer AS asset_manufacturer,
                a.serial_number AS asset_serial,
                rt.name AS request_type_name,
                rp.name AS priority_name,
                rp.color_code AS priority_color,
                rs.name AS status_name,
                rs.color_code AS status_color,
                rs.is_terminal AS status_is_terminal,
                CONCAT(u.first_name, ' ', u.last_name) AS requester_name,
                u.email AS requester_email,
                b.name AS branch_name,
                d.name AS department_name,
                CONCAT(ict.first_name, ' ', ict.last_name) AS ict_reviewer_name,
                CONCAT(fin.first_name, ' ', fin.last_name) AS finance_reviewer_name
            FROM repair_requests rr
            LEFT JOIN assets a ON rr.asset_id = a.id
            LEFT JOIN repair_request_types rt ON rr.request_type_id = rt.id
            LEFT JOIN repair_request_priorities rp ON rr.priority_id = rp.id
            LEFT JOIN repair_request_statuses rs ON rr.status_id = rs.id
            LEFT JOIN users u ON rr.requested_by = u.id
            LEFT JOIN branches b ON rr.branch_id = b.id
            LEFT JOIN departments d ON rr.department_id = d.id
            LEFT JOIN users ict ON rr.ict_reviewed_by = ict.id
            LEFT JOIN users fin ON rr.finance_reviewed_by = fin.id
            WHERE rr.id = $1;
        `;
        const result = await database_1.default.query(query, [id]);
        return result.rows[0] || null;
    }
    /**
     * Find repair request by request number
     */
    async findByRequestNumber(requestNumber) {
        const query = `
            SELECT 
                rr.*,
                a.asset_tag,
                rt.name AS request_type_name,
                rp.name AS priority_name,
                rp.color_code AS priority_color,
                rs.name AS status_name,
                rs.color_code AS status_color,
                CONCAT(u.first_name, ' ', u.last_name) AS requester_name,
                b.name AS branch_name,
                d.name AS department_name
            FROM repair_requests rr
            LEFT JOIN assets a ON rr.asset_id = a.id
            LEFT JOIN repair_request_types rt ON rr.request_type_id = rt.id
            LEFT JOIN repair_request_priorities rp ON rr.priority_id = rp.id
            LEFT JOIN repair_request_statuses rs ON rr.status_id = rs.id
            LEFT JOIN users u ON rr.requested_by = u.id
            LEFT JOIN branches b ON rr.branch_id = b.id
            LEFT JOIN departments d ON rr.department_id = d.id
            WHERE rr.request_number = $1;
        `;
        const result = await database_1.default.query(query, [requestNumber]);
        return result.rows[0] || null;
    }
    /**
     * Update repair request
     */
    async update(id, data) {
        const allowedFields = [
            'asset_id', 'request_type_id', 'priority_id', 'status_id',
            'title', 'description', 'branch_id', 'department_id',
            'ict_reviewed_by', 'ict_reviewed_at', 'ict_notes',
            'repair_started_at', 'repair_completed_at', 'repair_notes',
            'vendor_name', 'invoice_number', 'invoice_amount', 'invoice_date',
            'invoice_notes', 'invoice_uploaded_by', 'invoice_uploaded_at',
            'finance_reviewed_by', 'finance_reviewed_at', 'finance_notes',
            'payment_reference', 'payment_date', 'completed_at', 'expense_id'
        ];
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
        updates.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(id);
        const query = `
            UPDATE repair_requests
            SET ${updates.join(', ')}
            WHERE id = $${paramIndex}
            RETURNING *;
        `;
        const result = await database_1.default.query(query, values);
        if (result.rows.length === 0) {
            throw new Error('Repair request not found');
        }
        return result.rows[0];
    }
    /**
     * Update status with automatic timestamp updates
     */
    async updateStatus(id, newStatusId, reviewedBy, notes) {
        var _a;
        // Get status name to determine additional field updates
        const statusQuery = `SELECT name FROM repair_request_statuses WHERE id = $1;`;
        const statusResult = await database_1.default.query(statusQuery, [newStatusId]);
        const statusName = (_a = statusResult.rows[0]) === null || _a === void 0 ? void 0 : _a.name;
        let additionalUpdates = '';
        const baseValues = [newStatusId];
        let paramIndex = 2;
        // Set appropriate timestamps based on status
        switch (statusName) {
            case 'ICT Approved':
            case 'ICT Rejected':
                additionalUpdates = `, ict_reviewed_by = $${paramIndex++}, ict_reviewed_at = CURRENT_TIMESTAMP, ict_notes = $${paramIndex++}`;
                baseValues.push(reviewedBy, notes || null);
                break;
            case 'In Repair':
                additionalUpdates = `, repair_started_at = CURRENT_TIMESTAMP`;
                break;
            case 'Finance Approved':
            case 'Finance Rejected':
                additionalUpdates = `, finance_reviewed_by = $${paramIndex++}, finance_reviewed_at = CURRENT_TIMESTAMP, finance_notes = $${paramIndex++}`;
                baseValues.push(reviewedBy, notes || null);
                break;
            case 'Completed':
                additionalUpdates = `, completed_at = CURRENT_TIMESTAMP, repair_completed_at = CURRENT_TIMESTAMP`;
                break;
        }
        const query = `
            UPDATE repair_requests
            SET status_id = $1${additionalUpdates}, updated_at = CURRENT_TIMESTAMP
            WHERE id = $${paramIndex}
            RETURNING *;
        `;
        baseValues.push(id);
        const result = await database_1.default.query(query, baseValues);
        if (result.rows.length === 0) {
            throw new Error('Repair request not found');
        }
        return result.rows[0];
    }
    /**
     * Delete repair request
     */
    async delete(id) {
        const query = `DELETE FROM repair_requests WHERE id = $1;`;
        const result = await database_1.default.query(query, [id]);
        if (result.rowCount === 0) {
            throw new Error('Repair request not found');
        }
    }
    /**
     * Get dashboard statistics
     */
    async getStatistics(userId, branchId) {
        let whereClause = '';
        const values = [];
        let paramIndex = 1;
        if (userId) {
            whereClause = `WHERE rr.requested_by = $${paramIndex++}`;
            values.push(userId);
        }
        if (branchId) {
            whereClause = whereClause ?
                `${whereClause} AND rr.branch_id = $${paramIndex++}` :
                `WHERE rr.branch_id = $${paramIndex++}`;
            values.push(branchId);
        }
        const query = `
            SELECT 
                COUNT(*) AS total_requests,
                COUNT(*) FILTER (WHERE rs.name = 'Pending') AS pending_count,
                COUNT(*) FILTER (WHERE rs.name IN ('ICT Approved', 'In Repair', 'Awaiting Invoice', 'Invoice Submitted', 'Finance Approved')) AS in_progress_count,
                COUNT(*) FILTER (WHERE rs.name = 'Completed') AS completed_count,
                COUNT(*) FILTER (WHERE rs.name IN ('ICT Rejected', 'Finance Rejected', 'Cancelled')) AS rejected_count,
                COALESCE(SUM(rr.invoice_amount) FILTER (WHERE rs.name = 'Completed'), 0) AS total_completed_amount,
                COALESCE(SUM(rr.invoice_amount) FILTER (WHERE rs.name IN ('Invoice Submitted', 'Finance Approved')), 0) AS pending_payment_amount
            FROM repair_requests rr
            JOIN repair_request_statuses rs ON rr.status_id = rs.id
            ${whereClause};
        `;
        const result = await database_1.default.query(query, values);
        return result.rows[0];
    }
    /**
     * Get requests by status for a user
     */
    async getByStatusForUser(statusName, userId) {
        const query = `
            SELECT 
                rr.*,
                a.asset_tag,
                rt.name AS request_type_name,
                rp.name AS priority_name,
                rp.color_code AS priority_color,
                rs.name AS status_name,
                rs.color_code AS status_color
            FROM repair_requests rr
            LEFT JOIN assets a ON rr.asset_id = a.id
            LEFT JOIN repair_request_types rt ON rr.request_type_id = rt.id
            LEFT JOIN repair_request_priorities rp ON rr.priority_id = rp.id
            LEFT JOIN repair_request_statuses rs ON rr.status_id = rs.id
            WHERE rs.name = $1 AND rr.requested_by = $2
            ORDER BY rr.created_at DESC;
        `;
        const result = await database_1.default.query(query, [statusName, userId]);
        return result.rows;
    }
    /**
     * Add history entry
     */
    async addHistory(requestId, actionType, performedBy, fromStatusId, toStatusId, notes, metadata) {
        const query = `
            INSERT INTO repair_request_history 
            (repair_request_id, action_type, from_status_id, to_status_id, performed_by, notes, metadata)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `;
        const values = [requestId, actionType, fromStatusId, toStatusId, performedBy, notes, metadata ? JSON.stringify(metadata) : null];
        const result = await database_1.default.query(query, values);
        return result.rows[0];
    }
    /**
     * Get history for a repair request
     */
    async getHistory(requestId) {
        const query = `
            SELECT 
                rrh.*,
                CONCAT(u.first_name, ' ', u.last_name) AS performer_name,
                fs.name AS from_status_name,
                ts.name AS to_status_name,
                fs.color_code AS from_status_color,
                ts.color_code AS to_status_color
            FROM repair_request_history rrh
            LEFT JOIN users u ON rrh.performed_by = u.id
            LEFT JOIN repair_request_statuses fs ON rrh.from_status_id = fs.id
            LEFT JOIN repair_request_statuses ts ON rrh.to_status_id = ts.id
            WHERE rrh.repair_request_id = $1
            ORDER BY rrh.created_at DESC;
        `;
        const result = await database_1.default.query(query, [requestId]);
        return result.rows;
    }
}
exports.RepairRequestModel = RepairRequestModel;
exports.default = new RepairRequestModel();
