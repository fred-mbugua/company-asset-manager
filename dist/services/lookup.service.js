"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LookupService = void 0;
const lookup_model_1 = __importDefault(require("../models/lookup.model"));
class LookupService {
    /**
     * Fetching all required lists for the Expense Report filters.
     */
    async getExpenseFilters() {
        // Run all promises concurrently for fast loading
        const [assetTags, expenseTypes, departments, locations] = await Promise.all([
            lookup_model_1.default.getAllAssetTags(),
            lookup_model_1.default.getAllExpenseTypes(),
            lookup_model_1.default.getAllDepartments(),
            lookup_model_1.default.getAllBranches()
        ]);
        return {
            assetTags,
            expenseTypes,
            departments,
            locations
        };
    }
    /**
     * Fetches all required lists for the Assignment Report filters.
     */
    async getAssignmentFilters() {
        const [assetTags, departments, employees, locations] = await Promise.all([
            lookup_model_1.default.getAllAssetTags(),
            lookup_model_1.default.getAllDepartments(),
            lookup_model_1.default.getAllEmployeeNames(),
            lookup_model_1.default.getAllBranches()
        ]);
        return {
            assetTags,
            departments, // Array of { id, name }
            employees: employees.map(e => e.full_name), // Array of string names
            locations // Array of { id, name }
        };
    }
    /**
     * Fetching all required lists for the users page.
     */
    async getUserFilters() {
        // Run all promises concurrently for fast loading
        const [departments, locations, employees, userRoles, companies] = await Promise.all([
            lookup_model_1.default.getAllDepartments(),
            lookup_model_1.default.getAllBranches(),
            lookup_model_1.default.getAllEmployeeDetails(),
            lookup_model_1.default.getAllUserRoles(),
            lookup_model_1.default.getAllCompanies()
        ]);
        return {
            departments,
            locations,
            employees,
            userRoles,
            companies
        };
    }
    /**
     * Fetches all required lists for the Action Log Report filters.
     */
    async getActionLogFilters() {
        const [users, actionTypes, entityTypes] = await Promise.all([
            lookup_model_1.default.getAllUsers(),
            lookup_model_1.default.getAllActionTypes(),
            lookup_model_1.default.getAllEntityTypes()
        ]);
        return {
            users,
            actionTypes,
            entityTypes
        };
    }
}
exports.LookupService = LookupService;
exports.default = new LookupService();
