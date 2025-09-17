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
        const employeesAssets = await models_1.AssignmentModel.findByEmployeeId(employeeId);
        if (!employeesAssets || employeesAssets.length === 0) {
            return { message: "No assets found for this employee.", assets: [] };
        }
        return { message: "Assets retrieved successfully.", assets: employeesAssets };
    }
    // async create(employeeData: any, userId: number) {
    //   return EmployeeModel.create(employeeData);
    // }
    async getAll() {
        return models_1.EmployeeModel.findAll();
    }
}
exports.default = new EmployeeService();
