import db from '../config/database';

// ============================================================================
// INTERFACES
// ============================================================================

export interface IRepairRequestPriority {
    id: number;
    name: string;
    description?: string;
    color_code: string;
    display_order: number;
    is_active: boolean;
    created_at?: Date;
    updated_at?: Date;
}

export interface ICreateRepairRequestPriority {
    name: string;
    description?: string;
    color_code?: string;
    display_order?: number;
    is_active?: boolean;
}

// ============================================================================
// MODEL CLASS
// ============================================================================

export class RepairRequestPriorityModel {
    /**
     * Creates a new repair request priority
     */
    async create(data: ICreateRepairRequestPriority): Promise<IRepairRequestPriority> {
        const query = `
            INSERT INTO repair_request_priorities (name, description, color_code, display_order, is_active)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `;
        const values = [
            data.name,
            data.description || null,
            data.color_code || '#6c757d',
            data.display_order || 0,
            data.is_active !== undefined ? data.is_active : true
        ];

        try {
            const result = await db.query(query, values);
            return result.rows[0];
        } catch (error: any) {
            if (error.code === '23505') {
                throw new Error(`Duplicate repair request priority: ${data.name}`);
            }
            throw error;
        }
    }

    /**
     * Retrieves all repair request priorities
     */
    async findAll(includeInactive: boolean = false): Promise<IRepairRequestPriority[]> {
        let query = `SELECT * FROM repair_request_priorities`;
        if (!includeInactive) {
            query += ` WHERE is_active = true`;
        }
        query += ` ORDER BY display_order, name;`;
        
        const result = await db.query(query);
        return result.rows;
    }

    /**
     * Finds a repair request priority by ID
     */
    async findById(id: number): Promise<IRepairRequestPriority | null> {
        const query = `SELECT * FROM repair_request_priorities WHERE id = $1;`;
        const result = await db.query(query, [id]);
        return result.rows[0] || null;
    }

    /**
     * Updates a repair request priority
     */
    async update(id: number, data: Partial<ICreateRepairRequestPriority>): Promise<IRepairRequestPriority> {
        const query = `
            UPDATE repair_request_priorities
            SET name = COALESCE($1, name),
                description = COALESCE($2, description),
                color_code = COALESCE($3, color_code),
                display_order = COALESCE($4, display_order),
                is_active = COALESCE($5, is_active),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $6
            RETURNING *;
        `;
        const values = [data.name, data.description, data.color_code, data.display_order, data.is_active, id];

        try {
            const result = await db.query(query, values);
            if (result.rows.length === 0) {
                throw new Error('Repair request priority not found');
            }
            return result.rows[0];
        } catch (error: any) {
            if (error.code === '23505') {
                throw new Error(`Duplicate repair request priority: ${data.name}`);
            }
            throw error;
        }
    }

    /**
     * Deletes a repair request priority
     */
    async delete(id: number): Promise<void> {
        // First check if priority is in use
        const checkQuery = `SELECT COUNT(*) FROM repair_requests WHERE priority_id = $1;`;
        const checkResult = await db.query(checkQuery, [id]);
        
        if (parseInt(checkResult.rows[0].count) > 0) {
            throw new Error('Cannot delete repair request priority that is in use. Consider deactivating it instead.');
        }

        const query = `DELETE FROM repair_request_priorities WHERE id = $1;`;
        const result = await db.query(query, [id]);
        
        if (result.rowCount === 0) {
            throw new Error('Repair request priority not found');
        }
    }

    /**
     * Toggles active status
     */
    async toggleActive(id: number): Promise<IRepairRequestPriority> {
        const query = `
            UPDATE repair_request_priorities
            SET is_active = NOT is_active,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *;
        `;
        const result = await db.query(query, [id]);
        
        if (result.rows.length === 0) {
            throw new Error('Repair request priority not found');
        }
        return result.rows[0];
    }

    /**
     * Get default priority (Medium)
     */
    async getDefaultPriority(): Promise<IRepairRequestPriority | null> {
        const query = `
            SELECT * FROM repair_request_priorities 
            WHERE name = 'Medium' AND is_active = true;
        `;
        const result = await db.query(query);
        return result.rows[0] || null;
    }
}

export default new RepairRequestPriorityModel();
