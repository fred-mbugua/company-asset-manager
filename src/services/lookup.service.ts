import LookupModel from '../models/lookup.model';

export class LookupService {

    /**
     * Fetching all required lists for the Expense Report filters.
     */
    async getExpenseFilters(): Promise<any> {
        // Run all promises concurrently for fast loading
        const [assetTags, expenseTypes, departments, locations] = await Promise.all([
            LookupModel.getAllAssetTags(),
            LookupModel.getAllExpenseTypes(),
            LookupModel.getAllDepartments(),
            LookupModel.getAllBranches()
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
    async getAssignmentFilters(): Promise<any> {
        const [assetTags, departments, employees, locations] = await Promise.all([
            LookupModel.getAllAssetTags(),
            LookupModel.getAllDepartments(),
            LookupModel.getAllEmployeeNames(),
            LookupModel.getAllBranches()
        ]);

        return {
            assetTags,
            departments, // Array of { id, name }
            employees: employees.map(e => e.full_name), // Array of string names
            locations  // Array of { id, name }
        };
    }

    /**
     * Fetching all required lists for the users page.
     */
    async getUserFilters(): Promise<any> {
        // Run all promises concurrently for fast loading
        const [departments, locations, employees, userRoles, companies] = await Promise.all([
            LookupModel.getAllDepartments(),
            LookupModel.getAllBranches(),
            LookupModel.getAllEmployeeDetails(),
            LookupModel.getAllUserRoles(),
            LookupModel.getAllCompanies()
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
    async getActionLogFilters(): Promise<any> {
        const [users, actionTypes, entityTypes] = await Promise.all([
            LookupModel.getAllUsers(),
            LookupModel.getAllActionTypes(),
            LookupModel.getAllEntityTypes()
        ]);

        return {
            users,
            actionTypes,
            entityTypes
        };
    }
}

export default new LookupService();