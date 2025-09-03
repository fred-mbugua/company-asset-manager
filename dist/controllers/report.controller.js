"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const services_1 = require("../services");
const logger_1 = __importDefault(require("../utils/logger"));
class ReportController {
    async getAssetsByEmployee(req, res) {
        try {
            const { employeeId } = req.params;
            const report = await services_1.ReportService.getAssetsByEmployee(employeeId);
            res.status(200).json(report);
        }
        catch (error) {
            logger_1.default.error('Failed to generate assets by employee report:', error);
            res.status(404).json({ error: error.message });
        }
    }
    async getAssetsByBranch(req, res) {
        try {
            const { location } = req.params;
            const report = await services_1.ReportService.getAssetsByBranch(location);
            res.status(200).json(report);
        }
        catch (error) {
            logger_1.default.error('Failed to generate assets by branch report:', error);
            res.status(404).json({ error: error.message });
        }
    }
    async getExpensesByTimePeriod(req, res) {
        try {
            const { startDate, endDate } = req.query;
            if (!startDate || !endDate) {
                res.status(400).json({ error: 'Start date and end date are required' });
                return;
            }
            const expenses = await services_1.ReportService.getExpensesByTimePeriod(startDate, endDate);
            res.status(200).json(expenses);
        }
        catch (error) {
            logger_1.default.error('Failed to generate expenses report:', error);
            res.status(500).json({ error: 'Failed to generate report' });
        }
    }
}
exports.default = new ReportController();
