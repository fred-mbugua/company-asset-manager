"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssignmentController = void 0;
const response_1 = require("../utils/response");
const logger_1 = __importDefault(require("../utils/logger"));
const assignment_service_1 = __importDefault(require("../services/assignment.service"));
const assignment_model_1 = __importDefault(require("../models/assignment.model"));
const accessFilter_util_1 = __importDefault(require("../utils/accessFilter.util"));
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
            const returnData = req.body; // Contains return_date and return_notes
            const returnedAssignment = await assignment_service_1.default.returnAsset(Number(id), userId, returnData);
            if (!returnedAssignment) {
                return (0, response_1.errorResponse)(res, 404, 'Assignment not found');
            }
            (0, response_1.successResponse)(res, 200, 'Asset returned successfully', returnedAssignment);
        }
        catch (error) {
            logger_1.default.error(`Failed to return asset with assignment ID ${req.params.id}:`, error);
            (0, response_1.errorResponse)(res, 500, error.message || 'Failed to return asset');
        }
    }
    async getAll(req, res) {
        var _a, _b;
        try {
            // Build permission context using req.user object
            const permissionContext = await accessFilter_util_1.default.buildContext(req.user, { branchLevelAccess: ((_a = req.permissionContext) === null || _a === void 0 ? void 0 : _a.branchLevelAccess) || false, userBranchId: ((_b = req.user) === null || _b === void 0 ? void 0 : _b.branch_id) || null });
            const assignments = await assignment_service_1.default.getAll(permissionContext);
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
    async getAssetHistory(req, res) {
        try {
            const { assetId } = req.params;
            const history = await assignment_model_1.default.getAssetHistory(Number(assetId));
            (0, response_1.successResponse)(res, 200, 'Asset history retrieved successfully', history);
        }
        catch (error) {
            logger_1.default.error(`Failed to retrieve asset history for asset ${req.params.assetId}:`, error);
            (0, response_1.errorResponse)(res, 500, `Failed to retrieve asset history: ${error.message}`);
        }
    }
}
exports.AssignmentController = AssignmentController;
exports.default = new AssignmentController();
