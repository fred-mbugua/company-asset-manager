import { Request, Response } from 'express';
import ModuleService from '../services/module.service';
import PermissionService from '../services/permission.service';
import RolePermissionService from '../services/rolePermission.service';
import { successResponse, errorResponse } from '../utils/response';
import logger from '../utils/logger';
import { AuthenticatedRequest } from '../types';

class PermissionController {
  // ==================== MODULES ====================

  /**
   * Get all modules
   */
  async getAllModules(req: Request, res: Response): Promise<void> {
    try {
      const includeInactive = req.query.include_inactive === 'true';
      const hierarchy = req.query.hierarchy === 'true';
      
      const modules = hierarchy 
        ? await ModuleService.findAllHierarchy(includeInactive)
        : await ModuleService.findAll(includeInactive);
      
      successResponse(res, 200, 'Modules retrieved successfully', modules);
    } catch (error: any) {
      logger.error('Error getting modules:', error);
      errorResponse(res, 500, error.message || 'Failed to get modules');
    }
  }

  /**
   * Get a single module
   */
  async getModuleById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const module = await ModuleService.findById(id);
      
      if (!module) {
        errorResponse(res, 404, 'Module not found');
        return;
      }

      // Get child modules
      const children = await ModuleService.findByParentId(id);

      successResponse(res, 200, 'Module retrieved successfully', { ...module, children });
    } catch (error: any) {
      logger.error('Error getting module:', error);
      errorResponse(res, 500, error.message || 'Failed to get module');
    }
  }

  /**
   * Create a new module
   */
  async createModule(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        errorResponse(res, 401, 'User not authenticated');
        return;
      }

      const { name, code, description, parent_id, icon, route, display_order, is_active } = req.body;

      if (!name || !code) {
        errorResponse(res, 400, 'Module name and code are required');
        return;
      }

      const module = await ModuleService.create({
        name, code, description, parent_id, icon, route, display_order, is_active
      }, userId);

      successResponse(res, 201, 'Module created successfully', module);
    } catch (error: any) {
      logger.error('Error creating module:', error);
      errorResponse(res, 400, error.message || 'Failed to create module');
    }
  }

  /**
   * Update a module
   */
  async updateModule(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        errorResponse(res, 401, 'User not authenticated');
        return;
      }

      const id = parseInt(req.params.id);
      const { name, code, description, parent_id, icon, route, display_order, is_active } = req.body;

      const module = await ModuleService.update(id, {
        name, code, description, parent_id, icon, route, display_order, is_active
      }, userId);

      successResponse(res, 200, 'Module updated successfully', module);
    } catch (error: any) {
      logger.error('Error updating module:', error);
      errorResponse(res, 400, error.message || 'Failed to update module');
    }
  }

  /**
   * Delete a module
   */
  async deleteModule(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        errorResponse(res, 401, 'User not authenticated');
        return;
      }

      const id = parseInt(req.params.id);
      await ModuleService.delete(id, userId);

      successResponse(res, 200, 'Module deleted successfully');
    } catch (error: any) {
      logger.error('Error deleting module:', error);
      errorResponse(res, 400, error.message || 'Failed to delete module');
    }
  }

  /**
   * Toggle module active status
   */
  async toggleModuleActive(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        errorResponse(res, 401, 'User not authenticated');
        return;
      }

      const id = parseInt(req.params.id);
      const module = await ModuleService.toggleActive(id, userId);

      successResponse(res, 200, 'Module status toggled successfully', module);
    } catch (error: any) {
      logger.error('Error toggling module status:', error);
      errorResponse(res, 400, error.message || 'Failed to toggle module status');
    }
  }

  // ==================== PERMISSIONS ====================

  /**
   * Get all permissions
   */
  async getAllPermissions(req: Request, res: Response): Promise<void> {
    try {
      const includeInactive = req.query.include_inactive === 'true';
      const withModules = req.query.with_modules !== 'false'; // Default true
      
      const permissions = withModules 
        ? await PermissionService.findAllWithModules(includeInactive)
        : await PermissionService.findAll(includeInactive);
      
      successResponse(res, 200, 'Permissions retrieved successfully', permissions);
    } catch (error: any) {
      logger.error('Error getting permissions:', error);
      // Check if RBAC tables don't exist yet
      if (error?.message?.includes('relation') && error?.message?.includes('does not exist')) {
        errorResponse(res, 503, 'RBAC tables not initialized. Please run the migration script: db_queries/rbac_migration.sql');
        return;
      }
      errorResponse(res, 500, error.message || 'Failed to get permissions');
    }
  }

  /**
   * Get permissions for a module
   */
  async getPermissionsByModule(req: Request, res: Response): Promise<void> {
    try {
      const moduleId = parseInt(req.params.moduleId);
      const includeInactive = req.query.include_inactive === 'true';
      
      const permissions = await PermissionService.findByModuleId(moduleId, includeInactive);
      
      successResponse(res, 200, 'Permissions retrieved successfully', permissions);
    } catch (error: any) {
      logger.error('Error getting permissions:', error);
      errorResponse(res, 500, error.message || 'Failed to get permissions');
    }
  }

  /**
   * Create a new permission
   */
  async createPermission(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        errorResponse(res, 401, 'User not authenticated');
        return;
      }

      const { module_id, action, description, is_active } = req.body;

      if (!module_id || !action) {
        errorResponse(res, 400, 'Module ID and action are required');
        return;
      }

      if (!['read', 'create', 'update', 'delete'].includes(action)) {
        errorResponse(res, 400, 'Invalid action. Must be: read, create, update, or delete');
        return;
      }

      const permission = await PermissionService.create({
        module_id, action, description, is_active
      }, userId);

      successResponse(res, 201, 'Permission created successfully', permission);
    } catch (error: any) {
      logger.error('Error creating permission:', error);
      errorResponse(res, 400, error.message || 'Failed to create permission');
    }
  }

  /**
   * Bulk create permissions for a module
   */
  async bulkCreatePermissions(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        errorResponse(res, 401, 'User not authenticated');
        return;
      }

      const moduleId = parseInt(req.params.moduleId);
      const { actions } = req.body;

      const validActions = ['read', 'create', 'update', 'delete'];
      const actionsToCreate = actions || validActions;

      // Validate actions
      for (const action of actionsToCreate) {
        if (!validActions.includes(action)) {
          errorResponse(res, 400, `Invalid action: ${action}`);
          return;
        }
      }

      const permissions = await PermissionService.bulkCreateForModule(moduleId, actionsToCreate, userId);

      successResponse(res, 201, 'Permissions created successfully', permissions);
    } catch (error: any) {
      logger.error('Error bulk creating permissions:', error);
      errorResponse(res, 400, error.message || 'Failed to create permissions');
    }
  }

  /**
   * Toggle permission active status
   */
  async togglePermissionActive(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        errorResponse(res, 401, 'User not authenticated');
        return;
      }

      const id = parseInt(req.params.id);
      const permission = await PermissionService.toggleActive(id, userId);

      successResponse(res, 200, 'Permission status toggled successfully', permission);
    } catch (error: any) {
      logger.error('Error toggling permission status:', error);
      errorResponse(res, 400, error.message || 'Failed to toggle permission status');
    }
  }

  // ==================== ROLE PERMISSIONS ====================

  /**
   * Get all permissions for a role
   */
  async getRolePermissions(req: Request, res: Response): Promise<void> {
    try {
      const roleId = parseInt(req.params.roleId);
      const grouped = req.query.grouped === 'true';
      
      const permissions = grouped 
        ? await RolePermissionService.getPermissionsGroupedByModule(roleId)
        : await RolePermissionService.findByRoleIdWithDetails(roleId);
      
      successResponse(res, 200, 'Role permissions retrieved successfully', permissions);
    } catch (error: any) {
      logger.error('Error getting role permissions:', error);
      errorResponse(res, 500, error.message || 'Failed to get role permissions');
    }
  }

  /**
   * Check if role has specific permission
   */
  async checkRolePermission(req: Request, res: Response): Promise<void> {
    try {
      const roleId = parseInt(req.params.roleId);
      const { module_code, action } = req.query;

      if (!module_code || !action) {
        errorResponse(res, 400, 'Module code and action are required');
        return;
      }

      const result = await RolePermissionService.hasPermission(
        roleId, 
        module_code as string, 
        action as any
      );

      successResponse(res, 200, 'Permission check completed', result);
    } catch (error: any) {
      logger.error('Error checking permission:', error);
      errorResponse(res, 500, error.message || 'Failed to check permission');
    }
  }

  /**
   * Assign a permission to a role
   */
  async assignRolePermission(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        errorResponse(res, 401, 'User not authenticated');
        return;
      }

      const roleId = parseInt(req.params.roleId);
      const { permission_id, branch_level_access } = req.body;

      if (!permission_id) {
        errorResponse(res, 400, 'Permission ID is required');
        return;
      }

      const rolePermission = await RolePermissionService.assignPermission({
        role_id: roleId,
        permission_id,
        branch_level_access: branch_level_access || false
      }, userId);

      successResponse(res, 201, 'Permission assigned successfully', rolePermission);
    } catch (error: any) {
      logger.error('Error assigning permission:', error);
      errorResponse(res, 400, error.message || 'Failed to assign permission');
    }
  }

  /**
   * Remove a permission from a role
   */
  async removeRolePermission(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        errorResponse(res, 401, 'User not authenticated');
        return;
      }

      const roleId = parseInt(req.params.roleId);
      const permissionId = parseInt(req.params.permissionId);

      await RolePermissionService.removePermission(roleId, permissionId, userId);

      successResponse(res, 200, 'Permission removed successfully');
    } catch (error: any) {
      logger.error('Error removing permission:', error);
      errorResponse(res, 400, error.message || 'Failed to remove permission');
    }
  }

  /**
   * Bulk assign permissions to a role
   * Supports two formats:
   * 1. { permissions: [...] } - replaces all permissions
   * 2. { add: [...], remove: [...], branch_updates: [...] } - incremental updates
   */
  async bulkAssignRolePermissions(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        errorResponse(res, 401, 'User not authenticated');
        return;
      }

      const roleId = parseInt(req.params.roleId);
      const { permissions, add, remove, branch_updates } = req.body;

      // Handle incremental add/remove format
      if (add || remove || branch_updates) {
        const results: any = { added: 0, removed: 0, branch_updated: 0 };

        // Add new permissions
        if (add && Array.isArray(add)) {
          for (const perm of add) {
            try {
              await RolePermissionService.assignPermission(
                {
                  role_id: roleId,
                  permission_id: perm.permission_id,
                  branch_level_access: perm.branch_level_access || false
                },
                userId
              );
              results.added++;
            } catch (e) {
              // Permission may already exist, continue
              logger.warn(`Permission ${perm.permission_id} may already be assigned to role ${roleId}`);
            }
          }
        }

        // Remove permissions
        if (remove && Array.isArray(remove)) {
          for (const permId of remove) {
            try {
              await RolePermissionService.removePermission(roleId, permId, userId);
              results.removed++;
            } catch (e) {
              // Permission may not exist, continue
              logger.warn(`Permission ${permId} may not be assigned to role ${roleId}`);
            }
          }
        }

        // Update branch level access
        if (branch_updates && Array.isArray(branch_updates)) {
          for (const update of branch_updates) {
            try {
              // Update branch level access for permissions with this module code
              await RolePermissionService.updateBranchAccessByModule(roleId, update.moduleCode, update.value);
              results.branch_updated++;
            } catch (e) {
              logger.warn(`Failed to update branch access for ${update.moduleCode}`);
            }
          }
        }

        successResponse(res, 200, 'Permissions updated successfully', results);
        return;
      }

      // Handle full replacement format
      if (!permissions || !Array.isArray(permissions)) {
        errorResponse(res, 400, 'Permissions array is required');
        return;
      }

      // Validate structure
      for (const perm of permissions) {
        if (typeof perm.permission_id !== 'number') {
          errorResponse(res, 400, 'Each permission must have a permission_id (number)');
          return;
        }
      }

      const permissionConfigs = permissions.map((p: any) => ({
        permission_id: p.permission_id,
        branch_level_access: p.branch_level_access || false
      }));

      const rolePermissions = await RolePermissionService.bulkAssign(roleId, permissionConfigs, userId);

      successResponse(res, 200, 'Permissions assigned successfully', {
        count: rolePermissions.length,
        permissions: rolePermissions
      });
    } catch (error: any) {
      logger.error('Error bulk assigning permissions:', error);
      errorResponse(res, 400, error.message || 'Failed to assign permissions');
    }
  }

  /**
   * Clone permissions from one role to another
   */
  async cloneRolePermissions(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        errorResponse(res, 401, 'User not authenticated');
        return;
      }

      const fromRoleId = parseInt(req.params.roleId);
      const { to_role_id } = req.body;

      if (!to_role_id) {
        errorResponse(res, 400, 'Target role ID is required');
        return;
      }

      const cloned = await RolePermissionService.clonePermissions(fromRoleId, to_role_id, userId);

      successResponse(res, 200, 'Permissions cloned successfully', {
        count: cloned.length,
        permissions: cloned
      });
    } catch (error: any) {
      logger.error('Error cloning permissions:', error);
      errorResponse(res, 400, error.message || 'Failed to clone permissions');
    }
  }

  /**
   * Get accessible routes for a role
   */
  async getRoleAccessibleRoutes(req: Request, res: Response): Promise<void> {
    try {
      const roleId = parseInt(req.params.roleId);
      const routes = await RolePermissionService.getAccessibleRoutes(roleId);

      successResponse(res, 200, 'Accessible routes retrieved successfully', routes);
    } catch (error: any) {
      logger.error('Error getting accessible routes:', error);
      errorResponse(res, 500, error.message || 'Failed to get accessible routes');
    }
  }

  /**
   * Get current user's permissions
   */
  async getCurrentUserPermissions(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const roleId = req.user?.role_id;

      if (!userId || !roleId) {
        errorResponse(res, 401, 'User not authenticated');
        return;
      }

      const permissions = await RolePermissionService.getPermissionsGroupedByModule(roleId);

      successResponse(res, 200, 'User permissions retrieved successfully', {
        user_id: userId,
        role_id: roleId,
        permissions
      });
    } catch (error: any) {
      logger.error('Error getting user permissions:', error);
      errorResponse(res, 500, error.message || 'Failed to get user permissions');
    }
  }
}

export default new PermissionController();
