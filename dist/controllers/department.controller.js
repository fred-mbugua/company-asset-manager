"use strict";
// src/controllers/department.controller.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepartmentController = void 0;
const services_1 = require("../services");
const response_1 = require("../utils/response");
const logger_1 = __importDefault(require("../utils/logger"));
class DepartmentController {
    /**
     * Creates a new department.
     */
    async create(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const newDepartment = await services_1.DepartmentService.create(req.body, userId);
            logger_1.default.info(`Department created successfully: ${newDepartment.name}`);
            (0, response_1.successResponse)(res, 201, 'Department created successfully', newDepartment);
        }
        catch (error) {
            logger_1.default.error('Failed to create department:', error);
            (0, response_1.errorResponse)(res, 400, error.message);
        }
    }
    /**
     * Retrieves a list of all departments.
     */
    async getAll(req, res) {
        try {
            const departments = await services_1.DepartmentService.getAll();
            logger_1.default.info('All departments retrieved successfully');
            (0, response_1.successResponse)(res, 200, 'Departments retrieved successfully', departments);
        }
        catch (error) {
            logger_1.default.error(`Failed to retrieve departments: ${error.message}`, { error });
            (0, response_1.errorResponse)(res, 500, error.message);
        }
    }
    /**
     * Retrieves a single department by its ID.
     */
    async getById(req, res) {
        try {
            const department = await services_1.DepartmentService.getById(Number(req.params.id));
            logger_1.default.info(`Department retrieved successfully: ${department.id}`);
            (0, response_1.successResponse)(res, 200, 'Department retrieved successfully', department);
        }
        catch (error) {
            logger_1.default.error(`Failed to retrieve department with ID ${req.params.id}:`, error);
            (0, response_1.errorResponse)(res, 404, error.message);
        }
    }
    /**
     * Updates an existing department's details.
     */
    async update(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const departmentId = Number(req.params.id);
            const updateData = req.body;
            const updatedDepartment = await services_1.DepartmentService.updateDepartment(departmentId, userId, updateData);
            logger_1.default.info(`Department updated successfully: ${updatedDepartment === null || updatedDepartment === void 0 ? void 0 : updatedDepartment.name}`);
            (0, response_1.successResponse)(res, 200, 'Department updated successfully', updatedDepartment);
        }
        catch (error) {
            logger_1.default.error(`Failed to update department with ID ${req.params.id}: ${error.message}`, { error });
            (0, response_1.errorResponse)(res, 404, error.message);
        }
    }
    /**
     * Deletes a department.
     */
    async delete(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const departmentId = Number(req.params.id);
            const result = await services_1.DepartmentService.delete(departmentId, userId);
            logger_1.default.info(`Department deleted successfully with ID: ${departmentId}`);
            (0, response_1.successResponse)(res, 200, result.message);
        }
        catch (error) {
            logger_1.default.error(`Failed to delete department with ID ${req.params.id}: ${error.message}`, { error });
            (0, response_1.errorResponse)(res, 404, error.message);
        }
    }
}
exports.DepartmentController = DepartmentController;
exports.default = new DepartmentController();
