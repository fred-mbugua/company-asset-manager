import db from '../config/database';

export class LookupModel {

    /**
     * Fetches a distinct list of all Asset Tags currently in the system.
     */
    async getAllAssetTags(): Promise<string[]> {
        const query = `
            SELECT DISTINCT asset_tag 
            FROM assets 
            ORDER BY asset_tag ASC;
        `;
        const result = await db.query(query);
        return result.rows.map(row => row.asset_tag);
    }
    
    /**
     * Fetches all defined Expense Types.
     */
    async getAllExpenseTypes(): Promise<{ id: number, name: string }[]> {
        // Assuming you have an 'expense_types' table for the expense_type_id reference
        const query = `
            SELECT id, name
            FROM expense_types
            ORDER BY name ASC;
        `;
        const result = await db.query(query);
        return result.rows;
    }

    /**
     * Fetches all defined Departments.
     */
    async getAllDepartments(): Promise<{ id: number, name: string }[]> {
        const query = `
            SELECT id, name
            FROM departments
            ORDER BY name ASC;
        `;
        const result = await db.query(query);
        return result.rows;
    }

    /**
     * Fetches all defined Branches (Locations).
     */
    async getAllBranches(): Promise<{ id: number, name: string }[]> {
        const query = `
            SELECT id, name
            FROM branches
            ORDER BY name ASC;
        `;
        const result = await db.query(query);
        return result.rows;
    }

    /**
     * Fetches all employee names.
     */
    async getAllEmployeeNames(): Promise<{ full_name: string }[]> {
        const query = `
            SELECT first_name || ' ' || last_name AS full_name
            FROM employees
            ORDER BY full_name ASC;
        `;
        const result = await db.query(query);
        return result.rows;
    }

    /**
     * Fetches all employee names.
     */
    async getAllEmployeeDetails(): Promise<{ full_name: string }[]> {
        const query = `
            SELECT *
            FROM employees
            ORDER BY first_name ASC;
        `;
        const result = await db.query(query);
        return result.rows;
    }

    async getAllUserRoles(): Promise<{ id: number, name: string }[]> {
        const query = `
            SELECT id, name
            FROM roles
            ORDER BY name ASC;
        `;
        const result = await db.query(query);
        return result.rows;
    }
}

export default new LookupModel();