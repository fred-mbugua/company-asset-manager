"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const services_1 = require("../services");
const response_1 = require("../utils/response");
const logger_1 = __importDefault(require("../utils/logger"));
class EmployeeController {
    async getAssetsByEmployee(req, res) {
        try {
            const { employeeId } = req.params;
            const result = await services_1.EmployeeService.getAssetsByEmployeeId(employeeId);
            (0, response_1.successResponse)(res, 200, 'Assets retrieved successfully', result);
        }
        catch (error) {
            logger_1.default.error('Failed to get assets by employee:', error);
            (0, response_1.errorResponse)(res, 404, error.message);
        }
    }
    // async create(req: AuthenticatedRequest, res: Response) {
    //       try {
    //           const userId = req.user?.id;
    //           const newEmployee = await EmployeeService.create(req.body, userId);
    //           successResponse(res, 201, 'Employee created successfully', newEmployee);
    //       } catch (error) {
    //           logger.error('Failed to create employee:', error);
    //           errorResponse(res, 400, (error as Error).message);
    //       }
    //   }
    async getAll(req, res) {
        try {
            const employees = await services_1.EmployeeService.getAll();
            (0, response_1.successResponse)(res, 200, 'Employees retrieved successfully', employees);
        }
        catch (error) {
            logger_1.default.error('Failed to retrieve employees:', error);
            (0, response_1.errorResponse)(res, 500, error.message);
        }
    }
    async getById(req, res) {
        try {
            const employee = await services_1.EmployeeService.getEmployeeById(req.params.id);
            (0, response_1.successResponse)(res, 200, 'Employee retrieved successfully', employee);
        }
        catch (error) {
            logger_1.default.error(`Failed to retrieve employee with ID ${req.params.id}:`, error);
            (0, response_1.errorResponse)(res, 404, error.message);
        }
    }
}
exports.default = new EmployeeController();
