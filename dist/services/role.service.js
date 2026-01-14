"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const role_model_1 = __importDefault(require("../models/role.model"));
const actionLog_model_1 = __importDefault(require("../models/actionLog.model"));
class RoleService {
    /**
     * Get all roles
     */
    async findAll(includeInactive = false) {
        return await role_model_1.default.findAll(includeInactive);
    }
    /**
     * Get a single role by ID
     */
    async findById(id) {
        return await role_model_1.default.findById(id);
    }
    /**
     * Get a role by name
     */
    async findByName(name) {
        return await role_model_1.default.findByName(name);
    }
    /**
     * Create a new role
     */
    async create(data, userId) {
        // Check if role with same name exists
        const existing = await role_model_1.default.findByName(data.name);
        if (existing) {
            throw new Error('A role with this name already exists');
        }
        const role = await role_model_1.default.create(data);
        await actionLog_model_1.default.create({
            user_id: userId,
            action_type: 'CREATE',
            entity_type: 'Role',
            entity_id: role.id,
            details: { role_name: role.name }
        });
        return role;
    }
    /**
     * Update a role
     */
    async update(id, data, userId) {
        const existing = await role_model_1.default.findById(id);
        if (!existing) {
            throw new Error('Role not found');
        }
        // Check if trying to rename to an existing name
        if (data.name && data.name !== existing.name) {
            const duplicate = await role_model_1.default.findByName(data.name);
            if (duplicate) {
                throw new Error('A role with this name already exists');
            }
        }
        const role = await role_model_1.default.update(id, data);
        await actionLog_model_1.default.create({
            user_id: userId,
            action_type: 'UPDATE',
            entity_type: 'Role',
            entity_id: id,
            details: { role_name: role.name, changes: data }
        });
        return role;
    }
    /**
     * Delete a role
     */
    async delete(id, userId) {
        const role = await role_model_1.default.findById(id);
        if (!role) {
            throw new Error('Role not found');
        }
        // Check if role is in use
        const userCount = await role_model_1.default.countUsersWithRole(id);
        if (userCount > 0) {
            throw new Error(`Cannot delete role. It is assigned to ${userCount} user(s).`);
        }
        // Prevent deleting core roles
        const coreRoles = ['Admin', 'Standard User'];
        if (coreRoles.includes(role.name)) {
            throw new Error('Cannot delete core system role');
        }
        await role_model_1.default.delete(id);
        await actionLog_model_1.default.create({
            user_id: userId,
            action_type: 'DELETE',
            entity_type: 'Role',
            entity_id: id,
            details: { role_name: role.name }
        });
    }
    /**
     * Toggle role active status
     */
    async toggleActive(id, userId) {
        const role = await role_model_1.default.findById(id);
        if (!role) {
            throw new Error('Role not found');
        }
        // Prevent deactivating core roles
        const coreRoles = ['Admin', 'Standard User'];
        if (coreRoles.includes(role.name) && role.is_active) {
            throw new Error('Cannot deactivate core system role');
        }
        const updated = await role_model_1.default.toggleActive(id);
        await actionLog_model_1.default.create({
            user_id: userId,
            action_type: 'UPDATE',
            entity_type: 'Role',
            entity_id: id,
            details: { role_name: updated.name, is_active: updated.is_active }
        });
        return updated;
    }
    /**
     * Get user count for a role
     */
    async getUserCount(roleId) {
        return await role_model_1.default.countUsersWithRole(roleId);
    }
}
exports.default = new RoleService();
