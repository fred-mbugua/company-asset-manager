"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("../config/database"));
const branch_model_1 = __importDefault(require("../models/branch.model"));
/**
 * Access Filter Utility
 * Provides consistent data filtering across all modules based on user's permissions
 *
 * KEY PRINCIPLE: Users should ONLY see data from their assigned company.
 * This is automatic based on user.company_id - no additional configuration needed.
 */
class AccessFilterUtil {
    /**
     * Build access filter context from user data and permission context
     *
     * IMPORTANT: Company filtering is now automatic for all non-admin users.
     * If a user has a company_id, they will only see data from that company.
     */
    async buildContext(user, permissionContext) {
        const isAdmin = (user === null || user === void 0 ? void 0 : user.role) === 'Admin';
        const branchLevelAccess = (permissionContext === null || permissionContext === void 0 ? void 0 : permissionContext.branchLevelAccess) || false;
        // Company level access is now automatic - if user has company_id, filter by it
        // No need to check role_company_access table - simpler and more robust
        const userCompanyId = (user === null || user === void 0 ? void 0 : user.company_id) || null;
        // Company filtering is automatic for non-admin users who have a company assigned
        const companyLevelAccess = !isAdmin && userCompanyId !== null;
        const context = {
            userId: user === null || user === void 0 ? void 0 : user.id,
            roleId: user === null || user === void 0 ? void 0 : user.role_id,
            branchId: (user === null || user === void 0 ? void 0 : user.branch_id) || (permissionContext === null || permissionContext === void 0 ? void 0 : permissionContext.userBranchId) || null,
            companyId: userCompanyId,
            branchLevelAccess: !isAdmin && branchLevelAccess,
            companyLevelAccess: companyLevelAccess,
            isAdmin
        };
        // Pre-fetch accessible branch IDs if branch restrictions apply
        if (context.branchLevelAccess && context.branchId) {
            context.accessibleBranchIds = await this.getAccessibleBranchIds(context.branchId);
        }
        // For company access, simply use the user's assigned company
        // This ensures when a user is transferred to a new company, they immediately see that company's data
        if (context.companyLevelAccess && context.companyId) {
            context.accessibleCompanyIds = [context.companyId];
        }
        return context;
    }
    /**
     * Check if role has company level access enabled for any permission
     * DEPRECATED: No longer used - company filtering is now automatic based on user.company_id
     */
    async checkCompanyLevelAccess(roleId) {
        var _a;
        if (!roleId)
            return false;
        try {
            const query = `
        SELECT EXISTS(
          SELECT 1 FROM role_permissions 
          WHERE role_id = $1 AND company_level_access = TRUE
        ) as has_company_access
      `;
            const result = await database_1.default.query(query, [roleId]);
            return ((_a = result.rows[0]) === null || _a === void 0 ? void 0 : _a.has_company_access) || false;
        }
        catch (error) {
            // Column might not exist yet
            return false;
        }
    }
    /**
     * Get all branch IDs accessible by a user based on their branch
     */
    async getAccessibleBranchIds(userBranchId) {
        try {
            return await branch_model_1.default.getAccessibleBranchIds(userBranchId);
        }
        catch (error) {
            // Fallback to just the user's branch
            return [userBranchId];
        }
    }
    /**
     * Get all company IDs accessible by a role
     */
    async getAccessibleCompanyIds(roleId, userCompanyId) {
        try {
            // Check if role has specific company restrictions
            const restrictionQuery = `
        SELECT company_id FROM role_company_access WHERE role_id = $1
      `;
            const restrictionResult = await database_1.default.query(restrictionQuery, [roleId]);
            if (restrictionResult.rows.length > 0) {
                // Role has specific company access restrictions
                return restrictionResult.rows.map(row => row.company_id);
            }
            // No restrictions - if user has a company assigned, use that
            // Otherwise return all active companies
            if (userCompanyId) {
                return [userCompanyId];
            }
            const allCompaniesQuery = `SELECT id FROM companies WHERE is_active = TRUE`;
            const allCompaniesResult = await database_1.default.query(allCompaniesQuery);
            return allCompaniesResult.rows.map(row => row.id);
        }
        catch (error) {
            // Table might not exist yet, return user's company or empty
            return userCompanyId ? [userCompanyId] : [];
        }
    }
    /**
     * Build SQL WHERE conditions for branch and company filtering
     * @param context Access filter context
     * @param tableConfig Configuration for table aliases and field names
     * @param startParamIndex Starting parameter index for SQL placeholders
     * @returns Query filter with conditions and values
     */
    buildSQLFilter(context, tableConfig = {}, startParamIndex = 1) {
        const conditions = [];
        const values = [];
        let paramIndex = startParamIndex;
        // Skip filtering for admins
        if (context.isAdmin) {
            return { conditions: [], values: [], paramStartIndex: paramIndex };
        }
        // Branch level filtering
        if (context.branchLevelAccess && context.accessibleBranchIds && context.accessibleBranchIds.length > 0) {
            const branchTable = tableConfig.branchTable || '';
            const branchField = tableConfig.branchField || 'branch_id';
            const fullField = branchTable ? `${branchTable}.${branchField}` : branchField;
            if (context.accessibleBranchIds.length === 1) {
                conditions.push(`${fullField} = $${paramIndex}`);
                values.push(context.accessibleBranchIds[0]);
                paramIndex++;
            }
            else {
                const placeholders = context.accessibleBranchIds.map((_, i) => `$${paramIndex + i}`).join(', ');
                conditions.push(`${fullField} IN (${placeholders})`);
                values.push(...context.accessibleBranchIds);
                paramIndex += context.accessibleBranchIds.length;
            }
        }
        // Company level filtering
        if (context.companyLevelAccess && context.accessibleCompanyIds && context.accessibleCompanyIds.length > 0) {
            // Filter by company field if specified
            if (tableConfig.companyTable || tableConfig.companyField) {
                const companyTable = tableConfig.companyTable || '';
                const companyField = tableConfig.companyField || 'company_id';
                const fullField = companyTable ? `${companyTable}.${companyField}` : companyField;
                if (context.accessibleCompanyIds.length === 1) {
                    conditions.push(`(${fullField} = $${paramIndex} OR ${fullField} IS NULL)`);
                    values.push(context.accessibleCompanyIds[0]);
                    paramIndex++;
                }
                else {
                    const placeholders = context.accessibleCompanyIds.map((_, i) => `$${paramIndex + i}`).join(', ');
                    conditions.push(`(${fullField} IN (${placeholders}) OR ${fullField} IS NULL)`);
                    values.push(...context.accessibleCompanyIds);
                    paramIndex += context.accessibleCompanyIds.length;
                }
            }
            // Also filter by employee company name if specified (for tables with company string field)
            if (tableConfig.employeeCompanyField) {
                // Get company names for the accessible company IDs
                // This will be handled separately as it requires async operation
            }
        }
        return { conditions, values, paramStartIndex: paramIndex };
    }
    /**
     * Build SQL WHERE clause string from filter
     */
    buildWhereClause(filter, existingConditions = []) {
        const allConditions = [...existingConditions, ...filter.conditions];
        if (allConditions.length === 0)
            return '';
        return allConditions.join(' AND ');
    }
    /**
     * Apply access filter to existing query parameters
     */
    applyToQueryParams(context, existingParams, existingConditions, tableConfig = {}) {
        const filter = this.buildSQLFilter(context, tableConfig, existingParams.length + 1);
        return {
            conditions: [...existingConditions, ...filter.conditions],
            params: [...existingParams, ...filter.values]
        };
    }
    /**
     * Get accessible company names for employee company field filtering
     */
    async getAccessibleCompanyNames(companyIds) {
        if (!companyIds || companyIds.length === 0)
            return [];
        const placeholders = companyIds.map((_, i) => `$${i + 1}`).join(', ');
        const query = `SELECT name FROM companies WHERE id IN (${placeholders})`;
        const result = await database_1.default.query(query, companyIds);
        return result.rows.map(row => row.name);
    }
    /**
     * Check if user can access a specific branch
     */
    async canAccessBranch(context, targetBranchId) {
        if (context.isAdmin)
            return true;
        if (!context.branchLevelAccess)
            return true;
        if (!context.accessibleBranchIds)
            return true;
        return context.accessibleBranchIds.includes(targetBranchId);
    }
    /**
     * Check if user can access a specific company
     */
    async canAccessCompany(context, targetCompanyId) {
        if (context.isAdmin)
            return true;
        if (!context.companyLevelAccess)
            return true;
        if (!context.accessibleCompanyIds)
            return true;
        return context.accessibleCompanyIds.includes(targetCompanyId);
    }
}
exports.default = new AccessFilterUtil();
