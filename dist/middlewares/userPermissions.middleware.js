"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadUserPermissions = void 0;
exports.hasModulePermission = hasModulePermission;
exports.hasBranchLevelAccess = hasBranchLevelAccess;
const rolePermission_service_1 = __importDefault(require("../services/rolePermission.service"));
const logger_1 = __importDefault(require("../utils/logger"));
/**
 * Middleware to load user permissions and attach to request/locals for use in views
 * This middleware should be applied after authentication
 */
const loadUserPermissions = async (req, res, next) => {
    var _a, _b;
    try {
        const user = req.user;
        // Skip if no user or if user is Admin (Admin has all permissions)
        if (!user || user.role === 'Admin') {
            res.locals.userPermissions = null;
            return next();
        }
        if (!user.role_id) {
            res.locals.userPermissions = null;
            return next();
        }
        // Load user permissions grouped by module
        const groupedPermissions = await rolePermission_service_1.default.getPermissionsGroupedByModule(user.role_id);
        // Convert to a Map-like object for easy access in templates
        const permissionMap = {};
        groupedPermissions.forEach(module => {
            const actions = [];
            let branchLevelAccess = false;
            module.actions.forEach(action => {
                if (action.has_permission) {
                    actions.push(action.action);
                    if (action.branch_level_access) {
                        branchLevelAccess = true;
                    }
                }
            });
            if (actions.length > 0) {
                permissionMap[module.module_code] = {
                    actions,
                    branchLevelAccess
                };
            }
        });
        // Attach to response locals for use in views
        res.locals.userPermissions = permissionMap;
        // Also attach to request for use in controllers
        req.userPermissions = permissionMap;
        next();
    }
    catch (error) {
        // Check if it's a "relation does not exist" error (tables not created yet)
        if (((_a = error === null || error === void 0 ? void 0 : error.message) === null || _a === void 0 ? void 0 : _a.includes('relation')) && ((_b = error === null || error === void 0 ? void 0 : error.message) === null || _b === void 0 ? void 0 : _b.includes('does not exist'))) {
            logger_1.default.warn('RBAC tables not yet created. Run the migration script: db_queries/rbac_migration.sql');
        }
        else {
            logger_1.default.error('Error loading user permissions:', error);
        }
        // Don't block the request if permissions fail to load
        res.locals.userPermissions = null;
        next();
    }
};
exports.loadUserPermissions = loadUserPermissions;
/**
 * Helper to check if user has a specific permission
 * Can be used in controllers or views
 */
function hasModulePermission(userPermissions, moduleCode, action = 'read') {
    if (!userPermissions)
        return false;
    const module = userPermissions[moduleCode];
    if (!module)
        return false;
    return module.actions.includes(action);
}
/**
 * Helper to check if user has branch-level access for a module
 */
function hasBranchLevelAccess(userPermissions, moduleCode) {
    if (!userPermissions)
        return false;
    const module = userPermissions[moduleCode];
    if (!module)
        return false;
    return module.branchLevelAccess;
}
