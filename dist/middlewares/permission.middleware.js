"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAllPermissions = exports.checkAnyPermission = exports.autoCheckPermission = exports.checkPermission = void 0;
exports.applyBranchFilter = applyBranchFilter;
exports.getBranchFilterSQL = getBranchFilterSQL;
exports.getAccessFilter = getAccessFilter;
const rolePermission_service_1 = __importDefault(require("../services/rolePermission.service"));
const logger_1 = __importDefault(require("../utils/logger"));
const accessFilter_util_1 = __importDefault(require("../utils/accessFilter.util"));
/**
 * Module permission mapping for routes
 * Maps route patterns to module codes
 */
const ROUTE_MODULE_MAP = {
    // Dashboard
    '/dashboard': 'DASHBOARD',
    '/api/dashboard': 'DASHBOARD',
    // Assets
    '/assets/create': 'ASSETS_CREATE',
    '/assets/view': 'ASSETS_VIEW',
    '/api/assets': 'ASSETS',
    // Assignments
    '/assets/assign': 'ASSIGNMENTS_ASSIGN',
    '/api/assignments': 'ASSIGNMENTS',
    // Expenses
    '/expenses/create': 'EXPENSES_CREATE',
    '/api/expenses': 'EXPENSES',
    // Repair Requests
    '/repair-requests': 'REPAIR_REQUESTS_LIST',
    '/repair-requests/new': 'REPAIR_REQUESTS_NEW',
    '/repair-requests/workflow': 'REPAIR_REQUESTS_WORKFLOW',
    '/api/repair-requests': 'REPAIR_REQUESTS',
    // Reports
    '/reports/assets': 'REPORTS_ASSETS',
    '/reports/expenses': 'REPORTS_EXPENSES',
    '/reports/assignments': 'REPORTS_ASSIGNMENTS',
    '/reports/repair-summary': 'REPORTS_REPAIR_SUMMARY',
    '/reports/action-logs': 'REPORTS_ACTION_LOGS',
    '/api/reports': 'REPORTS',
    // Administration
    '/users/manage': 'ADMIN_USERS',
    '/users/import-history': 'ADMIN_USERS',
    '/roles/manage': 'ADMIN_ROLES',
    '/permissions/manage': 'ADMIN_PERMISSIONS',
    '/branches/manage': 'ADMIN_BRANCHES',
    '/departments/manage': 'ADMIN_DEPARTMENTS',
    '/asset-statuses/manage': 'ADMIN_ASSET_STATUSES',
    '/asset-types/manage': 'ADMIN_ASSET_TYPES',
    '/expense-types/manage': 'ADMIN_EXPENSE_TYPES',
    '/repair-request-types/manage': 'ADMIN_REPAIR_TYPES',
    '/repair-request-statuses/manage': 'ADMIN_REPAIR_STATUSES',
    '/repair-request-priorities/manage': 'ADMIN_REPAIR_PRIORITIES',
    '/api/users': 'ADMIN_USERS',
    '/api/roles': 'ADMIN_ROLES',
    '/api/permissions': 'ADMIN_PERMISSIONS',
    '/api/branches': 'ADMIN_BRANCHES',
    '/api/departments': 'ADMIN_DEPARTMENTS',
    // Settings
    '/settings/configuration': 'SETTINGS_SYSTEM',
    '/api/system-config': 'SETTINGS_SYSTEM',
};
/**
 * HTTP method to permission action mapping
 */
const METHOD_ACTION_MAP = {
    'GET': 'read',
    'HEAD': 'read',
    'POST': 'create',
    'PUT': 'update',
    'PATCH': 'update',
    'DELETE': 'delete'
};
/**
 * Get the module code for a given route
 */
function getModuleCodeForRoute(path) {
    // Direct match
    if (ROUTE_MODULE_MAP[path]) {
        return ROUTE_MODULE_MAP[path];
    }
    // Try matching route patterns
    for (const [pattern, moduleCode] of Object.entries(ROUTE_MODULE_MAP)) {
        // Handle API routes with IDs (e.g., /api/assets/123)
        if (path.startsWith(pattern)) {
            return moduleCode;
        }
        // Handle parameterized routes
        const regexPattern = pattern.replace(/:[^/]+/g, '[^/]+');
        const regex = new RegExp(`^${regexPattern}$`);
        if (regex.test(path)) {
            return moduleCode;
        }
    }
    return null;
}
/**
 * Middleware to check if user has permission for a specific module and action
 * @param moduleCode - The module code to check permission for
 * @param action - The action to check (read, create, update, delete)
 */
const checkPermission = (moduleCode, action) => {
    return async (req, res, next) => {
        try {
            const user = req.user;
            if (!user || !user.role_id) {
                if (req.originalUrl.startsWith('/api')) {
                    return res.status(401).json({
                        success: false,
                        message: 'User not authenticated'
                    });
                }
                return res.redirect('/login');
            }
            // Admin bypass - Admins have all permissions
            if (user.role === 'Admin') {
                req.permissionContext = {
                    hasAccess: true,
                    branchLevelAccess: false,
                    companyLevelAccess: false,
                    userBranchId: user.branch_id || null,
                    userCompanyId: user.company_id || null,
                    isAdmin: true
                };
                return next();
            }
            const result = await rolePermission_service_1.default.hasPermission(user.role_id, moduleCode, action);
            if (!result.hasAccess) {
                logger_1.default.warn(`Permission denied: User ${user.id} attempted ${action} on ${moduleCode}`);
                if (req.originalUrl.startsWith('/api')) {
                    return res.status(403).json({
                        success: false,
                        message: 'You do not have permission to perform this action'
                    });
                }
                return res.status(403).render('403', {
                    message: 'You do not have permission to access this page'
                });
            }
            // Build full access context with accessible branch and company IDs
            const accessContext = await accessFilter_util_1.default.buildContext(user, {
                branchLevelAccess: result.branchLevelAccess,
                userBranchId: user.branch_id || null
            });
            // Store permission context for use in controllers
            req.permissionContext = {
                hasAccess: true,
                branchLevelAccess: accessContext.branchLevelAccess,
                companyLevelAccess: accessContext.companyLevelAccess,
                userBranchId: accessContext.branchId,
                userCompanyId: accessContext.companyId,
                accessibleBranchIds: accessContext.accessibleBranchIds,
                accessibleCompanyIds: accessContext.accessibleCompanyIds,
                isAdmin: false
            };
            next();
        }
        catch (error) {
            logger_1.default.error('Error checking permission:', error);
            if (req.originalUrl.startsWith('/api')) {
                return res.status(500).json({
                    success: false,
                    message: 'Error checking permissions'
                });
            }
            return res.status(500).render('500', { message: 'Internal server error' });
        }
    };
};
exports.checkPermission = checkPermission;
/**
 * Middleware to automatically check permissions based on route and HTTP method
 * Use this for routes that follow standard patterns
 */
const autoCheckPermission = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user || !user.role_id) {
            if (req.originalUrl.startsWith('/api')) {
                return res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
            }
            return res.redirect('/login');
        }
        // Admin bypass
        if (user.role === 'Admin') {
            req.permissionContext = {
                hasAccess: true,
                branchLevelAccess: false,
                companyLevelAccess: false,
                userBranchId: user.branch_id || null,
                userCompanyId: user.company_id || null,
                isAdmin: true
            };
            return next();
        }
        const moduleCode = getModuleCodeForRoute(req.path);
        if (!moduleCode) {
            // Route not mapped - build access context anyway for data filtering
            const accessContext = await accessFilter_util_1.default.buildContext(user, {
                branchLevelAccess: false,
                userBranchId: user.branch_id || null
            });
            req.permissionContext = {
                hasAccess: true,
                branchLevelAccess: accessContext.branchLevelAccess,
                companyLevelAccess: accessContext.companyLevelAccess,
                userBranchId: accessContext.branchId,
                userCompanyId: accessContext.companyId,
                accessibleBranchIds: accessContext.accessibleBranchIds,
                accessibleCompanyIds: accessContext.accessibleCompanyIds,
                isAdmin: false
            };
            return next();
        }
        const action = METHOD_ACTION_MAP[req.method] || 'read';
        const result = await rolePermission_service_1.default.hasPermission(user.role_id, moduleCode, action);
        if (!result.hasAccess) {
            logger_1.default.warn(`Permission denied: User ${user.id} attempted ${action} on ${moduleCode}`);
            if (req.originalUrl.startsWith('/api')) {
                return res.status(403).json({
                    success: false,
                    message: 'You do not have permission to perform this action'
                });
            }
            return res.status(403).render('403', {
                message: 'You do not have permission to access this page'
            });
        }
        // Build full access context with accessible branch and company IDs
        const accessContext = await accessFilter_util_1.default.buildContext(user, {
            branchLevelAccess: result.branchLevelAccess,
            userBranchId: user.branch_id || null
        });
        req.permissionContext = {
            hasAccess: true,
            branchLevelAccess: accessContext.branchLevelAccess,
            companyLevelAccess: accessContext.companyLevelAccess,
            userBranchId: accessContext.branchId,
            userCompanyId: accessContext.companyId,
            accessibleBranchIds: accessContext.accessibleBranchIds,
            accessibleCompanyIds: accessContext.accessibleCompanyIds,
            isAdmin: false
        };
        next();
    }
    catch (error) {
        logger_1.default.error('Error in auto permission check:', error);
        next(); // Continue on error to avoid blocking
    }
};
exports.autoCheckPermission = autoCheckPermission;
/**
 * Middleware to check multiple permissions (ANY - user needs at least one)
 */
const checkAnyPermission = (permissions) => {
    return async (req, res, next) => {
        try {
            const user = req.user;
            if (!user || !user.role_id) {
                if (req.originalUrl.startsWith('/api')) {
                    return res.status(401).json({ success: false, message: 'User not authenticated' });
                }
                return res.redirect('/login');
            }
            // Admin bypass
            if (user.role === 'Admin') {
                req.permissionContext = {
                    hasAccess: true,
                    branchLevelAccess: false,
                    companyLevelAccess: false,
                    userBranchId: user.branch_id || null,
                    userCompanyId: user.company_id || null,
                    isAdmin: true
                };
                return next();
            }
            let hasAnyPermission = false;
            let branchLevelAccess = false;
            for (const perm of permissions) {
                const result = await rolePermission_service_1.default.hasPermission(user.role_id, perm.moduleCode, perm.action);
                if (result.hasAccess) {
                    hasAnyPermission = true;
                    branchLevelAccess = result.branchLevelAccess;
                    break;
                }
            }
            if (!hasAnyPermission) {
                if (req.originalUrl.startsWith('/api')) {
                    return res.status(403).json({
                        success: false,
                        message: 'You do not have permission to perform this action'
                    });
                }
                return res.status(403).render('403', {
                    message: 'You do not have permission to access this page'
                });
            }
            // Build full access context
            const accessContext = await accessFilter_util_1.default.buildContext(user, {
                branchLevelAccess,
                userBranchId: user.branch_id || null
            });
            req.permissionContext = {
                hasAccess: true,
                branchLevelAccess: accessContext.branchLevelAccess,
                companyLevelAccess: accessContext.companyLevelAccess,
                userBranchId: accessContext.branchId,
                userCompanyId: accessContext.companyId,
                accessibleBranchIds: accessContext.accessibleBranchIds,
                accessibleCompanyIds: accessContext.accessibleCompanyIds,
                isAdmin: false
            };
            next();
        }
        catch (error) {
            logger_1.default.error('Error checking permissions:', error);
            if (req.originalUrl.startsWith('/api')) {
                return res.status(500).json({ success: false, message: 'Error checking permissions' });
            }
            return res.status(500).render('500', { message: 'Internal server error' });
        }
    };
};
exports.checkAnyPermission = checkAnyPermission;
/**
 * Middleware to check multiple permissions (ALL - user needs all)
 */
const checkAllPermissions = (permissions) => {
    return async (req, res, next) => {
        try {
            const user = req.user;
            if (!user || !user.role_id) {
                if (req.originalUrl.startsWith('/api')) {
                    return res.status(401).json({ success: false, message: 'User not authenticated' });
                }
                return res.redirect('/login');
            }
            // Admin bypass
            if (user.role === 'Admin') {
                req.permissionContext = {
                    hasAccess: true,
                    branchLevelAccess: false,
                    companyLevelAccess: false,
                    userBranchId: user.branch_id || null,
                    userCompanyId: user.company_id || null,
                    isAdmin: true
                };
                return next();
            }
            let hasAllPermissions = true;
            let branchLevelAccess = false;
            for (const perm of permissions) {
                const result = await rolePermission_service_1.default.hasPermission(user.role_id, perm.moduleCode, perm.action);
                if (!result.hasAccess) {
                    hasAllPermissions = false;
                    break;
                }
                if (result.branchLevelAccess) {
                    branchLevelAccess = true;
                }
            }
            if (!hasAllPermissions) {
                if (req.originalUrl.startsWith('/api')) {
                    return res.status(403).json({
                        success: false,
                        message: 'You do not have permission to perform this action'
                    });
                }
                return res.status(403).render('403', {
                    message: 'You do not have permission to access this page'
                });
            }
            // Build full access context
            const accessContext = await accessFilter_util_1.default.buildContext(user, {
                branchLevelAccess,
                userBranchId: user.branch_id || null
            });
            req.permissionContext = {
                hasAccess: true,
                branchLevelAccess: accessContext.branchLevelAccess,
                companyLevelAccess: accessContext.companyLevelAccess,
                userBranchId: accessContext.branchId,
                userCompanyId: accessContext.companyId,
                accessibleBranchIds: accessContext.accessibleBranchIds,
                accessibleCompanyIds: accessContext.accessibleCompanyIds,
                isAdmin: false
            };
            next();
        }
        catch (error) {
            logger_1.default.error('Error checking permissions:', error);
            if (req.originalUrl.startsWith('/api')) {
                return res.status(500).json({ success: false, message: 'Error checking permissions' });
            }
            return res.status(500).render('500', { message: 'Internal server error' });
        }
    };
};
exports.checkAllPermissions = checkAllPermissions;
/**
 * Helper to apply branch-level filtering to queries
 * Use in controllers when branchLevelAccess is true
 * @deprecated Use AccessFilterUtil instead
 */
function applyBranchFilter(query, permissionContext, branchField = 'branch_id') {
    if (!permissionContext || !permissionContext.branchLevelAccess || !permissionContext.userBranchId) {
        return query;
    }
    return {
        ...query,
        [branchField]: permissionContext.userBranchId
    };
}
/**
 * Get branch filter SQL condition
 * @deprecated Use AccessFilterUtil instead
 */
function getBranchFilterSQL(permissionContext, tableAlias = '', branchField = 'branch_id') {
    if (!permissionContext || !permissionContext.branchLevelAccess || !permissionContext.userBranchId) {
        return { condition: '', value: null };
    }
    const field = tableAlias ? `${tableAlias}.${branchField}` : branchField;
    return {
        condition: ` AND ${field} = $BRANCH_ID`,
        value: permissionContext.userBranchId
    };
}
/**
 * Get access filter for branch and company
 * Returns SQL conditions and values for filtering queries
 */
function getAccessFilter(permissionContext, config = {}, startParamIndex = 1) {
    const conditions = [];
    const values = [];
    let paramIndex = startParamIndex;
    if (!permissionContext || permissionContext.isAdmin) {
        return { conditions, values, nextParamIndex: paramIndex };
    }
    // Branch level filtering
    if (permissionContext.branchLevelAccess && permissionContext.accessibleBranchIds && permissionContext.accessibleBranchIds.length > 0) {
        const branchTable = config.branchTable || '';
        const branchField = config.branchField || 'branch_id';
        const fullField = branchTable ? `${branchTable}.${branchField}` : branchField;
        if (permissionContext.accessibleBranchIds.length === 1) {
            conditions.push(`${fullField} = $${paramIndex}`);
            values.push(permissionContext.accessibleBranchIds[0]);
            paramIndex++;
        }
        else {
            const placeholders = permissionContext.accessibleBranchIds.map((_, i) => `$${paramIndex + i}`).join(', ');
            conditions.push(`${fullField} IN (${placeholders})`);
            values.push(...permissionContext.accessibleBranchIds);
            paramIndex += permissionContext.accessibleBranchIds.length;
        }
    }
    // Company level filtering
    if (permissionContext.companyLevelAccess && permissionContext.accessibleCompanyIds && permissionContext.accessibleCompanyIds.length > 0) {
        if (config.companyTable || config.companyField) {
            const companyTable = config.companyTable || '';
            const companyField = config.companyField || 'company_id';
            const fullField = companyTable ? `${companyTable}.${companyField}` : companyField;
            if (permissionContext.accessibleCompanyIds.length === 1) {
                conditions.push(`(${fullField} = $${paramIndex} OR ${fullField} IS NULL)`);
                values.push(permissionContext.accessibleCompanyIds[0]);
                paramIndex++;
            }
            else {
                const placeholders = permissionContext.accessibleCompanyIds.map((_, i) => `$${paramIndex + i}`).join(', ');
                conditions.push(`(${fullField} IN (${placeholders}) OR ${fullField} IS NULL)`);
                values.push(...permissionContext.accessibleCompanyIds);
                paramIndex += permissionContext.accessibleCompanyIds.length;
            }
        }
    }
    return { conditions, values, nextParamIndex: paramIndex };
}
