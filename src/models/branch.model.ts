import db from '../config/database';

export interface IBranch {
    id?: number;
    name: string;
    location: string;
    parent_id?: number | null;
    hierarchy_level?: number;
    is_headquarters?: boolean;
    created_at?: Date;
    updated_at?: Date;
}

export interface IBranchWithChildren extends IBranch {
    children?: IBranchWithChildren[];
}

class BranchModel {
    static async create(branchData: any) {
        const query = `
            INSERT INTO branches (name, location, parent_id, is_headquarters)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        const result = await db.query(query, [
            branchData.name, 
            branchData.location,
            branchData.parent_id || null,
            branchData.is_headquarters || false
        ]);
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
        const query = `SELECT * FROM branches ORDER BY hierarchy_level, name;`;
        const result = await db.query(query);
        return result.rows;
    }

    /**
     * Get all branches with their hierarchy info
     */
    static async findAllWithHierarchy(): Promise<IBranch[]> {
        const query = `
            SELECT 
                b.*,
                p.name as parent_name,
                (SELECT COUNT(*) FROM branches WHERE parent_id = b.id) as children_count
            FROM branches b
            LEFT JOIN branches p ON b.parent_id = p.id
            ORDER BY b.hierarchy_level, b.name;
        `;
        const result = await db.query(query);
        return result.rows;
    }

    /**
     * Get headquarters branch
     */
    static async findHeadquarters(): Promise<IBranch | null> {
        const query = `SELECT * FROM branches WHERE is_headquarters = TRUE LIMIT 1;`;
        const result = await db.query(query);
        return result.rows[0] || null;
    }

    /**
     * Get direct children of a branch
     */
    static async getChildren(parentId: number): Promise<IBranch[]> {
        const query = `SELECT * FROM branches WHERE parent_id = $1 ORDER BY name;`;
        const result = await db.query(query, [parentId]);
        return result.rows;
    }

    /**
     * Get all descendant branch IDs (including the branch itself)
     */
    static async getDescendantIds(branchId: number): Promise<number[]> {
        const query = `SELECT id FROM get_descendant_branch_ids($1);`;
        const result = await db.query(query, [branchId]);
        return result.rows.map(row => row.id);
    }

    /**
     * Get all ancestor branch IDs (including the branch itself)
     */
    static async getAncestorIds(branchId: number): Promise<number[]> {
        const query = `SELECT id FROM get_ancestor_branch_ids($1);`;
        const result = await db.query(query, [branchId]);
        return result.rows.map(row => row.id);
    }

    /**
     * Check if a user's branch can access another branch's data
     */
    static async canAccessBranch(userBranchId: number, targetBranchId: number): Promise<boolean> {
        const query = `SELECT can_access_branch($1, $2) as can_access;`;
        const result = await db.query(query, [userBranchId, targetBranchId]);
        return result.rows[0]?.can_access || false;
    }

    /**
     * Get all branch IDs that a user can access based on their branch
     */
    static async getAccessibleBranchIds(userBranchId: number): Promise<number[]> {
        // First check if user is in headquarters
        const hqCheck = await db.query(
            `SELECT is_headquarters FROM branches WHERE id = $1`, 
            [userBranchId]
        );
        
        if (hqCheck.rows[0]?.is_headquarters) {
            // HQ can access all branches
            const allBranches = await db.query(`SELECT id FROM branches`);
            return allBranches.rows.map(row => row.id);
        }
        
        // Otherwise, get descendant branches (including self)
        return this.getDescendantIds(userBranchId);
    }

    /**
     * Build a tree structure of branches
     */
    static async getHierarchyTree(): Promise<IBranchWithChildren[]> {
        const allBranches = await this.findAll();
        const branchMap = new Map<number, IBranchWithChildren>();
        const roots: IBranchWithChildren[] = [];

        // First pass: create all nodes
        allBranches.forEach(branch => {
            branchMap.set(branch.id, { ...branch, children: [] });
        });

        // Second pass: build tree
        allBranches.forEach(branch => {
            const node = branchMap.get(branch.id)!;
            if (branch.parent_id && branchMap.has(branch.parent_id)) {
                branchMap.get(branch.parent_id)!.children!.push(node);
            } else {
                roots.push(node);
            }
        });

        return roots;
    }

    /**
     * Set a branch as headquarters
     */
    static async setHeadquarters(branchId: number): Promise<IBranch> {
        // First, unset any existing headquarters
        await db.query(`UPDATE branches SET is_headquarters = FALSE WHERE is_headquarters = TRUE`);
        
        // Set the new headquarters
        const query = `
            UPDATE branches 
            SET is_headquarters = TRUE, parent_id = NULL, hierarchy_level = 0 
            WHERE id = $1 
            RETURNING *;
        `;
        const result = await db.query(query, [branchId]);
        return result.rows[0];
    }

    /**
     * Update parent of a branch
     */
    static async setParent(branchId: number, parentId: number | null): Promise<IBranch> {
        // Prevent setting a branch as its own parent
        if (branchId === parentId) {
            throw new Error('A branch cannot be its own parent');
        }

        // Prevent circular references
        if (parentId) {
            const descendants = await this.getDescendantIds(branchId);
            if (descendants.includes(parentId)) {
                throw new Error('Cannot set a descendant as parent (circular reference)');
            }
        }

        const query = `
            UPDATE branches 
            SET parent_id = $2 
            WHERE id = $1 
            RETURNING *;
        `;
        const result = await db.query(query, [branchId, parentId]);
        return result.rows[0];
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
            RETURNING *;
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