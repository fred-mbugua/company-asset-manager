import { Router } from 'express';
import { ViewsController } from '../controllers';
import { authenticate } from '../middlewares/auth.middleware'; 
import asyncHandler from 'express-async-handler';

const router = Router();

router.get('/login', ViewsController.renderLogin);
router.get('/', authenticate, asyncHandler(ViewsController.renderDashboard));
router.get('/dashboard', authenticate, asyncHandler(ViewsController.renderDashboard));
router.get('/assets/create', authenticate, asyncHandler(ViewsController.renderCreateAsset));
router.get('/assets/view', authenticate, asyncHandler(ViewsController.renderViewAssets));
router.get('/assets/assign', authenticate, asyncHandler(ViewsController.renderAssignAssets));
router.get('/expenses/create', authenticate, asyncHandler(ViewsController.renderCreateExpenses));
router.get('/users/create', authenticate, asyncHandler(ViewsController.renderCreateUser));
router.get('/reports/assets', authenticate, asyncHandler(ViewsController.renderAssetsReport));
router.get('/reports/expenses', authenticate, asyncHandler(ViewsController.renderAssetExpenseReport));
router.get('/reports/assignments', authenticate, asyncHandler(ViewsController.renderAssetAssignmentReport));

export default router;