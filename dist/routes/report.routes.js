"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
const middlewares_1 = require("../middlewares");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const router = (0, express_1.Router)();
router.get('/assets', middlewares_1.authenticate, (0, express_async_handler_1.default)(controllers_1.ReportController.getFilteredAssets));
router.get('/assets/all', middlewares_1.authenticate, (0, express_async_handler_1.default)(controllers_1.ReportController.getAssetsByEmployee));
router.get('/assets/assignments', middlewares_1.authenticate, (0, express_async_handler_1.default)(controllers_1.ReportController.getAssetsByEmployee));
router.get('/expenses/all', middlewares_1.authenticate, (0, express_async_handler_1.default)(controllers_1.ReportController.getAssetsByEmployee));
router.get('/assets/employee/:employeeId', middlewares_1.authenticate, (0, express_async_handler_1.default)(controllers_1.ReportController.getAssetsByEmployee));
router.get('/assets/branch/:location', middlewares_1.authenticate, (0, express_async_handler_1.default)(controllers_1.ReportController.getAssetsByBranch));
router.get('/expenses/time-period', middlewares_1.authenticate, (0, express_async_handler_1.default)(controllers_1.ReportController.getExpensesByTimePeriod));
router.get('/assets/export', middlewares_1.authenticate, (0, express_async_handler_1.default)(controllers_1.ReportController.exportAssetReport));
// Expense Report Data Endpoint
// URL: /api/reports/expenses
router.get('/expenses', middlewares_1.authenticate, // Ensure the user is authenticated
(0, express_async_handler_1.default)(controllers_1.ReportController.getExpenseReportData) // The new function for filtering/pagination
);
// Expense Report Export Endpoint
// URL: /api/reports/expenses/export
router.get('/expenses/export', middlewares_1.authenticate, (0, express_async_handler_1.default)(controllers_1.ReportController.exportExpenseReport));
// Assignment Report Export Endpoint
// URL: GET /api/reports/assignments?asset_tag=...&limit=20&offset=0
router.get('/assignments', middlewares_1.authenticate, // Requires authentication/authorization
(0, express_async_handler_1.default)(controllers_1.ReportController.getAssignmentReportData));
// Assignment Report Export Endpoint
// API Endpoint for Export (Export to Excel button)
// URL: GET /api/reports/assignments/export?asset_tag=...&from_date=...
router.get('/assignments/export', middlewares_1.authenticate, // Requires authentication/authorization
(0, express_async_handler_1.default)(controllers_1.ReportController.exportAssignmentReport));
// Action Log Report Data Endpoint
// URL: GET /api/reports/action-logs?action_type=...&limit=20&offset=0
router.get('/action-logs', middlewares_1.authenticate, (0, express_async_handler_1.default)(controllers_1.ReportController.getActionLogReportData));
// Action Log Report Export Endpoint
// URL: GET /api/reports/action-logs/export?action_type=...&from_date=...
router.get('/action-logs/export', middlewares_1.authenticate, (0, express_async_handler_1.default)(controllers_1.ReportController.exportActionLogReport));
// Repair Summary Report Data Endpoint
// URL: GET /api/reports/repair-summary?from_date=...&to_date=...&asset_tag=...&limit=...&offset=...
router.get('/repair-summary', middlewares_1.authenticate, (0, express_async_handler_1.default)(controllers_1.ReportController.getRepairSummaryReportData));
// Asset Repair Expense Details Endpoint
// URL: GET /api/reports/repair-summary/asset/:assetId?from_date=...&to_date=...
router.get('/repair-summary/asset/:assetId', middlewares_1.authenticate, (0, express_async_handler_1.default)(controllers_1.ReportController.getAssetRepairExpenses));
// Repair Summary Report Export Endpoint
// URL: GET /api/reports/repair-summary/export?from_date=...&to_date=...
router.get('/repair-summary/export', middlewares_1.authenticate, (0, express_async_handler_1.default)(controllers_1.ReportController.exportRepairSummaryReport));
exports.default = router;
