import db from '../config/database';

interface IExpenseType {
    id: number;
    name: string;
    description?: string;
}

interface ICreateExpenseType {
    name: string;
    description?: string;
}

export class ExpenseTypeModel {

    /**
     * Stores a new expense type, handling unique constraint violation.
     */
    async create(data: ICreateExpenseType): Promise<IExpenseType> {
        const query = `
            INSERT INTO expense_types (name, description)
            VALUES ($1, $2)
            RETURNING id, name, description;
        `;
        const values = [data.name, data.description || null];

        try {
            const result = await db.query(query, values);
            return result.rows[0];
        } catch (error: any) {
            // PostgreSQL Error Code 23505 for unique_violation
            if (error.code === '23505') {
                throw new Error(`Duplicate expense type: ${data.name}`);
            }
            throw error;
        }
    }

    /**
     * Retrieves all expense types.
     */
    async findAll(): Promise<IExpenseType[]> {
        const query = `SELECT id, name, description FROM expense_types ORDER BY name;`;
        const result = await db.query(query);
        return result.rows;
    }

    /**
     * Finds a single expense type by ID.
     */
    async findById(id: number): Promise<IExpenseType | null> {
        const query = `SELECT id, name, description FROM expense_types WHERE id = $1;`;
        const result = await db.query(query, [id]);
        return result.rows[0] || null;
    }

    /**
     * Finds expense type by name (case-insensitive).
     */
    async findByName(name: string): Promise<IExpenseType | null> {
        const query = `SELECT id, name, description FROM expense_types WHERE LOWER(name) = LOWER($1);`;
        const result = await db.query(query, [name]);
        return result.rows[0] || null;
    }

    /**
     * Updates an expense type.
     */
    async update(id: number, data: Partial<ICreateExpenseType>): Promise<IExpenseType> {
        const query = `
            UPDATE expense_types
            SET name = COALESCE($1, name),
                description = COALESCE($2, description),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $3
            RETURNING id, name, description;
        `;
        const values = [data.name, data.description, id];

        try {
            const result = await db.query(query, values);
            if (result.rows.length === 0) {
                throw new Error('Expense type not found');
            }
            return result.rows[0];
        } catch (error: any) {
            if (error.code === '23505') {
                throw new Error(`Duplicate expense type: ${data.name}`);
            }
            throw error;
        }
    }

    /**
     * Deletes an expense type.
     */
    async delete(id: number): Promise<void> {
        const query = `DELETE FROM expense_types WHERE id = $1;`;
        const result = await db.query(query, [id]);
        if (result.rowCount === 0) {
            throw new Error('Expense type not found');
        }
    }
}

export default new ExpenseTypeModel();