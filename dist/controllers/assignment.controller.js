"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssignmentController = void 0;
const response_1 = require("../utils/response");
const logger_1 = __importDefault(require("../utils/logger"));
const assignment_service_1 = __importDefault(require("../services/assignment.service"));
class AssignmentController {
    async assignAsset(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const newAssignment = await assignment_service_1.default.assignAsset(req.body, userId);
            (0, response_1.successResponse)(res, 201, 'Asset assigned successfully', newAssignment);
        }
        catch (error) {
            logger_1.default.error('Failed to assign asset:', error);
            (0, response_1.errorResponse)(res, 400, `Failed to assign asset: ${error.message}`);
        }
    }
    async returnAsset(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const { id } = req.params;
            const returnedAssignment = await assignment_service_1.default.returnAsset(Number(id), userId);
            if (!returnedAssignment) {
                return (0, response_1.errorResponse)(res, 404, 'Assignment not found');
            }
            (0, response_1.successResponse)(res, 200, 'Asset returned successfully', returnedAssignment);
        }
        catch (error) {
            logger_1.default.error(`Failed to return asset with assignment ID ${req.params.id}:`, error);
            (0, response_1.errorResponse)(res, 500, 'Failed to return asset');
        }
    }
    async getAll(req, res) {
        try {
            const assignments = await assignment_service_1.default.getAll();
            logger_1.default.info('All assignments retrieved successfully');
            (0, response_1.successResponse)(res, 200, 'Assignments retrieved successfully', assignments);
        }
        catch (error) {
            logger_1.default.error(`Failed to retrieve assignments: ${error.message}`, { error });
            (0, response_1.errorResponse)(res, 500, error.message);
        }
    }
    async getById(req, res) {
        try {
            const assignment = await assignment_service_1.default.getById(Number(req.params.id));
            (0, response_1.successResponse)(res, 200, 'Assignment retrieved successfully', assignment);
        }
        catch (error) {
            logger_1.default.error(`Failed to retrieve assignment with ID ${req.params.id}:`, error);
            (0, response_1.errorResponse)(res, 404, error.message);
        }
    }
    async update(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const updatedAssignment = await assignment_service_1.default.update(Number(req.params.id), req.body, userId);
            (0, response_1.successResponse)(res, 200, 'Assignment updated successfully', updatedAssignment);
        }
        catch (error) {
            logger_1.default.error(`Failed to update assignment with ID ${req.params.id}:`, error);
            (0, response_1.errorResponse)(res, 404, error.message);
        }
    }
    async delete(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const result = await assignment_service_1.default.delete(Number(req.params.id), userId);
            (0, response_1.successResponse)(res, 200, result.message);
        }
        catch (error) {
            logger_1.default.error(`Failed to delete assignment with ID ${req.params.id}:`, error);
            (0, response_1.errorResponse)(res, 404, error.message);
        }
    }
}
exports.AssignmentController = AssignmentController;
exports.default = new AssignmentController();
