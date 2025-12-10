import { Router } from 'express';
import { ReportController } from '../controllers';
import { authenticate, authorize } from '../middlewares';
import asyncHandler from 'express-async-handler';

const router = Router();
router.get('/assets', authenticate, asyncHandler(ReportController.getFilteredAssets));
router.get('/assets/all', authenticate, asyncHandler(ReportController.getAssetsByEmployee));
router.get('/assets/assignments', authenticate, asyncHandler(ReportController.getAssetsByEmployee));
router.get('/expenses/all', authenticate, asyncHandler(ReportController.getAssetsByEmployee));
router.get('/assets/employee/:employeeId', authenticate, asyncHandler(ReportController.getAssetsByEmployee));
router.get('/assets/branch/:location', authenticate, asyncHandler(ReportController.getAssetsByBranch));
router.get('/expenses/time-period', authenticate, authorize(['Admin']), asyncHandler(ReportController.getExpensesByTimePeriod));
router.get(
    '/assets/export', 
    authenticate, 
    asyncHandler(ReportController.exportAssetReport)
);

// Expense Report Data Endpoint
// URL: /api/reports/expenses
router.get(
    '/expenses', 
    authenticate, // Ensure the user is authenticated
    asyncHandler(ReportController.getExpenseReportData) // The new function for filtering/pagination
);

// Expense Report Export Endpoint
// URL: /api/reports/expenses/export
router.get(
    '/expenses/export', 
    authenticate, 
    asyncHandler(ReportController.exportExpenseReport)
);

// Assignment Report Export Endpoint
// URL: GET /api/reports/assignments?asset_tag=...&limit=20&offset=0
router.get(
    '/assignments', 
    authenticate, // Requires authentication/authorization
    asyncHandler(ReportController.getAssignmentReportData) 
);

// Assignment Report Export Endpoint
// API Endpoint for Export (Export to Excel button)
// URL: GET /api/reports/assignments/export?asset_tag=...&from_date=...
router.get(
    '/assignments/export', 
    authenticate, // Requires authentication/authorization
    asyncHandler(ReportController.exportAssignmentReport)
);

// Action Log Report Data Endpoint
// URL: GET /api/reports/action-logs?action_type=...&limit=20&offset=0
router.get(
    '/action-logs', 
    authenticate,
    asyncHandler(ReportController.getActionLogReportData) 
);

// Action Log Report Export Endpoint
// URL: GET /api/reports/action-logs/export?action_type=...&from_date=...
router.get(
    '/action-logs/export', 
    authenticate,
    asyncHandler(ReportController.exportActionLogReport)
);

export default router;