import ModuleModel, { IModule, ICreateModule, IModuleWithChildren } from '../models/module.model';
import ActionLogModel from '../models/actionLog.model';
import logger from '../utils/logger';

class ModuleService {
  /**
   * Get all modules (flat list)
   */
  async findAll(includeInactive: boolean = false): Promise<IModule[]> {
    return await ModuleModel.findAll(includeInactive);
  }

  /**
   * Get all modules in hierarchy
   */
  async findAllHierarchy(includeInactive: boolean = false): Promise<IModuleWithChildren[]> {
    return await ModuleModel.findAllHierarchy(includeInactive);
  }

  /**
   * Get parent modules only
   */
  async findParentModules(includeInactive: boolean = false): Promise<IModule[]> {
    return await ModuleModel.findParentModules(includeInactive);
  }

  /**
   * Get module by ID
   */
  async findById(id: number): Promise<IModule | null> {
    return await ModuleModel.findById(id);
  }

  /**
   * Get module by code
   */
  async findByCode(code: string): Promise<IModule | null> {
    return await ModuleModel.findByCode(code);
  }

  /**
   * Get child modules for a parent
   */
  async findByParentId(parentId: number, includeInactive: boolean = false): Promise<IModule[]> {
    return await ModuleModel.findByParentId(parentId, includeInactive);
  }

  /**
   * Create a new module
   */
  async create(data: ICreateModule, userId: number): Promise<IModule> {
    // Check if module with same code exists
    const existing = await ModuleModel.findByCode(data.code);
    if (existing) {
      throw new Error('A module with this code already exists');
    }

    // Validate parent if specified
    if (data.parent_id) {
      const parent = await ModuleModel.findById(data.parent_id);
      if (!parent) {
        throw new Error('Parent module not found');
      }
    }

    const module = await ModuleModel.create(data);

    await ActionLogModel.create({
      user_id: userId,
      action_type: 'CREATE',
      entity_type: 'Module',
      entity_id: module.id,
      details: { module_name: module.name, module_code: module.code }
    });

    logger.info(`Module created: ${module.name} (${module.code})`);
    return module;
  }

  /**
   * Update a module
   */
  async update(id: number, data: Partial<IModule>, userId: number): Promise<IModule> {
    const existing = await ModuleModel.findById(id);
    if (!existing) {
      throw new Error('Module not found');
    }

    // Check if trying to change code to an existing one
    if (data.code && data.code !== existing.code) {
      const duplicate = await ModuleModel.findByCode(data.code);
      if (duplicate) {
        throw new Error('A module with this code already exists');
      }
    }

    // Prevent circular parent reference
    if (data.parent_id && data.parent_id === id) {
      throw new Error('A module cannot be its own parent');
    }

    const module = await ModuleModel.update(id, data);

    await ActionLogModel.create({
      user_id: userId,
      action_type: 'UPDATE',
      entity_type: 'Module',
      entity_id: id,
      details: { module_name: module.name, changes: data }
    });

    logger.info(`Module updated: ${module.name} (${module.code})`);
    return module;
  }

  /**
   * Delete a module
   */
  async delete(id: number, userId: number): Promise<void> {
    const module = await ModuleModel.findById(id);
    if (!module) {
      throw new Error('Module not found');
    }

    // Check if module has children
    const hasChildren = await ModuleModel.hasChildren(id);
    if (hasChildren) {
      throw new Error('Cannot delete module with child modules. Delete children first.');
    }

    await ModuleModel.delete(id);

    await ActionLogModel.create({
      user_id: userId,
      action_type: 'DELETE',
      entity_type: 'Module',
      entity_id: id,
      details: { module_name: module.name, module_code: module.code }
    });

    logger.info(`Module deleted: ${module.name} (${module.code})`);
  }

  /**
   * Toggle module active status
   */
  async toggleActive(id: number, userId: number): Promise<IModule> {
    const module = await ModuleModel.findById(id);
    if (!module) {
      throw new Error('Module not found');
    }

    const updated = await ModuleModel.toggleActive(id);

    await ActionLogModel.create({
      user_id: userId,
      action_type: 'UPDATE',
      entity_type: 'Module',
      entity_id: id,
      details: { module_name: updated.name, is_active: updated.is_active }
    });

    logger.info(`Module ${updated.is_active ? 'activated' : 'deactivated'}: ${updated.name}`);
    return updated;
  }
}

export default new ModuleService();
