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
}
exports.LookupModel = LookupModel;
exports.default = new LookupModel();
