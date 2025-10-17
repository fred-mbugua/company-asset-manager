import { Router } from 'express';
import { ReportController } from '../controllers';
import { authenticate, authorize } from '../middlewares';
import asyncHandler from 'express-async-handler';

const router = Router();

router.get('/assets/all', authenticate, asyncHandler(ReportController.getAssetsByEmployee));
router.get('/assets/assignments', authenticate, asyncHandler(ReportController.getAssetsByEmployee));
router.get('/expenses/all', authenticate, asyncHandler(ReportController.getAssetsByEmployee));
router.get('/assets/employee/:employeeId', authenticate, asyncHandler(ReportController.getAssetsByEmployee));
router.get('/assets/branch/:location', authenticate, asyncHandler(ReportController.getAssetsByBranch));
router.get('/expenses/time-period', authenticate, authorize(['Admin']), asyncHandler(ReportController.getExpensesByTimePeriod));

export default router;