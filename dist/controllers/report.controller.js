"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const services_1 = require("../services");
const response_1 = require("../utils/response");
const logger_1 = __importDefault(require("../utils/logger"));
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
}
exports.default = new ReportController();
