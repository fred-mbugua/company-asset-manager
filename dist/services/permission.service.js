"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const permission_model_1 = __importDefault(require("../models/permission.model"));
const module_model_1 = __importDefault(require("../models/module.model"));
const actionLog_model_1 = __importDefault(require("../models/actionLog.model"));
const logger_1 = __importDefault(require("../utils/logger"));
class PermissionService {
    /**
     * Get all permissions
     */
    async findAll(includeInactive = false) {
        return await permission_model_1.default.findAll(includeInactive);
    }
    /**
     * Get all permissions with module details
     */
    async findAllWithModules(includeInactive = false) {
        return await permission_model_1.default.findAllWithModules(includeInactive);
    }
    /**
     * Get permission by ID
     */
    async findById(id) {
        return await permission_model_1.default.findById(id);
    }
    /**
     * Get permissions for a module
     */
    async findByModuleId(moduleId, includeInactive = false) {
        return await permission_model_1.default.findByModuleId(moduleId, includeInactive);
    }
    /**
     * Create a new permission
     */
    async create(data, userId) {
        // Validate module exists
        const module = await module_model_1.default.findById(data.module_id);
        if (!module) {
            throw new Error('Module not found');
        }
        // Check if permission already exists
        const existing = await permission_model_1.default.findByModuleAndAction(data.module_id, data.action);
        if (existing) {
            throw new Error(`Permission '${data.action}' already exists for this module`);
        }
        const permission = await permission_model_1.default.create(data);
        await actionLog_model_1.default.create({
            user_id: userId,
            action_type: 'CREATE',
            entity_type: 'Permission',
            entity_id: permission.id,
            details: { module_id: data.module_id, action: data.action }
        });
        logger_1.default.info(`Permission created: ${data.action} for module ${module.code}`);
        return permission;
    }
    /**
     * Update a permission
     */
    async update(id, data, userId) {
        const existing = await permission_model_1.default.findById(id);
        if (!existing) {
            throw new Error('Permission not found');
        }
        // If changing module or action, check for duplicates
        if ((data.module_id || data.action) &&
            (data.module_id !== existing.module_id || data.action !== existing.action)) {
            const moduleId = data.module_id || existing.module_id;
            const action = data.action || existing.action;
            const duplicate = await permission_model_1.default.findByModuleAndAction(moduleId, action);
            if (duplicate && duplicate.id !== id) {
                throw new Error(`Permission '${action}' already exists for this module`);
            }
        }
        const permission = await permission_model_1.default.update(id, data);
        await actionLog_model_1.default.create({
            user_id: userId,
            action_type: 'UPDATE',
            entity_type: 'Permission',
            entity_id: id,
            details: { changes: data }
        });
        logger_1.default.info(`Permission updated: ${permission.id}`);
        return permission;
    }
    /**
     * Delete a permission
     */
    async delete(id, userId) {
        const permission = await permission_model_1.default.findById(id);
        if (!permission) {
            throw new Error('Permission not found');
        }
        await permission_model_1.default.delete(id);
        await actionLog_model_1.default.create({
            user_id: userId,
            action_type: 'DELETE',
            entity_type: 'Permission',
            entity_id: id,
            details: { module_id: permission.module_id, action: permission.action }
        });
        logger_1.default.info(`Permission deleted: ${permission.action} for module ${permission.module_id}`);
    }
    /**
     * Toggle permission active status
     */
    async toggleActive(id, userId) {
        const permission = await permission_model_1.default.findById(id);
        if (!permission) {
            throw new Error('Permission not found');
        }
        const updated = await permission_model_1.default.toggleActive(id);
        await actionLog_model_1.default.create({
            user_id: userId,
            action_type: 'UPDATE',
            entity_type: 'Permission',
            entity_id: id,
            details: { is_active: updated.is_active }
        });
        logger_1.default.info(`Permission ${updated.is_active ? 'activated' : 'deactivated'}: ${permission.id}`);
        return updated;
    }
    /**
     * Bulk create permissions for a module
     */
    async bulkCreateForModule(moduleId, actions, userId) {
        const module = await module_model_1.default.findById(moduleId);
        if (!module) {
            throw new Error('Module not found');
        }
        const permissions = await permission_model_1.default.bulkCreateForModule(moduleId, actions);
        if (permissions.length > 0) {
            await actionLog_model_1.default.create({
                user_id: userId,
                action_type: 'CREATE',
                entity_type: 'Permission',
                entity_id: moduleId,
                details: { module_code: module.code, actions: actions, count: permissions.length }
            });
            logger_1.default.info(`Bulk permissions created for module ${module.code}: ${actions.join(', ')}`);
        }
        return permissions;
    }
    /**
     * Get permissions grouped by module for display
     */
    async getPermissionsGroupedByModule(includeInactive = false) {
        const permissions = await this.findAllWithModules(includeInactive);
        const grouped = new Map();
        permissions.forEach(perm => {
            const key = perm.module_code;
            if (!grouped.has(key)) {
                grouped.set(key, []);
            }
            grouped.get(key).push(perm);
        });
        return grouped;
    }
}
exports.default = new PermissionService();
