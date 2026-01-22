import RolePermissionModel, { 
  IRolePermission, 
  ICreateRolePermission, 
  IRolePermissionWithDetails,
  IRolePermissionGrouped 
} from '../models/rolePermission.model';
import RoleModel from '../models/role.model';
import PermissionModel, { PermissionAction } from '../models/permission.model';
import ActionLogModel from '../models/actionLog.model';
import logger from '../utils/logger';

export interface IUserPermissionContext {
  userId: number;
  roleId: number;
  roleName: string;
  branchId: number | null;
  permissions: Map<string, { actions: Set<PermissionAction>; branchLevelAccess: boolean }>;
}

class RolePermissionService {
  // Cache for role permissions (in production, consider Redis)
  private permissionCache: Map<number, IRolePermissionGrouped[]> = new Map();
  private cacheTimeout: Map<number, NodeJS.Timeout> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Get all permissions for a role
   */
  async findByRoleId(roleId: number): Promise<IRolePermission[]> {
    return await RolePermissionModel.findByRoleId(roleId);
  }

  /**
   * Get all permissions for a role with details
   */
  async findByRoleIdWithDetails(roleId: number): Promise<IRolePermissionWithDetails[]> {
    return await RolePermissionModel.findByRoleIdWithDetails(roleId);
  }

  /**
   * Get permissions grouped by module for a role
   */
  async getPermissionsGroupedByModule(roleId: number): Promise<IRolePermissionGrouped[]> {
    // Check cache first
    if (this.permissionCache.has(roleId)) {
      return this.permissionCache.get(roleId)!;
    }

    const grouped = await RolePermissionModel.getPermissionsGroupedByModule(roleId);
    
    // Cache the result
    this.cachePermissions(roleId, grouped);
    
    return grouped;
  }

  /**
   * Check if a role has a specific permission
   */
  async hasPermission(roleId: number, moduleCode: string, action: PermissionAction): Promise<{ hasAccess: boolean; branchLevelAccess: boolean }> {
    return await RolePermissionModel.hasPermission(roleId, moduleCode, action);
  }

  /**
   * Assign a single permission to a role
   */
  async assignPermission(data: ICreateRolePermission, userId: number): Promise<IRolePermission> {
    // Validate role exists
    const role = await RoleModel.findById(data.role_id);
    if (!role) {
      throw new Error('Role not found');
    }

    // Validate permission exists
    const permission = await PermissionModel.findById(data.permission_id);
    if (!permission) {
      throw new Error('Permission not found');
    }

    // Check if already assigned
    const existing = await RolePermissionModel.findByRoleAndPermission(data.role_id, data.permission_id);
    if (existing) {
      // Update existing if branch_level_access differs
      if (data.branch_level_access !== undefined && data.branch_level_access !== existing.branch_level_access) {
        const updated = await RolePermissionModel.update(existing.id, { branch_level_access: data.branch_level_access });
        this.invalidateCache(data.role_id);
        return updated;
      }
      return existing;
    }

    const rolePermission = await RolePermissionModel.create(data);

    await ActionLogModel.create({
      user_id: userId,
      action_type: 'CREATE',
      entity_type: 'RolePermission',
      entity_id: rolePermission.id,
      details: { role_id: data.role_id, permission_id: data.permission_id, branch_level_access: data.branch_level_access }
    });

    this.invalidateCache(data.role_id);
    logger.info(`Permission ${data.permission_id} assigned to role ${role.name}`);
    return rolePermission;
  }

  /**
   * Remove a permission from a role
   */
  async removePermission(roleId: number, permissionId: number, userId: number): Promise<void> {
    const existing = await RolePermissionModel.findByRoleAndPermission(roleId, permissionId);
    if (!existing) {
      throw new Error('Role permission not found');
    }

    await RolePermissionModel.delete(existing.id);

    await ActionLogModel.create({
      user_id: userId,
      action_type: 'DELETE',
      entity_type: 'RolePermission',
      entity_id: existing.id,
      details: { role_id: roleId, permission_id: permissionId }
    });

    this.invalidateCache(roleId);
    logger.info(`Permission ${permissionId} removed from role ${roleId}`);
  }

  /**
   * Bulk assign permissions to a role (replaces existing)
   */
  async bulkAssign(
    roleId: number, 
    permissionConfigs: { permission_id: number; branch_level_access: boolean }[], 
    userId: number
  ): Promise<IRolePermission[]> {
    // Validate role exists
    const role = await RoleModel.findById(roleId);
    if (!role) {
      throw new Error('Role not found');
    }

    // Prevent modifying Admin role's core permissions (optional security measure)
    // Uncomment below to enable
    // if (role.name === 'Admin') {
    //   throw new Error('Cannot modify Admin role permissions');
    // }

    const rolePermissions = await RolePermissionModel.bulkAssign(roleId, permissionConfigs);

    await ActionLogModel.create({
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
    logger.info(`Bulk permissions assigned to role ${role.name}: ${permissionConfigs.length} permissions`);
    return rolePermissions;
  }

  /**
   * Clone permissions from one role to another
   */
  async clonePermissions(fromRoleId: number, toRoleId: number, userId: number): Promise<IRolePermission[]> {
    const fromRole = await RoleModel.findById(fromRoleId);
    const toRole = await RoleModel.findById(toRoleId);

    if (!fromRole || !toRole) {
      throw new Error('Source or target role not found');
    }

    const cloned = await RolePermissionModel.clonePermissions(fromRoleId, toRoleId);

    await ActionLogModel.create({
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
    logger.info(`Permissions cloned from ${fromRole.name} to ${toRole.name}`);
    return cloned;
  }

  /**
   * Get accessible routes for a role
   */
  async getAccessibleRoutes(roleId: number): Promise<{ route: string; actions: PermissionAction[] }[]> {
    return await RolePermissionModel.getAccessibleRoutes(roleId);
  }

  /**
   * Build user permission context for middleware
   */
  async buildUserPermissionContext(userId: number, roleId: number, roleName: string, branchId: number | null): Promise<IUserPermissionContext> {
    const permissions = await this.getPermissionsGroupedByModule(roleId);
    
    const permissionMap = new Map<string, { actions: Set<PermissionAction>; branchLevelAccess: boolean }>();
    
    permissions.forEach(module => {
      const actions = new Set<PermissionAction>();
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
  private cachePermissions(roleId: number, permissions: IRolePermissionGrouped[]): void {
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
  private invalidateCache(roleId: number): void {
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
  clearAllCaches(): void {
    this.permissionCache.clear();
    this.cacheTimeout.forEach(timeout => clearTimeout(timeout));
    this.cacheTimeout.clear();
  }
}

export default new RolePermissionService();
