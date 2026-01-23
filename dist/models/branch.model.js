"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("../config/database"));
class BranchModel {
    static async create(branchData) {
        const query = `
            INSERT INTO branches (name, location, parent_id, is_headquarters, company_id)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `;
        const result = await database_1.default.query(query, [
            branchData.name,
            branchData.location,
            branchData.parent_id || null,
            branchData.is_headquarters || false,
            branchData.company_id || null
        ]);
        return result.rows[0];
    }
    static async findById(id) {
        const query = `SELECT * FROM branches WHERE id = $1;`;
        const result = await database_1.default.query(query, [id]);
        return result.rows[0];
    }
    static async findByName(name) {
        const query = `SELECT * FROM branches WHERE LOWER(name) = LOWER($1) OR LOWER(location) = LOWER($1);`;
        const result = await database_1.default.query(query, [name.trim()]);
        return result.rows[0];
    }
    static async findAll() {
        const query = `SELECT * FROM branches ORDER BY hierarchy_level, name;`;
        const result = await database_1.default.query(query);
        return result.rows;
    }
    /**
     * Get all branches with their hierarchy info
     */
    static async findAllWithHierarchy() {
        const query = `
            SELECT 
                b.*,
                p.name as parent_name,
                (SELECT COUNT(*) FROM branches WHERE parent_id = b.id) as children_count
            FROM branches b
            LEFT JOIN branches p ON b.parent_id = p.id
            ORDER BY b.hierarchy_level, b.name;
        `;
        const result = await database_1.default.query(query);
        return result.rows;
    }
    /**
     * Get headquarters branch
     */
    static async findHeadquarters() {
        const query = `SELECT * FROM branches WHERE is_headquarters = TRUE LIMIT 1;`;
        const result = await database_1.default.query(query);
        return result.rows[0] || null;
    }
    /**
     * Get direct children of a branch
     */
    static async getChildren(parentId) {
        const query = `SELECT * FROM branches WHERE parent_id = $1 ORDER BY name;`;
        const result = await database_1.default.query(query, [parentId]);
        return result.rows;
    }
    /**
     * Get all descendant branch IDs (including the branch itself)
     */
    static async getDescendantIds(branchId) {
        const query = `SELECT id FROM get_descendant_branch_ids($1);`;
        const result = await database_1.default.query(query, [branchId]);
        return result.rows.map(row => row.id);
    }
    /**
     * Get all ancestor branch IDs (including the branch itself)
     */
    static async getAncestorIds(branchId) {
        const query = `SELECT id FROM get_ancestor_branch_ids($1);`;
        const result = await database_1.default.query(query, [branchId]);
        return result.rows.map(row => row.id);
    }
    /**
     * Check if a user's branch can access another branch's data
     */
    static async canAccessBranch(userBranchId, targetBranchId) {
        var _a;
        const query = `SELECT can_access_branch($1, $2) as can_access;`;
        const result = await database_1.default.query(query, [userBranchId, targetBranchId]);
        return ((_a = result.rows[0]) === null || _a === void 0 ? void 0 : _a.can_access) || false;
    }
    /**
     * Get all branch IDs that a user can access based on their branch
     */
    static async getAccessibleBranchIds(userBranchId) {
        var _a;
        // First check if user is in headquarters
        const hqCheck = await database_1.default.query(`SELECT is_headquarters FROM branches WHERE id = $1`, [userBranchId]);
        if ((_a = hqCheck.rows[0]) === null || _a === void 0 ? void 0 : _a.is_headquarters) {
            // HQ can access all branches
            const allBranches = await database_1.default.query(`SELECT id FROM branches`);
            return allBranches.rows.map(row => row.id);
        }
        // Otherwise, get descendant branches (including self)
        return this.getDescendantIds(userBranchId);
    }
    /**
     * Build a tree structure of branches
     */
    static async getHierarchyTree() {
        const allBranches = await this.findAll();
        const branchMap = new Map();
        const roots = [];
        // First pass: create all nodes
        allBranches.forEach(branch => {
            branchMap.set(branch.id, { ...branch, children: [] });
        });
        // Second pass: build tree
        allBranches.forEach(branch => {
            const node = branchMap.get(branch.id);
            if (branch.parent_id && branchMap.has(branch.parent_id)) {
                branchMap.get(branch.parent_id).children.push(node);
            }
            else {
                roots.push(node);
            }
        });
        return roots;
    }
    /**
     * Set a branch as headquarters
     */
    static async setHeadquarters(branchId) {
        // First, unset any existing headquarters
        await database_1.default.query(`UPDATE branches SET is_headquarters = FALSE WHERE is_headquarters = TRUE`);
        // Set the new headquarters
        const query = `
            UPDATE branches 
            SET is_headquarters = TRUE, parent_id = NULL, hierarchy_level = 0 
            WHERE id = $1 
            RETURNING *;
        `;
        const result = await database_1.default.query(query, [branchId]);
        return result.rows[0];
    }
    /**
     * Update parent of a branch
     */
    static async setParent(branchId, parentId) {
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
        const result = await database_1.default.query(query, [branchId, parentId]);
        return result.rows[0];
    }
    /**
     * Updating an existing branch.
     */
    static async update(id, branchData) {
        const setClauses = [];
        const values = [];
        let index = 1;
        // Dynamically building SET clause
        for (const key in branchData) {
            if (Object.prototype.hasOwnProperty.call(branchData, key) && key !== 'id') {
                setClauses.push(`${key} = $${index++}`);
                values.push(branchData[key]);
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
        const result = await database_1.default.query(query, values);
        return result.rows[0] || null;
    }
    /**
     * Deleting a branch.
     */
    static async delete(id) {
        var _a;
        const query = `DELETE FROM branches WHERE id = $1;`;
        const result = await database_1.default.query(query, [id]);
        return ((_a = result.rowCount) !== null && _a !== void 0 ? _a : 0) > 0;
    }
}
exports.default = BranchModel;
