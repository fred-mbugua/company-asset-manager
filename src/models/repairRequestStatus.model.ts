import db from '../config/database';

// ============================================================================
// INTERFACES
// ============================================================================

export interface IRepairRequestStatus {
    id: number;
    name: string;
    description?: string;
    color_code: string;
    display_order: number;
    is_active: boolean;
    is_terminal: boolean;
    created_at?: Date;
    updated_at?: Date;
}

export interface ICreateRepairRequestStatus {
    name: string;
    description?: string;
    color_code?: string;
    display_order?: number;
    is_active?: boolean;
    is_terminal?: boolean;
}

// ============================================================================
// MODEL CLASS
// ============================================================================

export class RepairRequestStatusModel {
    /**
     * Creates a new repair request status
     */
    async create(data: ICreateRepairRequestStatus): Promise<IRepairRequestStatus> {
        const query = `
            INSERT INTO repair_request_statuses (name, description, color_code, display_order, is_active, is_terminal)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `;
        const values = [
            data.name,
            data.description || null,
            data.color_code || '#6c757d',
            data.display_order || 0,
            data.is_active !== undefined ? data.is_active : true,
            data.is_terminal !== undefined ? data.is_terminal : false
        ];

        try {
            const result = await db.query(query, values);
            return result.rows[0];
        } catch (error: any) {
            if (error.code === '23505') {
                throw new Error(`Duplicate repair request status: ${data.name}`);
            }
            throw error;
        }
    }

    /**
     * Retrieves all repair request statuses
     */
    async findAll(includeInactive: boolean = false): Promise<IRepairRequestStatus[]> {
        let query = `SELECT * FROM repair_request_statuses`;
        if (!includeInactive) {
            query += ` WHERE is_active = true`;
        }
        query += ` ORDER BY display_order, name;`;
        
        const result = await db.query(query);
        return result.rows;
    }

    /**
     * Finds a repair request status by ID
     */
    async findById(id: number): Promise<IRepairRequestStatus | null> {
        const query = `SELECT * FROM repair_request_statuses WHERE id = $1;`;
        const result = await db.query(query, [id]);
        return result.rows[0] || null;
    }

    /**
     * Finds a repair request status by name
     */
    async findByName(name: string): Promise<IRepairRequestStatus | null> {
        const query = `SELECT * FROM repair_request_statuses WHERE name = $1;`;
        const result = await db.query(query, [name]);
        return result.rows[0] || null;
    }

    /**
     * Updates a repair request status
     */
    async update(id: number, data: Partial<ICreateRepairRequestStatus>): Promise<IRepairRequestStatus> {
        const query = `
            UPDATE repair_request_statuses
            SET name = COALESCE($1, name),
                description = COALESCE($2, description),
                color_code = COALESCE($3, color_code),
                display_order = COALESCE($4, display_order),
                is_active = COALESCE($5, is_active),
                is_terminal = COALESCE($6, is_terminal),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $7
            RETURNING *;
        `;
        const values = [
            data.name, 
            data.description, 
            data.color_code, 
            data.display_order, 
            data.is_active, 
            data.is_terminal, 
            id
        ];

        try {
            const result = await db.query(query, values);
            if (result.rows.length === 0) {
                throw new Error('Repair request status not found');
            }
            return result.rows[0];
        } catch (error: any) {
            if (error.code === '23505') {
                throw new Error(`Duplicate repair request status: ${data.name}`);
            }
            throw error;
        }
    }

    /**
     * Deletes a repair request status
     */
    async delete(id: number): Promise<void> {
        // First check if status is in use
        const checkQuery = `SELECT COUNT(*) FROM repair_requests WHERE status_id = $1;`;
        const checkResult = await db.query(checkQuery, [id]);
        
        if (parseInt(checkResult.rows[0].count) > 0) {
            throw new Error('Cannot delete repair request status that is in use. Consider deactivating it instead.');
        }

        const query = `DELETE FROM repair_request_statuses WHERE id = $1;`;
        const result = await db.query(query, [id]);
        
        if (result.rowCount === 0) {
            throw new Error('Repair request status not found');
        }
    }

    /**
     * Toggles active status
     */
    async toggleActive(id: number): Promise<IRepairRequestStatus> {
        const query = `
            UPDATE repair_request_statuses
            SET is_active = NOT is_active,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *;
        `;
        const result = await db.query(query, [id]);
        
        if (result.rows.length === 0) {
            throw new Error('Repair request status not found');
        }
        return result.rows[0];
    }

    /**
     * Get initial/default status for new requests
     */
    async getInitialStatus(): Promise<IRepairRequestStatus | null> {
        const query = `
            SELECT * FROM repair_request_statuses 
            WHERE is_active = true 
            ORDER BY display_order 
            LIMIT 1;
        `;
        const result = await db.query(query);
        return result.rows[0] || null;
    }
}

export default new RepairRequestStatusModel();
