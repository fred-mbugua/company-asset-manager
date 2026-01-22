"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const module_model_1 = __importDefault(require("../models/module.model"));
const actionLog_model_1 = __importDefault(require("../models/actionLog.model"));
const logger_1 = __importDefault(require("../utils/logger"));
class ModuleService {
    /**
     * Get all modules (flat list)
     */
    async findAll(includeInactive = false) {
        return await module_model_1.default.findAll(includeInactive);
    }
    /**
     * Get all modules in hierarchy
     */
    async findAllHierarchy(includeInactive = false) {
        return await module_model_1.default.findAllHierarchy(includeInactive);
    }
    /**
     * Get parent modules only
     */
    async findParentModules(includeInactive = false) {
        return await module_model_1.default.findParentModules(includeInactive);
    }
    /**
     * Get module by ID
     */
    async findById(id) {
        return await module_model_1.default.findById(id);
    }
    /**
     * Get module by code
     */
    async findByCode(code) {
        return await module_model_1.default.findByCode(code);
    }
    /**
     * Get child modules for a parent
     */
    async findByParentId(parentId, includeInactive = false) {
        return await module_model_1.default.findByParentId(parentId, includeInactive);
    }
    /**
     * Create a new module
     */
    async create(data, userId) {
        // Check if module with same code exists
        const existing = await module_model_1.default.findByCode(data.code);
        if (existing) {
            throw new Error('A module with this code already exists');
        }
        // Validate parent if specified
        if (data.parent_id) {
            const parent = await module_model_1.default.findById(data.parent_id);
            if (!parent) {
                throw new Error('Parent module not found');
            }
        }
        const module = await module_model_1.default.create(data);
        await actionLog_model_1.default.create({
            user_id: userId,
            action_type: 'CREATE',
            entity_type: 'Module',
            entity_id: module.id,
            details: { module_name: module.name, module_code: module.code }
        });
        logger_1.default.info(`Module created: ${module.name} (${module.code})`);
        return module;
    }
    /**
     * Update a module
     */
    async update(id, data, userId) {
        const existing = await module_model_1.default.findById(id);
        if (!existing) {
            throw new Error('Module not found');
        }
        // Check if trying to change code to an existing one
        if (data.code && data.code !== existing.code) {
            const duplicate = await module_model_1.default.findByCode(data.code);
            if (duplicate) {
                throw new Error('A module with this code already exists');
            }
        }
        // Prevent circular parent reference
        if (data.parent_id && data.parent_id === id) {
            throw new Error('A module cannot be its own parent');
        }
        const module = await module_model_1.default.update(id, data);
        await actionLog_model_1.default.create({
            user_id: userId,
            action_type: 'UPDATE',
            entity_type: 'Module',
            entity_id: id,
            details: { module_name: module.name, changes: data }
        });
        logger_1.default.info(`Module updated: ${module.name} (${module.code})`);
        return module;
    }
    /**
     * Delete a module
     */
    async delete(id, userId) {
        const module = await module_model_1.default.findById(id);
        if (!module) {
            throw new Error('Module not found');
        }
        // Check if module has children
        const hasChildren = await module_model_1.default.hasChildren(id);
        if (hasChildren) {
            throw new Error('Cannot delete module with child modules. Delete children first.');
        }
        await module_model_1.default.delete(id);
        await actionLog_model_1.default.create({
            user_id: userId,
            action_type: 'DELETE',
            entity_type: 'Module',
            entity_id: id,
            details: { module_name: module.name, module_code: module.code }
        });
        logger_1.default.info(`Module deleted: ${module.name} (${module.code})`);
    }
    /**
     * Toggle module active status
     */
    async toggleActive(id, userId) {
        const module = await module_model_1.default.findById(id);
        if (!module) {
            throw new Error('Module not found');
        }
        const updated = await module_model_1.default.toggleActive(id);
        await actionLog_model_1.default.create({
            user_id: userId,
            action_type: 'UPDATE',
            entity_type: 'Module',
            entity_id: id,
            details: { module_name: updated.name, is_active: updated.is_active }
        });
        logger_1.default.info(`Module ${updated.is_active ? 'activated' : 'deactivated'}: ${updated.name}`);
        return updated;
    }
}
exports.default = new ModuleService();
