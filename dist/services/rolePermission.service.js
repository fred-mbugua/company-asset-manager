"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const rolePermission_model_1 = __importDefault(require("../models/rolePermission.model"));
const role_model_1 = __importDefault(require("../models/role.model"));
const permission_model_1 = __importDefault(require("../models/permission.model"));
const actionLog_model_1 = __importDefault(require("../models/actionLog.model"));
const logger_1 = __importDefault(require("../utils/logger"));
class RolePermissionService {
    constructor() {
        // Cache for role permissions (in production, consider Redis)
        this.permissionCache = new Map();
        this.cacheTimeout = new Map();
        this.CACHE_TTL = 5 * 60 * 1000; // 5 minutes
    }
    /**
     * Get all permissions for a role
     */
    async findByRoleId(roleId) {
        return await rolePermission_model_1.default.findByRoleId(roleId);
    }
    /**
     * Get all permissions for a role with details
     */
    async findByRoleIdWithDetails(roleId) {
        return await rolePermission_model_1.default.findByRoleIdWithDetails(roleId);
    }
    /**
     * Get permissions grouped by module for a role
     */
    async getPermissionsGroupedByModule(roleId) {
        // Check cache first
        if (this.permissionCache.has(roleId)) {
            return this.permissionCache.get(roleId);
        }
        const grouped = await rolePermission_model_1.default.getPermissionsGroupedByModule(roleId);
        // Cache the result
        this.cachePermissions(roleId, grouped);
        return grouped;
    }
    /**
     * Check if a role has a specific permission
     */
    async hasPermission(roleId, moduleCode, action) {
        return await rolePermission_model_1.default.hasPermission(roleId, moduleCode, action);
    }
    /**
     * Assign a single permission to a role
     */
    async assignPermission(data, userId) {
        // Validate role exists
        const role = await role_model_1.default.findById(data.role_id);
        if (!role) {
            throw new Error('Role not found');
        }
        // Validate permission exists
        const permission = await permission_model_1.default.findById(data.permission_id);
        if (!permission) {
            throw new Error('Permission not found');
        }
        // Check if already assigned
        const existing = await rolePermission_model_1.default.findByRoleAndPermission(data.role_id, data.permission_id);
        if (existing) {
            // Update existing if branch_level_access differs
            if (data.branch_level_access !== undefined && data.branch_level_access !== existing.branch_level_access) {
                const updated = await rolePermission_model_1.default.update(existing.id, { branch_level_access: data.branch_level_access });
                this.invalidateCache(data.role_id);
                return updated;
            }
            return existing;
        }
        const rolePermission = await rolePermission_model_1.default.create(data);
        await actionLog_model_1.default.create({
            user_id: userId,
            action_type: 'CREATE',
            entity_type: 'RolePermission',
            entity_id: rolePermission.id,
            details: { role_id: data.role_id, permission_id: data.permission_id, branch_level_access: data.branch_level_access }
        });
        this.invalidateCache(data.role_id);
        logger_1.default.info(`Permission ${data.permission_id} assigned to role ${role.name}`);
        return rolePermission;
    }
    /**
     * Remove a permission from a role
     */
    async removePermission(roleId, permissionId, userId) {
        const existing = await rolePermission_model_1.default.findByRoleAndPermission(roleId, permissionId);
        if (!existing) {
            throw new Error('Role permission not found');
        }
        await rolePermission_model_1.default.delete(existing.id);
        await actionLog_model_1.default.create({
            user_id: userId,
            action_type: 'DELETE',
            entity_type: 'RolePermission',
            entity_id: existing.id,
            details: { role_id: roleId, permission_id: permissionId }
        });
        this.invalidateCache(roleId);
        logger_1.default.info(`Permission ${permissionId} removed from role ${roleId}`);
    }
    /**
     * Bulk assign permissions to a role (replaces existing)
     */
    async bulkAssign(roleId, permissionConfigs, userId) {
        // Validate role exists
        const role = await role_model_1.default.findById(roleId);
        if (!role) {
            throw new Error('Role not found');
        }
        // Prevent modifying Admin role's core permissions (optional security measure)
        // Uncomment below to enable
        // if (role.name === 'Admin') {
        //   throw new Error('Cannot modify Admin role permissions');
        // }
        const rolePermissions = await rolePermission_model_1.default.bulkAssign(roleId, permissionConfigs);
        await actionLog_model_1.default.create({
            user_id: userId,
            action_type: 'UPDATE',
            entity_type: 'RolePermission',
            entity_id: roleId,
            details: {
                role_name: role.name,
                permissions_count: permissionConfigs.length,
                action: 'bulk_assign'
            }
        });
        this.invalidateCache(roleId);
        logger_1.default.info(`Bulk permissions assigned to role ${role.name}: ${permissionConfigs.length} permissions`);
        return rolePermissions;
    }
    /**
     * Clone permissions from one role to another
     */
    async clonePermissions(fromRoleId, toRoleId, userId) {
        const fromRole = await role_model_1.default.findById(fromRoleId);
        const toRole = await role_model_1.default.findById(toRoleId);
        if (!fromRole || !toRole) {
            throw new Error('Source or target role not found');
        }
        const cloned = await rolePermission_model_1.default.clonePermissions(fromRoleId, toRoleId);
        await actionLog_model_1.default.create({
            user_id: userId,
            action_type: 'CREATE',
            entity_type: 'RolePermission',
            entity_id: toRoleId,
            details: {
                from_role: fromRole.name,
                to_role: toRole.name,
                permissions_count: cloned.length,
                action: 'clone'
            }
        });
        this.invalidateCache(toRoleId);
        logger_1.default.info(`Permissions cloned from ${fromRole.name} to ${toRole.name}`);
        return cloned;
    }
    /**
     * Get accessible routes for a role
     */
    async getAccessibleRoutes(roleId) {
        return await rolePermission_model_1.default.getAccessibleRoutes(roleId);
    }
    /**
     * Build user permission context for middleware
     */
    async buildUserPermissionContext(userId, roleId, roleName, branchId) {
        const permissions = await this.getPermissionsGroupedByModule(roleId);
        const permissionMap = new Map();
        permissions.forEach(module => {
            const actions = new Set();
            let branchLevelAccess = false;
            module.actions.forEach(action => {
                if (action.has_permission) {
                    actions.add(action.action);
                    if (action.branch_level_access) {
                        branchLevelAccess = true;
                    }
                }
            });
            if (actions.size > 0) {
                permissionMap.set(module.module_code, { actions, branchLevelAccess });
            }
        });
        return {
            userId,
            roleId,
            roleName,
            branchId,
            permissions: permissionMap
        };
    }
    /**
     * Cache permissions for a role
     */
    cachePermissions(roleId, permissions) {
        // Clear existing timeout if any
        const existingTimeout = this.cacheTimeout.get(roleId);
        if (existingTimeout) {
            clearTimeout(existingTimeout);
        }
        // Set cache
        this.permissionCache.set(roleId, permissions);
        // Set timeout to invalidate cache
        const timeout = setTimeout(() => {
            this.permissionCache.delete(roleId);
            this.cacheTimeout.delete(roleId);
        }, this.CACHE_TTL);
        this.cacheTimeout.set(roleId, timeout);
    }
    /**
     * Invalidate cache for a role
     */
    invalidateCache(roleId) {
        this.permissionCache.delete(roleId);
        const timeout = this.cacheTimeout.get(roleId);
        if (timeout) {
            clearTimeout(timeout);
            this.cacheTimeout.delete(roleId);
        }
    }
    /**
     * Clear all caches (useful for testing or manual refresh)
     */
    clearAllCaches() {
        this.permissionCache.clear();
        this.cacheTimeout.forEach(timeout => clearTimeout(timeout));
        this.cacheTimeout.clear();
    }
}
exports.default = new RolePermissionService();
