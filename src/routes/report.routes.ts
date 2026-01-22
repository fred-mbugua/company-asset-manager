import { Router } from 'express';
import { ReportController } from '../controllers';
import { authenticate } from '../middlewares';
import { checkPermission } from '../middlewares/permission.middleware';
import asyncHandler from 'express-async-handler';

const router = Router();

// Asset reports
router.get('/assets', authenticate, checkPermission('REPORTS', 'read'), asyncHandler(ReportController.getFilteredAssets));
router.get('/assets/all', authenticate, checkPermission('REPORTS', 'read'), asyncHandler(ReportController.getAssetsByEmployee));
router.get('/assets/assignments', authenticate, checkPermission('REPORTS', 'read'), asyncHandler(ReportController.getAssetsByEmployee));
router.get('/expenses/all', authenticate, checkPermission('REPORTS', 'read'), asyncHandler(ReportController.getAssetsByEmployee));
router.get('/assets/employee/:employeeId', authenticate, checkPermission('REPORTS', 'read'), asyncHandler(ReportController.getAssetsByEmployee));
router.get('/assets/branch/:location', authenticate, checkPermission('REPORTS', 'read'), asyncHandler(ReportController.getAssetsByBranch));
router.get('/expenses/time-period', authenticate, checkPermission('REPORTS', 'read'), asyncHandler(ReportController.getExpensesByTimePeriod));
router.get(
    '/assets/export', 
    authenticate, 
    checkPermission('REPORTS', 'read'),
    asyncHandler(ReportController.exportAssetReport)
);

// Expense Report Data Endpoint
// URL: /api/reports/expenses
router.get(
    '/expenses', 
    authenticate,
    checkPermission('REPORTS', 'read'),
    asyncHandler(ReportController.getExpenseReportData)
);

// Expense Report Export Endpoint
// URL: /api/reports/expenses/export
router.get(
    '/expenses/export', 
    authenticate, 
    checkPermission('REPORTS', 'read'),
    asyncHandler(ReportController.exportExpenseReport)
);

// Assignment Report Export Endpoint
// URL: GET /api/reports/assignments?asset_tag=...&limit=20&offset=0
router.get(
    '/assignments', 
    authenticate,
    checkPermission('REPORTS', 'read'),
    asyncHandler(ReportController.getAssignmentReportData) 
);

// Assignment Report Export Endpoint
// API Endpoint for Export (Export to Excel button)
// URL: GET /api/reports/assignments/export?asset_tag=...&from_date=...
router.get(
    '/assignments/export', 
    authenticate,
    checkPermission('REPORTS', 'read'),
    asyncHandler(ReportController.exportAssignmentReport)
);

// Action Log Report Data Endpoint
// URL: GET /api/reports/action-logs?action_type=...&limit=20&offset=0
router.get(
    '/action-logs', 
    authenticate,
    checkPermission('REPORTS_ACTION_LOGS', 'read'),
    asyncHandler(ReportController.getActionLogReportData) 
);

// Action Log Report Export Endpoint
// URL: GET /api/reports/action-logs/export?action_type=...&from_date=...
router.get(
    '/action-logs/export', 
    authenticate,
    checkPermission('REPORTS_ACTION_LOGS', 'read'),
    asyncHandler(ReportController.exportActionLogReport)
);

// Repair Summary Report Data Endpoint
// URL: GET /api/reports/repair-summary?from_date=...&to_date=...&asset_tag=...&limit=...&offset=...
router.get(
    '/repair-summary', 
    authenticate,
    checkPermission('REPORTS', 'read'),
    asyncHandler(ReportController.getRepairSummaryReportData) 
);

// Asset Repair Expense Details Endpoint
// URL: GET /api/reports/repair-summary/asset/:assetId?from_date=...&to_date=...
router.get(
    '/repair-summary/asset/:assetId',
    authenticate,
    checkPermission('REPORTS', 'read'),
    asyncHandler(ReportController.getAssetRepairExpenses)
);

// Repair Summary Report Export Endpoint
// URL: GET /api/reports/repair-summary/export?from_date=...&to_date=...
router.get(
    '/repair-summary/export', 
    authenticate,
    checkPermission('REPORTS', 'read'),
    asyncHandler(ReportController.exportRepairSummaryReport)
);

export default router;