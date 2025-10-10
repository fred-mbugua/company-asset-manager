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
}

export default new ExpenseTypeModel();