"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const module_service_1 = __importDefault(require("../services/module.service"));
const permission_service_1 = __importDefault(require("../services/permission.service"));
const rolePermission_service_1 = __importDefault(require("../services/rolePermission.service"));
const response_1 = require("../utils/response");
const logger_1 = __importDefault(require("../utils/logger"));
class PermissionController {
    // ==================== MODULES ====================
    /**
     * Get all modules
     */
    async getAllModules(req, res) {
        try {
            const includeInactive = req.query.include_inactive === 'true';
            const hierarchy = req.query.hierarchy === 'true';
            const modules = hierarchy
                ? await module_service_1.default.findAllHierarchy(includeInactive)
                : await module_service_1.default.findAll(includeInactive);
            (0, response_1.successResponse)(res, 200, 'Modules retrieved successfully', modules);
        }
        catch (error) {
            logger_1.default.error('Error getting modules:', error);
            (0, response_1.errorResponse)(res, 500, error.message || 'Failed to get modules');
        }
    }
    /**
     * Get a single module
     */
    async getModuleById(req, res) {
        try {
            const id = parseInt(req.params.id);
            const module = await module_service_1.default.findById(id);
            if (!module) {
                (0, response_1.errorResponse)(res, 404, 'Module not found');
                return;
            }
            // Get child modules
            const children = await module_service_1.default.findByParentId(id);
            (0, response_1.successResponse)(res, 200, 'Module retrieved successfully', { ...module, children });
        }
        catch (error) {
            logger_1.default.error('Error getting module:', error);
            (0, response_1.errorResponse)(res, 500, error.message || 'Failed to get module');
        }
    }
    /**
     * Create a new module
     */
    async createModule(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                (0, response_1.errorResponse)(res, 401, 'User not authenticated');
                return;
            }
            const { name, code, description, parent_id, icon, route, display_order, is_active } = req.body;
            if (!name || !code) {
                (0, response_1.errorResponse)(res, 400, 'Module name and code are required');
                return;
            }
            const module = await module_service_1.default.create({
                name, code, description, parent_id, icon, route, display_order, is_active
            }, userId);
            (0, response_1.successResponse)(res, 201, 'Module created successfully', module);
        }
        catch (error) {
            logger_1.default.error('Error creating module:', error);
            (0, response_1.errorResponse)(res, 400, error.message || 'Failed to create module');
        }
    }
    /**
     * Update a module
     */
    async updateModule(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                (0, response_1.errorResponse)(res, 401, 'User not authenticated');
                return;
            }
            const id = parseInt(req.params.id);
            const { name, code, description, parent_id, icon, route, display_order, is_active } = req.body;
            const module = await module_service_1.default.update(id, {
                name, code, description, parent_id, icon, route, display_order, is_active
            }, userId);
            (0, response_1.successResponse)(res, 200, 'Module updated successfully', module);
        }
        catch (error) {
            logger_1.default.error('Error updating module:', error);
            (0, response_1.errorResponse)(res, 400, error.message || 'Failed to update module');
        }
    }
    /**
     * Delete a module
     */
    async deleteModule(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                (0, response_1.errorResponse)(res, 401, 'User not authenticated');
                return;
            }
            const id = parseInt(req.params.id);
            await module_service_1.default.delete(id, userId);
            (0, response_1.successResponse)(res, 200, 'Module deleted successfully');
        }
        catch (error) {
            logger_1.default.error('Error deleting module:', error);
            (0, response_1.errorResponse)(res, 400, error.message || 'Failed to delete module');
        }
    }
    /**
     * Toggle module active status
     */
    async toggleModuleActive(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                (0, response_1.errorResponse)(res, 401, 'User not authenticated');
                return;
            }
            const id = parseInt(req.params.id);
            const module = await module_service_1.default.toggleActive(id, userId);
            (0, response_1.successResponse)(res, 200, 'Module status toggled successfully', module);
        }
        catch (error) {
            logger_1.default.error('Error toggling module status:', error);
            (0, response_1.errorResponse)(res, 400, error.message || 'Failed to toggle module status');
        }
    }
    // ==================== PERMISSIONS ====================
    /**
     * Get all permissions
     */
    async getAllPermissions(req, res) {
        var _a, _b;
        try {
            const includeInactive = req.query.include_inactive === 'true';
            const withModules = req.query.with_modules !== 'false'; // Default true
            const permissions = withModules
                ? await permission_service_1.default.findAllWithModules(includeInactive)
                : await permission_service_1.default.findAll(includeInactive);
            (0, response_1.successResponse)(res, 200, 'Permissions retrieved successfully', permissions);
        }
        catch (error) {
            logger_1.default.error('Error getting permissions:', error);
            // Check if RBAC tables don't exist yet
            if (((_a = error === null || error === void 0 ? void 0 : error.message) === null || _a === void 0 ? void 0 : _a.includes('relation')) && ((_b = error === null || error === void 0 ? void 0 : error.message) === null || _b === void 0 ? void 0 : _b.includes('does not exist'))) {
                (0, response_1.errorResponse)(res, 503, 'RBAC tables not initialized. Please run the migration script: db_queries/rbac_migration.sql');
                return;
            }
            (0, response_1.errorResponse)(res, 500, error.message || 'Failed to get permissions');
        }
    }
    /**
     * Get permissions for a module
     */
    async getPermissionsByModule(req, res) {
        try {
            const moduleId = parseInt(req.params.moduleId);
            const includeInactive = req.query.include_inactive === 'true';
            const permissions = await permission_service_1.default.findByModuleId(moduleId, includeInactive);
            (0, response_1.successResponse)(res, 200, 'Permissions retrieved successfully', permissions);
        }
        catch (error) {
            logger_1.default.error('Error getting permissions:', error);
            (0, response_1.errorResponse)(res, 500, error.message || 'Failed to get permissions');
        }
    }
    /**
     * Create a new permission
     */
    async createPermission(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                (0, response_1.errorResponse)(res, 401, 'User not authenticated');
                return;
            }
            const { module_id, action, description, is_active } = req.body;
            if (!module_id || !action) {
                (0, response_1.errorResponse)(res, 400, 'Module ID and action are required');
                return;
            }
            if (!['read', 'create', 'update', 'delete'].includes(action)) {
                (0, response_1.errorResponse)(res, 400, 'Invalid action. Must be: read, create, update, or delete');
                return;
            }
            const permission = await permission_service_1.default.create({
                module_id, action, description, is_active
            }, userId);
            (0, response_1.successResponse)(res, 201, 'Permission created successfully', permission);
        }
        catch (error) {
            logger_1.default.error('Error creating permission:', error);
            (0, response_1.errorResponse)(res, 400, error.message || 'Failed to create permission');
        }
    }
    /**
     * Bulk create permissions for a module
     */
    async bulkCreatePermissions(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                (0, response_1.errorResponse)(res, 401, 'User not authenticated');
                return;
            }
            const moduleId = parseInt(req.params.moduleId);
            const { actions } = req.body;
            const validActions = ['read', 'create', 'update', 'delete'];
            const actionsToCreate = actions || validActions;
            // Validate actions
            for (const action of actionsToCreate) {
                if (!validActions.includes(action)) {
                    (0, response_1.errorResponse)(res, 400, `Invalid action: ${action}`);
                    return;
                }
            }
            const permissions = await permission_service_1.default.bulkCreateForModule(moduleId, actionsToCreate, userId);
            (0, response_1.successResponse)(res, 201, 'Permissions created successfully', permissions);
        }
        catch (error) {
            logger_1.default.error('Error bulk creating permissions:', error);
            (0, response_1.errorResponse)(res, 400, error.message || 'Failed to create permissions');
        }
    }
    /**
     * Toggle permission active status
     */
    async togglePermissionActive(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                (0, response_1.errorResponse)(res, 401, 'User not authenticated');
                return;
            }
            const id = parseInt(req.params.id);
            const permission = await permission_service_1.default.toggleActive(id, userId);
            (0, response_1.successResponse)(res, 200, 'Permission status toggled successfully', permission);
        }
        catch (error) {
            logger_1.default.error('Error toggling permission status:', error);
            (0, response_1.errorResponse)(res, 400, error.message || 'Failed to toggle permission status');
        }
    }
    // ==================== ROLE PERMISSIONS ====================
    /**
     * Get all permissions for a role
     */
    async getRolePermissions(req, res) {
        try {
            const roleId = parseInt(req.params.roleId);
            const grouped = req.query.grouped === 'true';
            const permissions = grouped
                ? await rolePermission_service_1.default.getPermissionsGroupedByModule(roleId)
                : await rolePermission_service_1.default.findByRoleIdWithDetails(roleId);
            (0, response_1.successResponse)(res, 200, 'Role permissions retrieved successfully', permissions);
        }
        catch (error) {
            logger_1.default.error('Error getting role permissions:', error);
            (0, response_1.errorResponse)(res, 500, error.message || 'Failed to get role permissions');
        }
    }
    /**
     * Check if role has specific permission
     */
    async checkRolePermission(req, res) {
        try {
            const roleId = parseInt(req.params.roleId);
            const { module_code, action } = req.query;
            if (!module_code || !action) {
                (0, response_1.errorResponse)(res, 400, 'Module code and action are required');
                return;
            }
            const result = await rolePermission_service_1.default.hasPermission(roleId, module_code, action);
            (0, response_1.successResponse)(res, 200, 'Permission check completed', result);
        }
        catch (error) {
            logger_1.default.error('Error checking permission:', error);
            (0, response_1.errorResponse)(res, 500, error.message || 'Failed to check permission');
        }
    }
    /**
     * Assign a permission to a role
     */
    async assignRolePermission(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                (0, response_1.errorResponse)(res, 401, 'User not authenticated');
                return;
            }
            const roleId = parseInt(req.params.roleId);
            const { permission_id, branch_level_access } = req.body;
            if (!permission_id) {
                (0, response_1.errorResponse)(res, 400, 'Permission ID is required');
                return;
            }
            const rolePermission = await rolePermission_service_1.default.assignPermission({
                role_id: roleId,
                permission_id,
                branch_level_access: branch_level_access || false
            }, userId);
            (0, response_1.successResponse)(res, 201, 'Permission assigned successfully', rolePermission);
        }
        catch (error) {
            logger_1.default.error('Error assigning permission:', error);
            (0, response_1.errorResponse)(res, 400, error.message || 'Failed to assign permission');
        }
    }
    /**
     * Remove a permission from a role
     */
    async removeRolePermission(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                (0, response_1.errorResponse)(res, 401, 'User not authenticated');
                return;
            }
            const roleId = parseInt(req.params.roleId);
            const permissionId = parseInt(req.params.permissionId);
            await rolePermission_service_1.default.removePermission(roleId, permissionId, userId);
            (0, response_1.successResponse)(res, 200, 'Permission removed successfully');
        }
        catch (error) {
            logger_1.default.error('Error removing permission:', error);
            (0, response_1.errorResponse)(res, 400, error.message || 'Failed to remove permission');
        }
    }
    /**
     * Bulk assign permissions to a role
     */
    async bulkAssignRolePermissions(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                (0, response_1.errorResponse)(res, 401, 'User not authenticated');
                return;
            }
            const roleId = parseInt(req.params.roleId);
            const { permissions } = req.body;
            if (!permissions || !Array.isArray(permissions)) {
                (0, response_1.errorResponse)(res, 400, 'Permissions array is required');
                return;
            }
            // Validate structure
            for (const perm of permissions) {
                if (typeof perm.permission_id !== 'number') {
                    (0, response_1.errorResponse)(res, 400, 'Each permission must have a permission_id (number)');
                    return;
                }
            }
            const permissionConfigs = permissions.map((p) => ({
                permission_id: p.permission_id,
                branch_level_access: p.branch_level_access || false
            }));
            const rolePermissions = await rolePermission_service_1.default.bulkAssign(roleId, permissionConfigs, userId);
            (0, response_1.successResponse)(res, 200, 'Permissions assigned successfully', {
                count: rolePermissions.length,
                permissions: rolePermissions
            });
        }
        catch (error) {
            logger_1.default.error('Error bulk assigning permissions:', error);
            (0, response_1.errorResponse)(res, 400, error.message || 'Failed to assign permissions');
        }
    }
    /**
     * Clone permissions from one role to another
     */
    async cloneRolePermissions(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                (0, response_1.errorResponse)(res, 401, 'User not authenticated');
                return;
            }
            const fromRoleId = parseInt(req.params.roleId);
            const { to_role_id } = req.body;
            if (!to_role_id) {
                (0, response_1.errorResponse)(res, 400, 'Target role ID is required');
                return;
            }
            const cloned = await rolePermission_service_1.default.clonePermissions(fromRoleId, to_role_id, userId);
            (0, response_1.successResponse)(res, 200, 'Permissions cloned successfully', {
                count: cloned.length,
                permissions: cloned
            });
        }
        catch (error) {
            logger_1.default.error('Error cloning permissions:', error);
            (0, response_1.errorResponse)(res, 400, error.message || 'Failed to clone permissions');
        }
    }
    /**
     * Get accessible routes for a role
     */
    async getRoleAccessibleRoutes(req, res) {
        try {
            const roleId = parseInt(req.params.roleId);
            const routes = await rolePermission_service_1.default.getAccessibleRoutes(roleId);
            (0, response_1.successResponse)(res, 200, 'Accessible routes retrieved successfully', routes);
        }
        catch (error) {
            logger_1.default.error('Error getting accessible routes:', error);
            (0, response_1.errorResponse)(res, 500, error.message || 'Failed to get accessible routes');
        }
    }
    /**
     * Get current user's permissions
     */
    async getCurrentUserPermissions(req, res) {
        var _a, _b;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const roleId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role_id;
            if (!userId || !roleId) {
                (0, response_1.errorResponse)(res, 401, 'User not authenticated');
                return;
            }
            const permissions = await rolePermission_service_1.default.getPermissionsGroupedByModule(roleId);
            (0, response_1.successResponse)(res, 200, 'User permissions retrieved successfully', {
                user_id: userId,
                role_id: roleId,
                permissions
            });
        }
        catch (error) {
            logger_1.default.error('Error getting user permissions:', error);
            (0, response_1.errorResponse)(res, 500, error.message || 'Failed to get user permissions');
        }
    }
}
exports.default = new PermissionController();
