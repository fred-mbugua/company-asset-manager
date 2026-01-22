import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import RolePermissionService from '../services/rolePermission.service';
import logger from '../utils/logger';

/**
 * Middleware to load user permissions and attach to request/locals for use in views
 * This middleware should be applied after authentication
 */
export const loadUserPermissions = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    
    // Skip if no user or if user is Admin (Admin has all permissions)
    if (!user || user.role === 'Admin') {
      res.locals.userPermissions = null;
      return next();
    }

    if (!user.role_id) {
      res.locals.userPermissions = null;
      return next();
    }

    // Load user permissions grouped by module
    const groupedPermissions = await RolePermissionService.getPermissionsGroupedByModule(user.role_id);
    
    // Convert to a Map-like object for easy access in templates
    const permissionMap: Record<string, { actions: string[]; branchLevelAccess: boolean }> = {};
    
    groupedPermissions.forEach(module => {
      const actions: string[] = [];
      let branchLevelAccess = false;
      
      module.actions.forEach(action => {
        if (action.has_permission) {
          actions.push(action.action);
          if (action.branch_level_access) {
            branchLevelAccess = true;
          }
        }
      });
      
      if (actions.length > 0) {
        permissionMap[module.module_code] = { 
          actions,
          branchLevelAccess
        };
      }
    });

    // Attach to response locals for use in views
    res.locals.userPermissions = permissionMap;
    
    // Also attach to request for use in controllers
    (req as any).userPermissions = permissionMap;

    next();
  } catch (error: any) {
    // Check if it's a "relation does not exist" error (tables not created yet)
    if (error?.message?.includes('relation') && error?.message?.includes('does not exist')) {
      logger.warn('RBAC tables not yet created. Run the migration script: db_queries/rbac_migration.sql');
    } else {
      logger.error('Error loading user permissions:', error);
    }
    // Don't block the request if permissions fail to load
    res.locals.userPermissions = null;
    next();
  }
};

/**
 * Helper to check if user has a specific permission
 * Can be used in controllers or views
 */
export function hasModulePermission(
  userPermissions: Record<string, { actions: string[]; branchLevelAccess: boolean }> | null,
  moduleCode: string,
  action: string = 'read'
): boolean {
  if (!userPermissions) return false;
  
  const module = userPermissions[moduleCode];
  if (!module) return false;
  
  return module.actions.includes(action);
}

/**
 * Helper to check if user has branch-level access for a module
 */
export function hasBranchLevelAccess(
  userPermissions: Record<string, { actions: string[]; branchLevelAccess: boolean }> | null,
  moduleCode: string
): boolean {
  if (!userPermissions) return false;
  
  const module = userPermissions[moduleCode];
  if (!module) return false;
  
  return module.branchLevelAccess;
}
