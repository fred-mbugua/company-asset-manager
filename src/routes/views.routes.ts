import { Router } from 'express';
import { ViewsController } from '../controllers';
import { authenticate, authorize } from '../middlewares/auth.middleware'; 
import { checkPermission } from '../middlewares/permission.middleware';
import asyncHandler from 'express-async-handler';

const router = Router();

// Public routes
router.get('/login', ViewsController.renderLogin);

// Dashboard and profile - accessible to all authenticated users
router.get('/', authenticate, asyncHandler(ViewsController.renderDashboard));
router.get('/dashboard', authenticate, asyncHandler(ViewsController.renderDashboard));
router.get('/profile', authenticate, asyncHandler(ViewsController.renderProfile));

// Asset management routes - permission checked
router.get('/assets/create', authenticate, checkPermission('ASSETS_CREATE', 'read'), asyncHandler(ViewsController.renderCreateAsset));
router.get('/assets/view', authenticate, checkPermission('ASSETS_VIEW', 'read'), asyncHandler(ViewsController.renderViewAssets));
router.get('/assets/assign', authenticate, checkPermission('ASSIGNMENTS_ASSIGN', 'read'), asyncHandler(ViewsController.renderAssignAssets));

// Expense routes - permission checked
router.get('/expenses/create', authenticate, checkPermission('EXPENSES_CREATE', 'read'), asyncHandler(ViewsController.renderCreateExpenses));

// Administration routes - permission checked
router.get('/users/manage', authenticate, checkPermission('ADMIN_USERS', 'read'), asyncHandler(ViewsController.renderCreateUser));
router.get('/users/import-history', authenticate, checkPermission('ADMIN_USERS', 'read'), asyncHandler(ViewsController.renderBulkImportHistory));
router.get('/branches/manage', authenticate, checkPermission('ADMIN_BRANCHES', 'read'), asyncHandler(ViewsController.renderManageBranches));
router.get('/branches/hierarchy', authenticate, checkPermission('ADMIN_BRANCHES', 'read'), asyncHandler(ViewsController.renderBranchHierarchy));
router.get('/departments/manage', authenticate, checkPermission('ADMIN_DEPARTMENTS', 'read'), asyncHandler(ViewsController.renderManageDepartments));
router.get('/asset-statuses/manage', authenticate, checkPermission('ADMIN_ASSET_STATUSES', 'read'), asyncHandler(ViewsController.renderManageAssetStatuses));
router.get('/asset-types/manage', authenticate, checkPermission('ADMIN_ASSET_TYPES', 'read'), asyncHandler(ViewsController.renderManageAssetTypes));
router.get('/expense-types/manage', authenticate, checkPermission('ADMIN_EXPENSE_TYPES', 'read'), asyncHandler(ViewsController.renderManageExpenseTypes));
router.get('/repair-request-types/manage', authenticate, checkPermission('ADMIN_REPAIR_TYPES', 'read'), asyncHandler(ViewsController.renderManageRepairTypes));
router.get('/repair-request-statuses/manage', authenticate, checkPermission('ADMIN_REPAIR_STATUSES', 'read'), asyncHandler(ViewsController.renderManageRepairStatuses));
router.get('/repair-request-priorities/manage', authenticate, checkPermission('ADMIN_REPAIR_PRIORITIES', 'read'), asyncHandler(ViewsController.renderManageRepairPriorities));

// Repair requests routes - permission checked
router.get('/repair-requests', authenticate, checkPermission('REPAIR_REQUESTS_LIST', 'read'), asyncHandler(ViewsController.renderRepairRequests));
router.get('/repair-requests/new', authenticate, checkPermission('REPAIR_REQUESTS_NEW', 'read'), asyncHandler(ViewsController.renderRepairRequests));
router.get('/repair-requests/workflow', authenticate, checkPermission('REPAIR_REQUESTS_WORKFLOW', 'read'), asyncHandler(ViewsController.renderManageRepairWorkflow));

// Roles and Permissions management - Admin only via permission
router.get('/roles/manage', authenticate, checkPermission('ADMIN_ROLES', 'read'), asyncHandler(ViewsController.renderManageRoles));
router.get('/permissions/manage', authenticate, checkPermission('ADMIN_PERMISSIONS', 'read'), asyncHandler(ViewsController.renderManagePermissions));

// Reports - permission checked
router.get('/reports/assets', authenticate, checkPermission('REPORTS_ASSETS', 'read'), asyncHandler(ViewsController.renderAssetsReport));
router.get('/reports/expenses', authenticate, checkPermission('REPORTS_EXPENSES', 'read'), asyncHandler(ViewsController.renderAssetExpenseReport));
router.get('/reports/assignments', authenticate, checkPermission('REPORTS_ASSIGNMENTS', 'read'), asyncHandler(ViewsController.renderAssetAssignmentReport));
router.get('/reports/action-logs', authenticate, checkPermission('REPORTS_ACTION_LOGS', 'read'), asyncHandler(ViewsController.renderActionLogReport));
router.get('/reports/repair-summary', authenticate, checkPermission('REPORTS_REPAIR_SUMMARY', 'read'), asyncHandler(ViewsController.renderRepairSummaryReport));

// System configuration - Admin only
router.get('/settings/configuration', authenticate, checkPermission('SETTINGS_SYSTEM', 'read'), asyncHandler(ViewsController.renderSystemConfiguration));

export default router;