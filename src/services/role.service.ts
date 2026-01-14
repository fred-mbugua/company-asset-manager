import RoleModel, { IRole, ICreateRole } from '../models/role.model';
import ActionLogModel from '../models/actionLog.model';
import logger from '../utils/logger';

class RoleService {
    /**
     * Get all roles
     */
    async findAll(includeInactive: boolean = false): Promise<IRole[]> {
        return await RoleModel.findAll(includeInactive);
    }

    /**
     * Get a single role by ID
     */
    async findById(id: number): Promise<IRole | null> {
        return await RoleModel.findById(id);
    }

    /**
     * Get a role by name
     */
    async findByName(name: string): Promise<IRole | null> {
        return await RoleModel.findByName(name);
    }

    /**
     * Create a new role
     */
    async create(data: ICreateRole, userId: number): Promise<IRole> {
        // Check if role with same name exists
        const existing = await RoleModel.findByName(data.name);
        if (existing) {
            throw new Error('A role with this name already exists');
        }

        const role = await RoleModel.create(data);

        await ActionLogModel.create({
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
    async update(id: number, data: Partial<IRole>, userId: number): Promise<IRole> {
        const existing = await RoleModel.findById(id);
        if (!existing) {
            throw new Error('Role not found');
        }

        // Check if trying to rename to an existing name
        if (data.name && data.name !== existing.name) {
            const duplicate = await RoleModel.findByName(data.name);
            if (duplicate) {
                throw new Error('A role with this name already exists');
            }
        }

        const role = await RoleModel.update(id, data);

        await ActionLogModel.create({
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
    async delete(id: number, userId: number): Promise<void> {
        const role = await RoleModel.findById(id);
        if (!role) {
            throw new Error('Role not found');
        }

        // Check if role is in use
        const userCount = await RoleModel.countUsersWithRole(id);
        if (userCount > 0) {
            throw new Error(`Cannot delete role. It is assigned to ${userCount} user(s).`);
        }

        // Prevent deleting core roles
        const coreRoles = ['Admin', 'Standard User'];
        if (coreRoles.includes(role.name)) {
            throw new Error('Cannot delete core system role');
        }

        await RoleModel.delete(id);

        await ActionLogModel.create({
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
    async toggleActive(id: number, userId: number): Promise<IRole> {
        const role = await RoleModel.findById(id);
        if (!role) {
            throw new Error('Role not found');
        }

        // Prevent deactivating core roles
        const coreRoles = ['Admin', 'Standard User'];
        if (coreRoles.includes(role.name) && role.is_active) {
            throw new Error('Cannot deactivate core system role');
        }

        const updated = await RoleModel.toggleActive(id);

        await ActionLogModel.create({
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
    async getUserCount(roleId: number): Promise<number> {
        return await RoleModel.countUsersWithRole(roleId);
    }
}

export default new RoleService();
