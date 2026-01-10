import db from '../config/database';

interface IBranch {
    id?: number;
    name: string;
    location: string;
}

class BranchModel {
    static async create(branchData: any) {
        const query = `
            INSERT INTO branches (name, location)
            VALUES ($1, $2)
            RETURNING *;
        `;
        const result = await db.query(query, [branchData.name, branchData.location]);
        return result.rows[0];
    }

    static async findById(id: number) {
        const query = `SELECT * FROM branches WHERE id = $1;`;
        const result = await db.query(query, [id]);
        return result.rows[0];
    }

    static async findByName(name: string) {
        const query = `SELECT * FROM branches WHERE LOWER(name) = LOWER($1) OR LOWER(location) = LOWER($1);`;
        const result = await db.query(query, [name.trim()]);
        return result.rows[0];
    }

    static async findAll() {
        const query = `SELECT * FROM branches ORDER BY created_at;`;
        const result = await db.query(query);
        return result.rows;
    }

    /**
     * Updating an existing branch.
     */
    static async update(id: number, branchData: Partial<IBranch>): Promise<IBranch | null> {
        const setClauses: string[] = [];
        const values: any[] = [];
        let index = 1;

        // Dynamically building SET clause
        for (const key in branchData) {
            if (Object.prototype.hasOwnProperty.call(branchData, key) && key !== 'id') {
                setClauses.push(`${key} = $${index++}`);
                values.push((branchData as any)[key]);
            }
        }

        if (setClauses.length === 0) {
            // Nothing to update
            return this.findById(id); 
        }

        values.push(id); // ID is the last parameter
        const query = `
            UPDATE branches
            SET ${setClauses.join(', ')}
            WHERE id = $${index}
            RETURNING id, name, location, created_at, updated_at;
        `;

        const result = await db.query(query, values);
        return result.rows[0] || null;
    }

    /**
     * Deleting a branch.
     */
    static async delete(id: number): Promise<boolean> {
        const query = `DELETE FROM branches WHERE id = $1;`;
        const result = await db.query(query, [id]);
        return (result.rowCount ?? 0) > 0;
    }
}

export default BranchModel;
export { IBranch };