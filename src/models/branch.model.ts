import db from '../config/database';

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

    static async findAll() {
        const query = `SELECT * FROM branches;`;
        const result = await db.query(query);
        return result.rows;
    }
}

export default BranchModel;