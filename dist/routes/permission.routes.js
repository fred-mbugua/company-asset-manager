"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const permission_controller_1 = __importDefault(require("../controllers/permission.controller"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const router = (0, express_1.Router)();
// Note: Authentication is handled at the main router level
// ==================== MODULE ROUTES ====================
// Get all modules
router.get('/modules', (0, express_async_handler_1.default)(permission_controller_1.default.getAllModules));
// Get a single module
router.get('/modules/:id', (0, express_async_handler_1.default)(permission_controller_1.default.getModuleById));
// Create a new module
router.post('/modules', (0, auth_middleware_1.authorize)(['Admin']), (0, express_async_handler_1.default)(permission_controller_1.default.createModule));
// Update a module
router.put('/modules/:id', (0, auth_middleware_1.authorize)(['Admin']), (0, express_async_handler_1.default)(permission_controller_1.default.updateModule));
// Delete a module
router.delete('/modules/:id', (0, auth_middleware_1.authorize)(['Admin']), (0, express_async_handler_1.default)(permission_controller_1.default.deleteModule));
// Toggle module active status
router.patch('/modules/:id/toggle', (0, auth_middleware_1.authorize)(['Admin']), (0, express_async_handler_1.default)(permission_controller_1.default.toggleModuleActive));
// ==================== PERMISSION ROUTES ====================
// Get all permissions
router.get('/', (0, express_async_handler_1.default)(permission_controller_1.default.getAllPermissions));
// Get permissions for a module
router.get('/by-module/:moduleId', (0, express_async_handler_1.default)(permission_controller_1.default.getPermissionsByModule));
// Create a new permission
router.post('/', (0, auth_middleware_1.authorize)(['Admin']), (0, express_async_handler_1.default)(permission_controller_1.default.createPermission));
// Bulk create permissions for a module
router.post('/bulk/:moduleId', (0, auth_middleware_1.authorize)(['Admin']), (0, express_async_handler_1.default)(permission_controller_1.default.bulkCreatePermissions));
// Toggle permission active status
router.patch('/:id/toggle', (0, auth_middleware_1.authorize)(['Admin']), (0, express_async_handler_1.default)(permission_controller_1.default.togglePermissionActive));
// ==================== ROLE PERMISSION ROUTES ====================
// Get current user's permissions
router.get('/my-permissions', (0, express_async_handler_1.default)(permission_controller_1.default.getCurrentUserPermissions));
// Get all permissions for a role
router.get('/roles/:roleId', (0, express_async_handler_1.default)(permission_controller_1.default.getRolePermissions));
// Check if role has specific permission
router.get('/roles/:roleId/check', (0, express_async_handler_1.default)(permission_controller_1.default.checkRolePermission));
// Get accessible routes for a role
router.get('/roles/:roleId/routes', (0, express_async_handler_1.default)(permission_controller_1.default.getRoleAccessibleRoutes));
// Assign a permission to a role
router.post('/roles/:roleId', (0, auth_middleware_1.authorize)(['Admin']), (0, express_async_handler_1.default)(permission_controller_1.default.assignRolePermission));
// Bulk assign permissions to a role
router.put('/roles/:roleId/bulk', (0, auth_middleware_1.authorize)(['Admin']), (0, express_async_handler_1.default)(permission_controller_1.default.bulkAssignRolePermissions));
// Clone permissions from one role to another
router.post('/roles/:roleId/clone', (0, auth_middleware_1.authorize)(['Admin']), (0, express_async_handler_1.default)(permission_controller_1.default.cloneRolePermissions));
// Remove a permission from a role
router.delete('/roles/:roleId/:permissionId', (0, auth_middleware_1.authorize)(['Admin']), (0, express_async_handler_1.default)(permission_controller_1.default.removeRolePermission));
exports.default = router;
