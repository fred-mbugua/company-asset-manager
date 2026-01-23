"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const branch_model_1 = __importDefault(require("../models/branch.model"));
const logger_1 = __importDefault(require("../utils/logger"));
const actionLog_service_1 = __importDefault(require("./actionLog.service"));
class BranchService {
    async create(branchData, userId) {
        const newBranch = await branch_model_1.default.create(branchData);
        await actionLog_service_1.default.logAction(userId, // User ID who performed the action
        'CREATE', 'Branch', newBranch.id, { branch_name: newBranch.name });
        logger_1.default.info(`Branch created successfully: ${newBranch.name}`);
        return newBranch;
    }
    async findAll() {
        const branches = await branch_model_1.default.findAll();
        logger_1.default.info(`Retrieved ${branches.length} branches.`);
        return branches;
    }
    async findById(id) {
        const branch = await branch_model_1.default.findById(id);
        if (!branch) {
            logger_1.default.warn(`Branch with ID ${id} not found.`);
        }
        return branch;
    }
    async updateBranch(id, branchData) {
        return branch_model_1.default.update(id, branchData);
    }
    async deleteBranch(id) {
        return branch_model_1.default.delete(id);
    }
    // ==================== HIERARCHY METHODS ====================
    /**
     * Get all branches with hierarchy information
     */
    async findAllWithHierarchy() {
        return branch_model_1.default.findAllWithHierarchy();
    }
    /**
     * Get the headquarters branch
     */
    async getHeadquarters() {
        return branch_model_1.default.findHeadquarters();
    }
    /**
     * Get branch hierarchy as a tree structure
     */
    async getHierarchyTree() {
        return branch_model_1.default.getHierarchyTree();
    }
    /**
     * Set a branch as headquarters
     */
    async setHeadquarters(branchId, userId) {
        const branch = await branch_model_1.default.setHeadquarters(branchId);
        await actionLog_service_1.default.logAction(userId, 'UPDATE', 'Branch', branchId, { action: 'set_headquarters', branch_name: branch.name });
        logger_1.default.info(`Branch ${branch.name} set as headquarters`);
        return branch;
    }
    /**
     * Set parent branch (update hierarchy)
     */
    async setParentBranch(branchId, parentId, userId) {
        const branch = await branch_model_1.default.setParent(branchId, parentId);
        await actionLog_service_1.default.logAction(userId, 'UPDATE', 'Branch', branchId, { action: 'set_parent', parent_id: parentId });
        logger_1.default.info(`Branch ${branchId} parent set to ${parentId}`);
        return branch;
    }
    /**
     * Get all branch IDs that a user can access based on their branch
     */
    async getAccessibleBranchIds(userBranchId) {
        return branch_model_1.default.getAccessibleBranchIds(userBranchId);
    }
    /**
     * Check if a user's branch can access a target branch's data
     */
    async canAccessBranch(userBranchId, targetBranchId) {
        return branch_model_1.default.canAccessBranch(userBranchId, targetBranchId);
    }
    /**
     * Get direct children of a branch
     */
    async getChildren(branchId) {
        return branch_model_1.default.getChildren(branchId);
    }
    /**
     * Get all descendant branch IDs
     */
    async getDescendantIds(branchId) {
        return branch_model_1.default.getDescendantIds(branchId);
    }
    /**
     * Update entire hierarchy structure
     * @param hierarchy Array of { branch_id, parent_id } objects
     */
    async updateHierarchy(hierarchy, userId) {
        for (const item of hierarchy) {
            await branch_model_1.default.setParent(item.branch_id, item.parent_id);
        }
        await actionLog_service_1.default.logAction(userId, 'UPDATE', 'Branch', 0, { action: 'update_hierarchy', changes_count: hierarchy.length });
        logger_1.default.info(`Branch hierarchy updated with ${hierarchy.length} changes`);
    }
}
exports.default = new BranchService();
