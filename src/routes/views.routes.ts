import { Router } from 'express';
import { ViewsController } from '../controllers';
import { authenticate } from '../middlewares/auth.middleware';
import asyncHandler from 'express-async-handler';

const router = Router();

router.get('/login', ViewsController.renderLogin);
router.get('/dashboard', asyncHandler(ViewsController.renderDashboard));
router.get('/assets/create', asyncHandler(ViewsController.renderCreateAsset));
router.get('/assets/view', asyncHandler(ViewsController.renderViewAssets));
router.get('/assets/assign', asyncHandler(ViewsController.renderAssignAssets));
router.get('/expenses/create', asyncHandler(ViewsController.renderCreateExpenses));
router.get('/users/create', asyncHandler(ViewsController.renderCreateUser));
router.get('/reports', asyncHandler(ViewsController.renderReports));

export default router;