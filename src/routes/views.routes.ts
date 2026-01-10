import { Router } from 'express';
import { ViewsController } from '../controllers';
import { authenticate, authorize } from '../middlewares/auth.middleware'; 
import asyncHandler from 'express-async-handler';

const router = Router();

router.get('/login', ViewsController.renderLogin);
router.get('/', authenticate, authorize(['Admin', 'Standard User']), asyncHandler(ViewsController.renderDashboard));
router.get('/dashboard', authenticate, authorize(['Admin', 'Standard User']), asyncHandler(ViewsController.renderDashboard));
router.get('/profile', authenticate, authorize(['Admin', 'Standard User']), asyncHandler(ViewsController.renderProfile));
router.get('/assets/create', authenticate, authorize(['Admin', 'Standard User']), asyncHandler(ViewsController.renderCreateAsset));
router.get('/assets/view', authenticate, authorize(['Admin', 'Standard User']), asyncHandler(ViewsController.renderViewAssets));
router.get('/assets/assign', authenticate, authorize(['Admin', 'Standard User']), asyncHandler(ViewsController.renderAssignAssets));
router.get('/expenses/create', authenticate, authorize(['Admin', 'Standard User']), asyncHandler(ViewsController.renderCreateExpenses));
router.get('/users/manage', authenticate, authorize(['Admin', 'Standard User']), asyncHandler(ViewsController.renderCreateUser));
router.get('/users/import-history', authenticate, authorize(['Admin']), asyncHandler(ViewsController.renderBulkImportHistory));
router.get('/branches/manage', authenticate, authorize(['Admin', 'Standard User']), asyncHandler(ViewsController.renderManageBranches));
router.get('/departments/manage', authenticate, authorize(['Admin', 'Standard User']), asyncHandler(ViewsController.renderManageDepartments));
router.get('/asset-statuses/manage', authenticate, authorize(['Admin', 'Standard User']), asyncHandler(ViewsController.renderManageAssetStatuses));
router.get('/asset-types/manage', authenticate, authorize(['Admin', 'Standard User']), asyncHandler(ViewsController.renderManageAssetTypes));
router.get('/expense-types/manage', authenticate, authorize(['Admin', 'Standard User']), asyncHandler(ViewsController.renderManageExpenseTypes));
router.get('/reports/assets', authenticate, authorize(['Admin', 'Standard User']), asyncHandler(ViewsController.renderAssetsReport));
router.get('/reports/expenses', authenticate, authorize(['Admin', 'Standard User']), asyncHandler(ViewsController.renderAssetExpenseReport));
router.get('/reports/assignments', authenticate, authorize(['Admin', 'Standard User']), asyncHandler(ViewsController.renderAssetAssignmentReport));
router.get('/reports/action-logs', authenticate, authorize(['Admin', 'Standard User']), asyncHandler(ViewsController.renderActionLogReport));
router.get('/reports/repair-summary', authenticate, authorize(['Admin', 'Standard User']), asyncHandler(ViewsController.renderRepairSummaryReport));
router.get('/settings/configuration', authenticate, authorize(['Admin']), asyncHandler(ViewsController.renderSystemConfiguration));

export default router;