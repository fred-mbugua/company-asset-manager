import { Router } from 'express';
import PermissionController from '../controllers/permission.controller';
import { authorize } from '../middlewares/auth.middleware';
import asyncHandler from 'express-async-handler';

const router = Router();

// Note: Authentication is handled at the main router level

// ==================== MODULE ROUTES ====================

// Get all modules
router.get(
  '/modules',
  asyncHandler(PermissionController.getAllModules)
);

// Get a single module
router.get(
  '/modules/:id',
  asyncHandler(PermissionController.getModuleById)
);

// Create a new module
router.post(
  '/modules',
  authorize(['Admin']),
  asyncHandler(PermissionController.createModule)
);

// Update a module
router.put(
  '/modules/:id',
  authorize(['Admin']),
  asyncHandler(PermissionController.updateModule)
);

// Delete a module
router.delete(
  '/modules/:id',
  authorize(['Admin']),
  asyncHandler(PermissionController.deleteModule)
);

// Toggle module active status
router.patch(
  '/modules/:id/toggle',
  authorize(['Admin']),
  asyncHandler(PermissionController.toggleModuleActive)
);

// ==================== PERMISSION ROUTES ====================

// Get all permissions
router.get(
  '/',
  asyncHandler(PermissionController.getAllPermissions)
);

// Get permissions for a module
router.get(
  '/by-module/:moduleId',
  asyncHandler(PermissionController.getPermissionsByModule)
);

// Create a new permission
router.post(
  '/',
  authorize(['Admin']),
  asyncHandler(PermissionController.createPermission)
);

// Bulk create permissions for a module
router.post(
  '/bulk/:moduleId',
  authorize(['Admin']),
  asyncHandler(PermissionController.bulkCreatePermissions)
);

// Toggle permission active status
router.patch(
  '/:id/toggle',
  authorize(['Admin']),
  asyncHandler(PermissionController.togglePermissionActive)
);

// ==================== ROLE PERMISSION ROUTES ====================

// Get current user's permissions
router.get(
  '/my-permissions',
  asyncHandler(PermissionController.getCurrentUserPermissions)
);

// Get all permissions for a role
router.get(
  '/roles/:roleId',
  asyncHandler(PermissionController.getRolePermissions)
);

// Check if role has specific permission
router.get(
  '/roles/:roleId/check',
  asyncHandler(PermissionController.checkRolePermission)
);

// Get accessible routes for a role
router.get(
  '/roles/:roleId/routes',
  asyncHandler(PermissionController.getRoleAccessibleRoutes)
);

// Assign a permission to a role
router.post(
  '/roles/:roleId',
  authorize(['Admin']),
  asyncHandler(PermissionController.assignRolePermission)
);

// Bulk assign permissions to a role
router.put(
  '/roles/:roleId/bulk',
  authorize(['Admin']),
  asyncHandler(PermissionController.bulkAssignRolePermissions)
);

// Clone permissions from one role to another
router.post(
  '/roles/:roleId/clone',
  authorize(['Admin']),
  asyncHandler(PermissionController.cloneRolePermissions)
);

// Remove a permission from a role
router.delete(
  '/roles/:roleId/:permissionId',
  authorize(['Admin']),
  asyncHandler(PermissionController.removeRolePermission)
);

// ==================== COMPANY ACCESS ROUTES ====================

// Get company access for a role
router.get(
  '/roles/:roleId/company-access',
  asyncHandler(PermissionController.getRoleCompanyAccess)
);

// Update company access for a role
router.put(
  '/roles/:roleId/company-access',
  authorize(['Admin']),
  asyncHandler(PermissionController.updateRoleCompanyAccess)
);

export default router;
