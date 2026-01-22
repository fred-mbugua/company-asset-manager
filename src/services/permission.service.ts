import PermissionModel, { IPermission, ICreatePermission, PermissionAction, IPermissionWithModule } from '../models/permission.model';
import ModuleModel from '../models/module.model';
import ActionLogModel from '../models/actionLog.model';
import logger from '../utils/logger';

class PermissionService {
  /**
   * Get all permissions
   */
  async findAll(includeInactive: boolean = false): Promise<IPermission[]> {
    return await PermissionModel.findAll(includeInactive);
  }

  /**
   * Get all permissions with module details
   */
  async findAllWithModules(includeInactive: boolean = false): Promise<IPermissionWithModule[]> {
    return await PermissionModel.findAllWithModules(includeInactive);
  }

  /**
   * Get permission by ID
   */
  async findById(id: number): Promise<IPermission | null> {
    return await PermissionModel.findById(id);
  }

  /**
   * Get permissions for a module
   */
  async findByModuleId(moduleId: number, includeInactive: boolean = false): Promise<IPermission[]> {
    return await PermissionModel.findByModuleId(moduleId, includeInactive);
  }

  /**
   * Create a new permission
   */
  async create(data: ICreatePermission, userId: number): Promise<IPermission> {
    // Validate module exists
    const module = await ModuleModel.findById(data.module_id);
    if (!module) {
      throw new Error('Module not found');
    }

    // Check if permission already exists
    const existing = await PermissionModel.findByModuleAndAction(data.module_id, data.action);
    if (existing) {
      throw new Error(`Permission '${data.action}' already exists for this module`);
    }

    const permission = await PermissionModel.create(data);

    await ActionLogModel.create({
      user_id: userId,
      action_type: 'CREATE',
      entity_type: 'Permission',
      entity_id: permission.id,
      details: { module_id: data.module_id, action: data.action }
    });

    logger.info(`Permission created: ${data.action} for module ${module.code}`);
    return permission;
  }

  /**
   * Update a permission
   */
  async update(id: number, data: Partial<IPermission>, userId: number): Promise<IPermission> {
    const existing = await PermissionModel.findById(id);
    if (!existing) {
      throw new Error('Permission not found');
    }

    // If changing module or action, check for duplicates
    if ((data.module_id || data.action) && 
        (data.module_id !== existing.module_id || data.action !== existing.action)) {
      const moduleId = data.module_id || existing.module_id;
      const action = data.action || existing.action;
      const duplicate = await PermissionModel.findByModuleAndAction(moduleId, action);
      if (duplicate && duplicate.id !== id) {
        throw new Error(`Permission '${action}' already exists for this module`);
      }
    }

    const permission = await PermissionModel.update(id, data);

    await ActionLogModel.create({
      user_id: userId,
      action_type: 'UPDATE',
      entity_type: 'Permission',
      entity_id: id,
      details: { changes: data }
    });

    logger.info(`Permission updated: ${permission.id}`);
    return permission;
  }

  /**
   * Delete a permission
   */
  async delete(id: number, userId: number): Promise<void> {
    const permission = await PermissionModel.findById(id);
    if (!permission) {
      throw new Error('Permission not found');
    }

    await PermissionModel.delete(id);

    await ActionLogModel.create({
      user_id: userId,
      action_type: 'DELETE',
      entity_type: 'Permission',
      entity_id: id,
      details: { module_id: permission.module_id, action: permission.action }
    });

    logger.info(`Permission deleted: ${permission.action} for module ${permission.module_id}`);
  }

  /**
   * Toggle permission active status
   */
  async toggleActive(id: number, userId: number): Promise<IPermission> {
    const permission = await PermissionModel.findById(id);
    if (!permission) {
      throw new Error('Permission not found');
    }

    const updated = await PermissionModel.toggleActive(id);

    await ActionLogModel.create({
      user_id: userId,
      action_type: 'UPDATE',
      entity_type: 'Permission',
      entity_id: id,
      details: { is_active: updated.is_active }
    });

    logger.info(`Permission ${updated.is_active ? 'activated' : 'deactivated'}: ${permission.id}`);
    return updated;
  }

  /**
   * Bulk create permissions for a module
   */
  async bulkCreateForModule(moduleId: number, actions: PermissionAction[], userId: number): Promise<IPermission[]> {
    const module = await ModuleModel.findById(moduleId);
    if (!module) {
      throw new Error('Module not found');
    }

    const permissions = await PermissionModel.bulkCreateForModule(moduleId, actions);

    if (permissions.length > 0) {
      await ActionLogModel.create({
        user_id: userId,
        action_type: 'CREATE',
        entity_type: 'Permission',
        entity_id: moduleId,
        details: { module_code: module.code, actions: actions, count: permissions.length }
      });

      logger.info(`Bulk permissions created for module ${module.code}: ${actions.join(', ')}`);
    }

    return permissions;
  }

  /**
   * Get permissions grouped by module for display
   */
  async getPermissionsGroupedByModule(includeInactive: boolean = false): Promise<Map<string, IPermissionWithModule[]>> {
    const permissions = await this.findAllWithModules(includeInactive);
    const grouped = new Map<string, IPermissionWithModule[]>();

    permissions.forEach(perm => {
      const key = perm.module_code;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(perm);
    });

    return grouped;
  }
}

export default new PermissionService();
