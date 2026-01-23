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
    // ==================== HIERARCHY ENDPOINTS ====================
    /**
     * Get all branches with hierarchy information
     */
    async getHierarchy(req, res) {
        try {
            const branches = await branch_service_1.default.findAllWithHierarchy();
            (0, response_1.successResponse)(res, 200, 'Branch hierarchy retrieved successfully', branches);
        }
        catch (error) {
            logger_1.default.error(`Failed to retrieve branch hierarchy: ${error.message}`);
            (0, response_1.errorResponse)(res, 500, 'Failed to retrieve branch hierarchy');
        }
    }
    /**
     * Get branch hierarchy as a tree structure
     */
    async getHierarchyTree(req, res) {
        try {
            const tree = await branch_service_1.default.getHierarchyTree();
            (0, response_1.successResponse)(res, 200, 'Branch hierarchy tree retrieved successfully', tree);
        }
        catch (error) {
            logger_1.default.error(`Failed to retrieve branch hierarchy tree: ${error.message}`);
            (0, response_1.errorResponse)(res, 500, 'Failed to retrieve branch hierarchy tree');
        }
    }
    /**
     * Get headquarters branch
     */
    async getHeadquarters(req, res) {
        try {
            const hq = await branch_service_1.default.getHeadquarters();
            (0, response_1.successResponse)(res, 200, 'Headquarters retrieved successfully', hq);
        }
        catch (error) {
            logger_1.default.error(`Failed to retrieve headquarters: ${error.message}`);
            (0, response_1.errorResponse)(res, 500, 'Failed to retrieve headquarters');
        }
    }
    /**
     * Set a branch as headquarters
     */
    async setHeadquarters(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                (0, response_1.errorResponse)(res, 401, 'Unauthorized');
                return;
            }
            const branchId = parseInt(req.params.id);
            const branch = await branch_service_1.default.setHeadquarters(branchId, userId);
            (0, response_1.successResponse)(res, 200, 'Headquarters set successfully', branch);
        }
        catch (error) {
            logger_1.default.error(`Failed to set headquarters: ${error.message}`);
            (0, response_1.errorResponse)(res, 400, error.message);
        }
    }
    /**
     * Set parent branch for a branch
     */
    async setParent(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                (0, response_1.errorResponse)(res, 401, 'Unauthorized');
                return;
            }
            const branchId = parseInt(req.params.id);
            const { parent_id } = req.body;
            const branch = await branch_service_1.default.setParentBranch(branchId, parent_id !== undefined ? parent_id : null, userId);
            (0, response_1.successResponse)(res, 200, 'Branch parent updated successfully', branch);
        }
        catch (error) {
            logger_1.default.error(`Failed to set branch parent: ${error.message}`);
            (0, response_1.errorResponse)(res, 400, error.message);
        }
    }
    /**
     * Update entire hierarchy structure
     */
    async updateHierarchy(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                (0, response_1.errorResponse)(res, 401, 'Unauthorized');
                return;
            }
            const { hierarchy } = req.body;
            if (!hierarchy || !Array.isArray(hierarchy)) {
                (0, response_1.errorResponse)(res, 400, 'Hierarchy array is required');
                return;
            }
            await branch_service_1.default.updateHierarchy(hierarchy, userId);
            (0, response_1.successResponse)(res, 200, 'Branch hierarchy updated successfully', null);
        }
        catch (error) {
            logger_1.default.error(`Failed to update hierarchy: ${error.message}`);
            (0, response_1.errorResponse)(res, 400, error.message);
        }
    }
    /**
     * Get accessible branches for a user based on their branch
     */
    async getAccessibleBranches(req, res) {
        var _a;
        try {
            const userBranchId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.branch_id;
            if (!userBranchId) {
                // If no branch assigned, return empty array
                (0, response_1.successResponse)(res, 200, 'Accessible branches retrieved', []);
                return;
            }
            const branchIds = await branch_service_1.default.getAccessibleBranchIds(userBranchId);
            (0, response_1.successResponse)(res, 200, 'Accessible branches retrieved', branchIds);
        }
        catch (error) {
            logger_1.default.error(`Failed to get accessible branches: ${error.message}`);
            (0, response_1.errorResponse)(res, 500, 'Failed to get accessible branches');
        }
    }
    /**
     * Get children of a branch
     */
    async getChildren(req, res) {
        try {
            const branchId = parseInt(req.params.id);
            const children = await branch_service_1.default.getChildren(branchId);
            (0, response_1.successResponse)(res, 200, 'Children retrieved successfully', children);
        }
        catch (error) {
            logger_1.default.error(`Failed to get branch children: ${error.message}`);
            (0, response_1.errorResponse)(res, 500, 'Failed to get branch children');
        }
    }
}
exports.default = new BranchController();
