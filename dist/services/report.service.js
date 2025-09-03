"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../models");
class ReportService {
    async getAssetsByEmployee(employeeId) {
        const employee = await models_1.EmployeeModel.findById(employeeId);
        if (!employee) {
            throw new Error('Employee not found');
        }
        const assets = await models_1.AssignmentModel.findByEmployeeId(employeeId);
        return { employee, assets };
    }
    async getAssetsByBranch(branchLocation) {
        const assets = await models_1.AssetModel.search({ location: branchLocation });
        return assets;
    }
    async getExpensesByTimePeriod(startDate, endDate) {
        const expenses = await models_1.ExpenseModel.findByTimePeriod(startDate, endDate);
        return expenses;
    }
    async getTotalAssetValue() {
        return models_1.ReportModel.getTotalAssetValue();
    }
    async getTotalValueByCategory(assetType) {
        return models_1.ReportModel.getTotalValueByCategory(assetType);
    }
}
exports.default = new ReportService();
