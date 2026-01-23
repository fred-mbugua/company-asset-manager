"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const permission_middleware_1 = require("../middlewares/permission.middleware");
const userPermissions_middleware_1 = require("../middlewares/userPermissions.middleware");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const router = (0, express_1.Router)();
// Public routes
router.get('/login', controllers_1.ViewsController.renderLogin);
// Dashboard and profile - accessible to all authenticated users
router.get('/', auth_middleware_1.authenticate, userPermissions_middleware_1.loadUserPermissions, (0, express_async_handler_1.default)(controllers_1.ViewsController.renderDashboard));
router.get('/dashboard', auth_middleware_1.authenticate, userPermissions_middleware_1.loadUserPermissions, (0, express_async_handler_1.default)(controllers_1.ViewsController.renderDashboard));
router.get('/profile', auth_middleware_1.authenticate, userPermissions_middleware_1.loadUserPermissions, (0, express_async_handler_1.default)(controllers_1.ViewsController.renderProfile));
// Asset management routes - permission checked
router.get('/assets/create', auth_middleware_1.authenticate, userPermissions_middleware_1.loadUserPermissions, (0, permission_middleware_1.checkPermission)('ASSETS_CREATE', 'read'), (0, express_async_handler_1.default)(controllers_1.ViewsController.renderCreateAsset));
router.get('/assets/view', auth_middleware_1.authenticate, userPermissions_middleware_1.loadUserPermissions, (0, permission_middleware_1.checkPermission)('ASSETS_VIEW', 'read'), (0, express_async_handler_1.default)(controllers_1.ViewsController.renderViewAssets));
router.get('/assets/assign', auth_middleware_1.authenticate, userPermissions_middleware_1.loadUserPermissions, (0, permission_middleware_1.checkPermission)('ASSIGNMENTS_ASSIGN', 'read'), (0, express_async_handler_1.default)(controllers_1.ViewsController.renderAssignAssets));
// Expense routes - permission checked
router.get('/expenses/create', auth_middleware_1.authenticate, userPermissions_middleware_1.loadUserPermissions, (0, permission_middleware_1.checkPermission)('EXPENSES_CREATE', 'read'), (0, express_async_handler_1.default)(controllers_1.ViewsController.renderCreateExpenses));
// Administration routes - permission checked
router.get('/users/manage', auth_middleware_1.authenticate, userPermissions_middleware_1.loadUserPermissions, (0, permission_middleware_1.checkPermission)('ADMIN_USERS', 'read'), (0, express_async_handler_1.default)(controllers_1.ViewsController.renderCreateUser));
router.get('/users/import-history', auth_middleware_1.authenticate, userPermissions_middleware_1.loadUserPermissions, (0, permission_middleware_1.checkPermission)('ADMIN_USERS', 'read'), (0, express_async_handler_1.default)(controllers_1.ViewsController.renderBulkImportHistory));
router.get('/branches/manage', auth_middleware_1.authenticate, userPermissions_middleware_1.loadUserPermissions, (0, permission_middleware_1.checkPermission)('ADMIN_BRANCHES', 'read'), (0, express_async_handler_1.default)(controllers_1.ViewsController.renderManageBranches));
router.get('/branches/hierarchy', auth_middleware_1.authenticate, userPermissions_middleware_1.loadUserPermissions, (0, permission_middleware_1.checkPermission)('ADMIN_BRANCHES', 'read'), (0, express_async_handler_1.default)(controllers_1.ViewsController.renderBranchHierarchy));
router.get('/departments/manage', auth_middleware_1.authenticate, userPermissions_middleware_1.loadUserPermissions, (0, permission_middleware_1.checkPermission)('ADMIN_DEPARTMENTS', 'read'), (0, express_async_handler_1.default)(controllers_1.ViewsController.renderManageDepartments));
router.get('/asset-statuses/manage', auth_middleware_1.authenticate, userPermissions_middleware_1.loadUserPermissions, (0, permission_middleware_1.checkPermission)('ADMIN_ASSET_STATUSES', 'read'), (0, express_async_handler_1.default)(controllers_1.ViewsController.renderManageAssetStatuses));
router.get('/asset-types/manage', auth_middleware_1.authenticate, userPermissions_middleware_1.loadUserPermissions, (0, permission_middleware_1.checkPermission)('ADMIN_ASSET_TYPES', 'read'), (0, express_async_handler_1.default)(controllers_1.ViewsController.renderManageAssetTypes));
router.get('/expense-types/manage', auth_middleware_1.authenticate, userPermissions_middleware_1.loadUserPermissions, (0, permission_middleware_1.checkPermission)('ADMIN_EXPENSE_TYPES', 'read'), (0, express_async_handler_1.default)(controllers_1.ViewsController.renderManageExpenseTypes));
router.get('/repair-request-types/manage', auth_middleware_1.authenticate, userPermissions_middleware_1.loadUserPermissions, (0, permission_middleware_1.checkPermission)('ADMIN_REPAIR_TYPES', 'read'), (0, express_async_handler_1.default)(controllers_1.ViewsController.renderManageRepairTypes));
router.get('/repair-request-statuses/manage', auth_middleware_1.authenticate, userPermissions_middleware_1.loadUserPermissions, (0, permission_middleware_1.checkPermission)('ADMIN_REPAIR_STATUSES', 'read'), (0, express_async_handler_1.default)(controllers_1.ViewsController.renderManageRepairStatuses));
router.get('/repair-request-priorities/manage', auth_middleware_1.authenticate, userPermissions_middleware_1.loadUserPermissions, (0, permission_middleware_1.checkPermission)('ADMIN_REPAIR_PRIORITIES', 'read'), (0, express_async_handler_1.default)(controllers_1.ViewsController.renderManageRepairPriorities));
// Repair requests routes - permission checked
router.get('/repair-requests', auth_middleware_1.authenticate, userPermissions_middleware_1.loadUserPermissions, (0, permission_middleware_1.checkPermission)('REPAIR_REQUESTS_LIST', 'read'), (0, express_async_handler_1.default)(controllers_1.ViewsController.renderRepairRequests));
router.get('/repair-requests/new', auth_middleware_1.authenticate, userPermissions_middleware_1.loadUserPermissions, (0, permission_middleware_1.checkPermission)('REPAIR_REQUESTS_NEW', 'read'), (0, express_async_handler_1.default)(controllers_1.ViewsController.renderRepairRequests));
router.get('/repair-requests/workflow', auth_middleware_1.authenticate, userPermissions_middleware_1.loadUserPermissions, (0, permission_middleware_1.checkPermission)('REPAIR_REQUESTS_WORKFLOW', 'read'), (0, express_async_handler_1.default)(controllers_1.ViewsController.renderManageRepairWorkflow));
// Roles and Permissions management - Admin only via permission
router.get('/roles/manage', auth_middleware_1.authenticate, userPermissions_middleware_1.loadUserPermissions, (0, permission_middleware_1.checkPermission)('ADMIN_ROLES', 'read'), (0, express_async_handler_1.default)(controllers_1.ViewsController.renderManageRoles));
router.get('/permissions/manage', auth_middleware_1.authenticate, userPermissions_middleware_1.loadUserPermissions, (0, permission_middleware_1.checkPermission)('ADMIN_PERMISSIONS', 'read'), (0, express_async_handler_1.default)(controllers_1.ViewsController.renderManagePermissions));
// Reports - permission checked
router.get('/reports/assets', auth_middleware_1.authenticate, userPermissions_middleware_1.loadUserPermissions, (0, permission_middleware_1.checkPermission)('REPORTS_ASSETS', 'read'), (0, express_async_handler_1.default)(controllers_1.ViewsController.renderAssetsReport));
router.get('/reports/expenses', auth_middleware_1.authenticate, userPermissions_middleware_1.loadUserPermissions, (0, permission_middleware_1.checkPermission)('REPORTS_EXPENSES', 'read'), (0, express_async_handler_1.default)(controllers_1.ViewsController.renderAssetExpenseReport));
router.get('/reports/assignments', auth_middleware_1.authenticate, userPermissions_middleware_1.loadUserPermissions, (0, permission_middleware_1.checkPermission)('REPORTS_ASSIGNMENTS', 'read'), (0, express_async_handler_1.default)(controllers_1.ViewsController.renderAssetAssignmentReport));
router.get('/reports/action-logs', auth_middleware_1.authenticate, userPermissions_middleware_1.loadUserPermissions, (0, permission_middleware_1.checkPermission)('REPORTS_ACTION_LOGS', 'read'), (0, express_async_handler_1.default)(controllers_1.ViewsController.renderActionLogReport));
router.get('/reports/repair-summary', auth_middleware_1.authenticate, userPermissions_middleware_1.loadUserPermissions, (0, permission_middleware_1.checkPermission)('REPORTS_REPAIR_SUMMARY', 'read'), (0, express_async_handler_1.default)(controllers_1.ViewsController.renderRepairSummaryReport));
// System configuration - Admin only
router.get('/settings/configuration', auth_middleware_1.authenticate, userPermissions_middleware_1.loadUserPermissions, (0, permission_middleware_1.checkPermission)('SETTINGS_SYSTEM', 'read'), (0, express_async_handler_1.default)(controllers_1.ViewsController.renderSystemConfiguration));
exports.default = router;
