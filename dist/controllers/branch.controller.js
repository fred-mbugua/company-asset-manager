"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const branch_service_1 = __importDefault(require("../services/branch.service"));
const response_1 = require("../utils/response");
const logger_1 = __importDefault(require("../utils/logger"));
class BranchController {
    async create(req, res) {
        var _a;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Get the user ID from the request
        try {
            const newBranch = await branch_service_1.default.create(req.body, userId);
            (0, response_1.successResponse)(res, 201, 'Branch created successfully', newBranch);
        }
        catch (error) {
            logger_1.default.error(`Failed to create branch: ${error.message}`);
            (0, response_1.errorResponse)(res, 400, error.message);
        }
    }
    async findAll(req, res) {
        try {
            const branches = await branch_service_1.default.findAll();
            (0, response_1.successResponse)(res, 200, 'Branches retrieved successfully', branches);
        }
        catch (error) {
            logger_1.default.error(`Failed to retrieve branches: ${error.message}`);
            (0, response_1.errorResponse)(res, 500, 'Failed to retrieve branches');
        }
    }
    /**
     * API: Getting a single branch by ID. (..for populating the Edit modal)
     */
    async getBranchById(req, res) {
        try {
            const id = parseInt(req.params.id);
            const branch = await branch_service_1.default.findById(id);
            if (!branch) {
                (0, response_1.errorResponse)(res, 404, 'Branch not found.');
            }
            (0, response_1.successResponse)(res, 200, 'Branch retrieved successfully.', branch);
        }
        catch (error) {
            logger_1.default.error(`Failed to retrieve branch: ${error.message}`);
            (0, response_1.errorResponse)(res, 500, 'Failed to retrieve branch.');
        }
    }
    /**
     * API: Updating an existing branch.
     */
    async updateBranch(req, res) {
        try {
            const id = parseInt(req.params.id);
            const branchData = req.body;
            const updatedBranch = await branch_service_1.default.updateBranch(id, branchData);
            if (!updatedBranch) {
                (0, response_1.errorResponse)(res, 404, 'Branch not found.');
            }
            (0, response_1.successResponse)(res, 200, 'Branch updated successfully.', updatedBranch);
        }
        catch (error) {
            logger_1.default.error(`Failed to update branch: ${error.message}`);
            (0, response_1.errorResponse)(res, 500, 'Failed to update branch.');
        }
    }
    /**
     * API: Deleting a branch.
     */
    async deleteBranch(req, res) {
        try {
            const id = parseInt(req.params.id);
            const success = await branch_service_1.default.deleteBranch(id);
            if (!success) {
                (0, response_1.errorResponse)(res, 404, 'Branch not found or deletion failed.');
                return;
            }
            (0, response_1.successResponse)(res, 200, 'Branch deleted successfully.', null);
        }
        catch (error) {
            logger_1.default.error(`Failed to delete branch: ${error.message}`);
            (0, response_1.errorResponse)(res, 500, 'Failed to delete branch.');
        }
    }
}
exports.default = new BranchController();
