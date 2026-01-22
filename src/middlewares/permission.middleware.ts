import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import RolePermissionService from '../services/rolePermission.service';
import { PermissionAction } from '../models/permission.model';
import logger from '../utils/logger';

/**
 * Permission context stored in request after permission check
 */
export interface PermissionContext {
  hasAccess: boolean;
  branchLevelAccess: boolean;
  userBranchId: number | null;
}

/**
 * Extended request with permission context
 */
export interface PermissionRequest extends AuthenticatedRequest {
  permissionContext?: PermissionContext;
}

/**
 * Module permission mapping for routes
 * Maps route patterns to module codes
 */
const ROUTE_MODULE_MAP: Record<string, string> = {
  // Dashboard
  '/dashboard': 'DASHBOARD',
  '/api/dashboard': 'DASHBOARD',
  
  // Assets
  '/assets/create': 'ASSETS_CREATE',
  '/assets/view': 'ASSETS_VIEW',
  '/api/assets': 'ASSETS',
  
  // Assignments
  '/assets/assign': 'ASSIGNMENTS_ASSIGN',
  '/api/assignments': 'ASSIGNMENTS',
  
  // Expenses
  '/expenses/create': 'EXPENSES_CREATE',
  '/api/expenses': 'EXPENSES',
  
  // Repair Requests
  '/repair-requests': 'REPAIR_REQUESTS_LIST',
  '/repair-requests/new': 'REPAIR_REQUESTS_NEW',
  '/repair-requests/workflow': 'REPAIR_REQUESTS_WORKFLOW',
  '/api/repair-requests': 'REPAIR_REQUESTS',
  
  // Reports
  '/reports/assets': 'REPORTS_ASSETS',
  '/reports/expenses': 'REPORTS_EXPENSES',
  '/reports/assignments': 'REPORTS_ASSIGNMENTS',
  '/reports/repair-summary': 'REPORTS_REPAIR_SUMMARY',
  '/reports/action-logs': 'REPORTS_ACTION_LOGS',
  '/api/reports': 'REPORTS',
  
  // Administration
  '/users/manage': 'ADMIN_USERS',
  '/users/import-history': 'ADMIN_USERS',
  '/roles/manage': 'ADMIN_ROLES',
  '/permissions/manage': 'ADMIN_PERMISSIONS',
  '/branches/manage': 'ADMIN_BRANCHES',
  '/departments/manage': 'ADMIN_DEPARTMENTS',
  '/asset-statuses/manage': 'ADMIN_ASSET_STATUSES',
  '/asset-types/manage': 'ADMIN_ASSET_TYPES',
  '/expense-types/manage': 'ADMIN_EXPENSE_TYPES',
  '/repair-request-types/manage': 'ADMIN_REPAIR_TYPES',
  '/repair-request-statuses/manage': 'ADMIN_REPAIR_STATUSES',
  '/repair-request-priorities/manage': 'ADMIN_REPAIR_PRIORITIES',
  '/api/users': 'ADMIN_USERS',
  '/api/roles': 'ADMIN_ROLES',
  '/api/permissions': 'ADMIN_PERMISSIONS',
  '/api/branches': 'ADMIN_BRANCHES',
  '/api/departments': 'ADMIN_DEPARTMENTS',
  
  // Settings
  '/settings/configuration': 'SETTINGS_SYSTEM',
  '/api/system-config': 'SETTINGS_SYSTEM',
};

/**
 * HTTP method to permission action mapping
 */
const METHOD_ACTION_MAP: Record<string, PermissionAction> = {
  'GET': 'read',
  'HEAD': 'read',
  'POST': 'create',
  'PUT': 'update',
  'PATCH': 'update',
  'DELETE': 'delete'
};

/**
 * Get the module code for a given route
 */
function getModuleCodeForRoute(path: string): string | null {
  // Direct match
  if (ROUTE_MODULE_MAP[path]) {
    return ROUTE_MODULE_MAP[path];
  }
  
  // Try matching route patterns
  for (const [pattern, moduleCode] of Object.entries(ROUTE_MODULE_MAP)) {
    // Handle API routes with IDs (e.g., /api/assets/123)
    if (path.startsWith(pattern)) {
      return moduleCode;
    }
    
    // Handle parameterized routes
    const regexPattern = pattern.replace(/:[^/]+/g, '[^/]+');
    const regex = new RegExp(`^${regexPattern}$`);
    if (regex.test(path)) {
      return moduleCode;
    }
  }
  
  return null;
}

/**
 * Middleware to check if user has permission for a specific module and action
 * @param moduleCode - The module code to check permission for
 * @param action - The action to check (read, create, update, delete)
 */
export const checkPermission = (moduleCode: string, action: PermissionAction) => {
  return async (req: PermissionRequest, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      
      if (!user || !user.role_id) {
        if (req.originalUrl.startsWith('/api')) {
          return res.status(401).json({ 
            success: false, 
            message: 'User not authenticated' 
          });
        }
        return res.redirect('/login');
      }

      // Admin bypass - Admins have all permissions
      if (user.role === 'Admin') {
        req.permissionContext = {
          hasAccess: true,
          branchLevelAccess: false,
          userBranchId: user.branch_id || null
        };
        return next();
      }

      const result = await RolePermissionService.hasPermission(user.role_id, moduleCode, action);
      
      if (!result.hasAccess) {
        logger.warn(`Permission denied: User ${user.id} attempted ${action} on ${moduleCode}`);
        
        if (req.originalUrl.startsWith('/api')) {
          return res.status(403).json({ 
            success: false, 
            message: 'You do not have permission to perform this action' 
          });
        }
        return res.status(403).render('403', { 
          message: 'You do not have permission to access this page' 
        });
      }

      // Store permission context for use in controllers
      req.permissionContext = {
        hasAccess: true,
        branchLevelAccess: result.branchLevelAccess,
        userBranchId: user.branch_id || null
      };

      next();
    } catch (error) {
      logger.error('Error checking permission:', error);
      if (req.originalUrl.startsWith('/api')) {
        return res.status(500).json({ 
          success: false, 
          message: 'Error checking permissions' 
        });
      }
      return res.status(500).render('500', { message: 'Internal server error' });
    }
  };
};

/**
 * Middleware to automatically check permissions based on route and HTTP method
 * Use this for routes that follow standard patterns
 */
export const autoCheckPermission = async (req: PermissionRequest, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    
    if (!user || !user.role_id) {
      if (req.originalUrl.startsWith('/api')) {
        return res.status(401).json({ 
          success: false, 
          message: 'User not authenticated' 
        });
      }
      return res.redirect('/login');
    }

    // Admin bypass
    if (user.role === 'Admin') {
      req.permissionContext = {
        hasAccess: true,
        branchLevelAccess: false,
        userBranchId: user.branch_id || null
      };
      return next();
    }

    const moduleCode = getModuleCodeForRoute(req.path);
    
    if (!moduleCode) {
      // Route not mapped - allow access (fallback to role-based auth)
      req.permissionContext = {
        hasAccess: true,
        branchLevelAccess: false,
        userBranchId: user.branch_id || null
      };
      return next();
    }

    const action = METHOD_ACTION_MAP[req.method] || 'read';
    const result = await RolePermissionService.hasPermission(user.role_id, moduleCode, action);
    
    if (!result.hasAccess) {
      logger.warn(`Permission denied: User ${user.id} attempted ${action} on ${moduleCode}`);
      
      if (req.originalUrl.startsWith('/api')) {
        return res.status(403).json({ 
          success: false, 
          message: 'You do not have permission to perform this action' 
        });
      }
      return res.status(403).render('403', { 
        message: 'You do not have permission to access this page' 
      });
    }

    req.permissionContext = {
      hasAccess: true,
      branchLevelAccess: result.branchLevelAccess,
      userBranchId: user.branch_id || null
    };

    next();
  } catch (error) {
    logger.error('Error in auto permission check:', error);
    next(); // Continue on error to avoid blocking
  }
};

/**
 * Middleware to check multiple permissions (ANY - user needs at least one)
 */
export const checkAnyPermission = (permissions: { moduleCode: string; action: PermissionAction }[]) => {
  return async (req: PermissionRequest, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      
      if (!user || !user.role_id) {
        if (req.originalUrl.startsWith('/api')) {
          return res.status(401).json({ success: false, message: 'User not authenticated' });
        }
        return res.redirect('/login');
      }

      // Admin bypass
      if (user.role === 'Admin') {
        req.permissionContext = {
          hasAccess: true,
          branchLevelAccess: false,
          userBranchId: user.branch_id || null
        };
        return next();
      }

      let hasAnyPermission = false;
      let branchLevelAccess = false;

      for (const perm of permissions) {
        const result = await RolePermissionService.hasPermission(user.role_id, perm.moduleCode, perm.action);
        if (result.hasAccess) {
          hasAnyPermission = true;
          branchLevelAccess = result.branchLevelAccess;
          break;
        }
      }

      if (!hasAnyPermission) {
        if (req.originalUrl.startsWith('/api')) {
          return res.status(403).json({ 
            success: false, 
            message: 'You do not have permission to perform this action' 
          });
        }
        return res.status(403).render('403', { 
          message: 'You do not have permission to access this page' 
        });
      }

      req.permissionContext = {
        hasAccess: true,
        branchLevelAccess,
        userBranchId: user.branch_id || null
      };

      next();
    } catch (error) {
      logger.error('Error checking permissions:', error);
      if (req.originalUrl.startsWith('/api')) {
        return res.status(500).json({ success: false, message: 'Error checking permissions' });
      }
      return res.status(500).render('500', { message: 'Internal server error' });
    }
  };
};

/**
 * Middleware to check multiple permissions (ALL - user needs all)
 */
export const checkAllPermissions = (permissions: { moduleCode: string; action: PermissionAction }[]) => {
  return async (req: PermissionRequest, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      
      if (!user || !user.role_id) {
        if (req.originalUrl.startsWith('/api')) {
          return res.status(401).json({ success: false, message: 'User not authenticated' });
        }
        return res.redirect('/login');
      }

      // Admin bypass
      if (user.role === 'Admin') {
        req.permissionContext = {
          hasAccess: true,
          branchLevelAccess: false,
          userBranchId: user.branch_id || null
        };
        return next();
      }

      let hasAllPermissions = true;
      let branchLevelAccess = false;

      for (const perm of permissions) {
        const result = await RolePermissionService.hasPermission(user.role_id, perm.moduleCode, perm.action);
        if (!result.hasAccess) {
          hasAllPermissions = false;
          break;
        }
        if (result.branchLevelAccess) {
          branchLevelAccess = true;
        }
      }

      if (!hasAllPermissions) {
        if (req.originalUrl.startsWith('/api')) {
          return res.status(403).json({ 
            success: false, 
            message: 'You do not have permission to perform this action' 
          });
        }
        return res.status(403).render('403', { 
          message: 'You do not have permission to access this page' 
        });
      }

      req.permissionContext = {
        hasAccess: true,
        branchLevelAccess,
        userBranchId: user.branch_id || null
      };

      next();
    } catch (error) {
      logger.error('Error checking permissions:', error);
      if (req.originalUrl.startsWith('/api')) {
        return res.status(500).json({ success: false, message: 'Error checking permissions' });
      }
      return res.status(500).render('500', { message: 'Internal server error' });
    }
  };
};

/**
 * Helper to apply branch-level filtering to queries
 * Use in controllers when branchLevelAccess is true
 */
export function applyBranchFilter<T extends object>(
  query: T, 
  permissionContext: PermissionContext | undefined,
  branchField: string = 'branch_id'
): T & { [key: string]: any } {
  if (!permissionContext || !permissionContext.branchLevelAccess || !permissionContext.userBranchId) {
    return query;
  }
  
  return {
    ...query,
    [branchField]: permissionContext.userBranchId
  };
}

/**
 * Get branch filter SQL condition
 */
export function getBranchFilterSQL(
  permissionContext: PermissionContext | undefined,
  tableAlias: string = '',
  branchField: string = 'branch_id'
): { condition: string; value: number | null } {
  if (!permissionContext || !permissionContext.branchLevelAccess || !permissionContext.userBranchId) {
    return { condition: '', value: null };
  }
  
  const field = tableAlias ? `${tableAlias}.${branchField}` : branchField;
  return { 
    condition: ` AND ${field} = $BRANCH_ID`,
    value: permissionContext.userBranchId 
  };
}
