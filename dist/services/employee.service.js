"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../models");
class EmployeeService {
    async getEmployeeById(id) {
        const employee = await models_1.EmployeeModel.findById(id);
        if (!employee) {
            throw new Error('Employee not found');
        }
        return employee;
    }
    async getAssetsByEmployeeId(employeeId) {
        const employeeAssets = await models_1.AssignmentModel.findByEmployeeId(employeeId);
        if (!employeeAssets || employeeAssets.length === 0) {
            return { message: "No assets found for this employee.", assets: [] };
        }
        return { message: "Assets retrieved successfully.", assets: employeeAssets };
    }
}
exports.default = new EmployeeService();
