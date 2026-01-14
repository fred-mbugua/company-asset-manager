"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LookupModel = void 0;
const database_1 = __importDefault(require("../config/database"));
class LookupModel {
    /**
     * Fetches a distinct list of all Asset Tags currently in the system.
     */
    async getAllAssetTags() {
        const query = `
            SELECT DISTINCT asset_tag 
            FROM assets 
            ORDER BY asset_tag ASC;
        `;
        const result = await database_1.default.query(query);
        return result.rows.map(row => row.asset_tag);
    }
    /**
     * Fetches all defined Expense Types.
     */
    async getAllExpenseTypes() {
        // Assuming you have an 'expense_types' table for the expense_type_id reference
        const query = `
            SELECT id, name
            FROM expense_types
            ORDER BY name ASC;
        `;
        const result = await database_1.default.query(query);
        return result.rows;
    }
    /**
     * Fetches all defined Departments.
     */
    async getAllDepartments() {
        const query = `
            SELECT id, name
            FROM departments
            ORDER BY name ASC;
        `;
        const result = await database_1.default.query(query);
        return result.rows;
    }
    /**
     * Fetches all defined Branches (Locations).
     */
    async getAllBranches() {
        const query = `
            SELECT id, name
            FROM branches
            ORDER BY name ASC;
        `;
        const result = await database_1.default.query(query);
        return result.rows;
    }
    /**
     * Fetches all employee names.
     */
    async getAllEmployeeNames() {
        const query = `
            SELECT first_name || ' ' || last_name AS full_name
            FROM employees
            ORDER BY full_name ASC;
        `;
        const result = await database_1.default.query(query);
        return result.rows;
    }
    /**
     * Fetches all employee names.
     */
    async getAllEmployeeDetails() {
        const query = `
            SELECT *
            FROM employees
            ORDER BY first_name ASC;
        `;
        const result = await database_1.default.query(query);
        return result.rows;
    }
    async getAllUserRoles() {
        const query = `
            SELECT id, name
            FROM roles
            ORDER BY name ASC;
        `;
        const result = await database_1.default.query(query);
        return result.rows;
    }
    /**
     * Fetches all users for filter dropdown.
     */
    async getAllUsers() {
        const query = `
            SELECT id, first_name || ' ' || last_name AS user_name
            FROM users
            ORDER BY first_name ASC, last_name ASC;
        `;
        const result = await database_1.default.query(query);
        return result.rows;
    }
    /**
     * Fetches all distinct action types from action_logs.
     */
    async getAllActionTypes() {
        const query = `
            SELECT DISTINCT action_type
            FROM action_logs
            ORDER BY action_type ASC;
        `;
        const result = await database_1.default.query(query);
        return result.rows.map(row => row.action_type);
    }
    /**
     * Fetches all distinct entity types from action_logs.
     */
    async getAllEntityTypes() {
        const query = `
            SELECT DISTINCT entity_type
            FROM action_logs
            ORDER BY entity_type ASC;
        `;
        const result = await database_1.default.query(query);
        return result.rows.map(row => row.entity_type);
    }
    /**
     * Fetches all active companies.
     */
    async getAllCompanies() {
        const query = `
            SELECT id, name
            FROM companies
            WHERE is_active = true
            ORDER BY name ASC;
        `;
        const result = await database_1.default.query(query);
        return result.rows;
    }
}
exports.LookupModel = LookupModel;
exports.default = new LookupModel();
