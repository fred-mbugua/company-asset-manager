import { Router } from 'express';
import { ViewsController } from '../controllers';
import { authenticate, authorize } from '../middlewares/auth.middleware'; 
import asyncHandler from 'express-async-handler';

const router = Router();

router.get('/login', ViewsController.renderLogin);
router.get('/', authenticate, authorize(['*']), asyncHandler(ViewsController.renderDashboard));
router.get('/dashboard', authenticate, authorize(['*']), asyncHandler(ViewsController.renderDashboard));
router.get('/profile', authenticate, authorize(['*']), asyncHandler(ViewsController.renderProfile));
router.get('/assets/create', authenticate, authorize(['*']), asyncHandler(ViewsController.renderCreateAsset));
router.get('/assets/view', authenticate, authorize(['*']), asyncHandler(ViewsController.renderViewAssets));
router.get('/assets/assign', authenticate, authorize(['*']), asyncHandler(ViewsController.renderAssignAssets));
router.get('/expenses/create', authenticate, authorize(['*']), asyncHandler(ViewsController.renderCreateExpenses));
router.get('/users/manage', authenticate, authorize(['Admin']), asyncHandler(ViewsController.renderCreateUser));
router.get('/users/import-history', authenticate, authorize(['Admin']), asyncHandler(ViewsController.renderBulkImportHistory));
router.get('/branches/manage', authenticate, authorize(['Admin']), asyncHandler(ViewsController.renderManageBranches));
router.get('/departments/manage', authenticate, authorize(['Admin']), asyncHandler(ViewsController.renderManageDepartments));
router.get('/asset-statuses/manage', authenticate, authorize(['Admin']), asyncHandler(ViewsController.renderManageAssetStatuses));
router.get('/asset-types/manage', authenticate, authorize(['Admin']), asyncHandler(ViewsController.renderManageAssetTypes));
router.get('/expense-types/manage', authenticate, authorize(['Admin']), asyncHandler(ViewsController.renderManageExpenseTypes));
router.get('/repair-request-types/manage', authenticate, authorize(['Admin']), asyncHandler(ViewsController.renderManageRepairTypes));
router.get('/repair-request-statuses/manage', authenticate, authorize(['Admin']), asyncHandler(ViewsController.renderManageRepairStatuses));
router.get('/repair-request-priorities/manage', authenticate, authorize(['Admin']), asyncHandler(ViewsController.renderManageRepairPriorities));
router.get('/repair-requests', authenticate, authorize(['*']), asyncHandler(ViewsController.renderRepairRequests));
router.get('/repair-requests/new', authenticate, authorize(['*']), asyncHandler(ViewsController.renderRepairRequests));
router.get('/repair-requests/workflow', authenticate, authorize(['Admin']), asyncHandler(ViewsController.renderManageRepairWorkflow));
router.get('/roles/manage', authenticate, authorize(['Admin']), asyncHandler(ViewsController.renderManageRoles));
router.get('/reports/assets', authenticate, authorize(['*']), asyncHandler(ViewsController.renderAssetsReport));
router.get('/reports/expenses', authenticate, authorize(['*']), asyncHandler(ViewsController.renderAssetExpenseReport));
router.get('/reports/assignments', authenticate, authorize(['*']), asyncHandler(ViewsController.renderAssetAssignmentReport));
router.get('/reports/action-logs', authenticate, authorize(['Admin']), asyncHandler(ViewsController.renderActionLogReport));
router.get('/reports/repair-summary', authenticate, authorize(['*']), asyncHandler(ViewsController.renderRepairSummaryReport));
router.get('/settings/configuration', authenticate, authorize(['Admin']), asyncHandler(ViewsController.renderSystemConfiguration));

export default router;