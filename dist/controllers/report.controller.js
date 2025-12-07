"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const services_1 = require("../services");
const response_1 = require("../utils/response");
const logger_1 = __importDefault(require("../utils/logger"));
const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'KES' });
class ReportController {
    async getAssetsByEmployee(req, res) {
        try {
            const { employeeId } = req.params;
            const report = await services_1.ReportService.getAssetsByEmployee(employeeId);
            (0, response_1.successResponse)(res, 200, 'Assets by employee report generated successfully', report);
        }
        catch (error) {
            logger_1.default.error('Failed to generate assets by employee report:', error);
            (0, response_1.errorResponse)(res, 404, error.message);
        }
    }
    async getFilteredAssets(req, res) {
        try {
            const filters = req.query;
            const report = await services_1.ReportService.getFilteredAssets(filters);
            (0, response_1.successResponse)(res, 200, 'Filtered assets report generated successfully', report);
        }
        catch (error) {
            logger_1.default.error('Failed to generate assets report:', error);
            (0, response_1.errorResponse)(res, 404, error.message);
        }
    }
    async getAllAssets(req, res) {
        try {
            const report = await services_1.ReportService.getAllAssets();
            (0, response_1.successResponse)(res, 200, 'Assets report generated successfully', report);
        }
        catch (error) {
            logger_1.default.error('Failed to generate assets report:', error);
            (0, response_1.errorResponse)(res, 404, error.message);
        }
    }
    async getAssetsByBranch(req, res) {
        try {
            const { location } = req.params;
            const report = await services_1.ReportService.getAssetsByBranch(location);
            (0, response_1.successResponse)(res, 200, 'Assets by branch report generated successfully', report);
        }
        catch (error) {
            logger_1.default.error('Failed to generate assets by branch report:', error);
            (0, response_1.errorResponse)(res, 404, error.message);
        }
    }
    async getExpensesByTimePeriod(req, res) {
        try {
            const { startDate, endDate } = req.query;
            if (!startDate || !endDate) {
                return (0, response_1.errorResponse)(res, 400, 'Start date and end date are required');
            }
            const expenses = await services_1.ReportService.getExpensesByTimePeriod(startDate, endDate);
            (0, response_1.successResponse)(res, 200, 'Expenses report generated successfully', expenses);
        }
        catch (error) {
            logger_1.default.error('Failed to generate expenses report:', error);
            (0, response_1.errorResponse)(res, 500, 'Failed to generate report');
        }
    }
    /**
       * Handles the request to export the Asset Report to Excel.
       */
    async exportAssetReport(req, res) {
        try {
            // Getting filters from the query parameters (e.g., ?type=Laptop&location=NY)
            const filters = req.query;
            // console.log('Exporting Asset Report with filters:', filters);
            // Generating the Excel file buffer
            const excelBuffer = await services_1.ReportExportService.generateAssetReport(filters);
            // Setting necessary HTTP headers for download
            const date = new Date().toISOString().slice(0, 10);
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=Asset_Report_${date}.xlsx`);
            // Sending the buffer to the client
            res.send(excelBuffer);
        }
        catch (error) {
            console.error('Exporting Asset Report failed:', error);
            res.status(500).send('Failed to generate report.');
        }
    }
    /**
     * Handles fetching paginated and filtered expenses for the frontend table.
     * Route: GET /api/reports/expenses?limit=20&offset=0&expense_type=Repair
     */
    async getExpenseReportData(req, res) {
        try {
            //  Extracting Pagination Parameters
            // Set defaults if not provided by the client
            const limitStr = (req.query.limit || '20');
            const offsetStr = (req.query.offset || '0');
            const limit = parseInt(limitStr, 10);
            const offset = parseInt(offsetStr, 10);
            if (isNaN(limit) || isNaN(offset) || limit < 1 || offset < 0) {
                res.status(400).json({ success: false, message: 'Invalid pagination parameters.' });
                return;
            }
            //  Extracting Filters (everything else in req.query)
            // The service/model expects keys like asset_tag, expense_type, from_date, etc.
            const { limit: _, offset: __, ...filters } = req.query;
            const expenseFilters = filters;
            // Calling the Expense Report Service
            const { expenses, totalCount } = await services_1.ExpenseService.getPaginatedExpenses(expenseFilters, limit, offset);
            // Formatting Data for Client
            // Apply formatting here so the client doesn't need complex logic
            const formattedExpenses = expenses.map(e => ({
                ...e,
                // Ensure date is a friendly string
                expense_date: new Date(e.expense_date).toLocaleDateString(),
                // Ensure amount is formatted as currency string
                amount: currencyFormatter.format(e.amount),
            }));
            // Sending JSON Response
            res.status(200).json({
                success: true,
                data: {
                    expenses: formattedExpenses,
                    totalCount: totalCount
                }
            });
        }
        catch (error) {
            console.error('Error fetching expense report data:', error);
            res.status(500).json({ success: false, message: 'Failed to retrieve expense report data.' });
        }
    }
    /**
     * Handling the request to export the Expenses Report to Excel.
     * Route: GET /api/reports/expenses/export?filter=value
     */
    async exportExpenseReport(req, res) {
        try {
            //  Extracting Filters
            // req.query contains all parameters (e.g., expense_type=Repair, from_date=2024-01-01)
            // No need to extract limit/offset, as the export service fetches ALL filtered data.
            const filters = req.query;
            //  Generating the Excel file buffer using the Service
            // This function fetches all data, creates the Excel workbook, and returns a Buffer.
            const excelBuffer = await services_1.ReportExportService.generateExpenseReport(filters);
            //  Setting necessary HTTP headers for file download
            const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
            const filename = `Expense_Report_${date}.xlsx`;
            // Setting the Content-Type to tell the browser it's an Excel file
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            // Setting Content-Disposition to force a file download and suggest a filename
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            // Sending the buffer to the client
            res.send(excelBuffer);
        }
        catch (error) {
            console.error('Exporting Expense Report failed:', error);
            // Send a 500 status with a plain text error message
            res.status(500).send('Failed to generate expense report.');
        }
    }
    /**
     * Handles fetching paginated and filtered assignments for the frontend table.
     * Route: GET /api/reports/assignments
     */
    async getAssignmentReportData(req, res) {
        try {
            const limit = parseInt((req.query.limit || '20'), 10);
            const offset = parseInt((req.query.offset || '0'), 10);
            const { limit: _, offset: __, ...filters } = req.query;
            const assignmentFilters = filters;
            const { assignments, totalCount } = await services_1.AssignmentService.getPaginatedAssignments(assignmentFilters, limit, offset);
            const formattedAssignments = assignments.map(a => ({
                ...a,
                assignment_date: new Date(a.assignment_date).toLocaleDateString(),
                return_date: a.return_date ? new Date(a.return_date).toLocaleDateString() : 'Active',
            }));
            res.status(200).json({
                success: true,
                data: {
                    assignments: formattedAssignments,
                    totalCount: totalCount
                }
            });
        }
        catch (error) {
            console.error('Error fetching assignment report data:', error);
            res.status(500).json({ success: false, message: 'Failed to retrieve assignment report data.' });
        }
    }
    /**
     * Handling the request to export the Assignments Report to Excel.
     * Route: GET /api/reports/assignments/export
     */
    async exportAssignmentReport(req, res) {
        try {
            const filters = req.query;
            const excelBuffer = await services_1.ReportExportService.generateAssignmentReport(filters);
            const date = new Date().toISOString().slice(0, 10);
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=Assignments_Report_${date}.xlsx`);
            res.send(excelBuffer);
        }
        catch (error) {
            console.error('Exporting Assignment Report failed:', error);
            res.status(500).send('Failed to generate assignment report.');
        }
    }
}
exports.default = new ReportController();
