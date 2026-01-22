import BranchModel, { IBranch, IBranchWithChildren } from '../models/branch.model';
import logger from '../utils/logger';
import ActionLogService from './actionLog.service';

class BranchService {
    async create(branchData: any, userId: number) {
        const newBranch = await BranchModel.create(branchData);
        await ActionLogService.logAction(
            userId, // User ID who performed the action
            'CREATE',
            'Branch',
            newBranch.id,
            { branch_name: newBranch.name }
        );
        logger.info(`Branch created successfully: ${newBranch.name}`);
        return newBranch;
    }

    async findAll() {
        const branches = await BranchModel.findAll();
        logger.info(`Retrieved ${branches.length} branches.`);
        return branches;
    }

    async findById(id: number) {
        const branch = await BranchModel.findById(id);
        if (!branch) {
            logger.warn(`Branch with ID ${id} not found.`);
        }
        return branch;
    }

    async updateBranch(id: number, branchData: Partial<IBranch>): Promise<IBranch | null> {
        return BranchModel.update(id, branchData);
    }
    
    async deleteBranch(id: number): Promise<boolean> {
        return BranchModel.delete(id);
    }

    // ==================== HIERARCHY METHODS ====================

    /**
     * Get all branches with hierarchy information
     */
    async findAllWithHierarchy(): Promise<IBranch[]> {
        return BranchModel.findAllWithHierarchy();
    }

    /**
     * Get the headquarters branch
     */
    async getHeadquarters(): Promise<IBranch | null> {
        return BranchModel.findHeadquarters();
    }

    /**
     * Get branch hierarchy as a tree structure
     */
    async getHierarchyTree(): Promise<IBranchWithChildren[]> {
        return BranchModel.getHierarchyTree();
    }

    /**
     * Set a branch as headquarters
     */
    async setHeadquarters(branchId: number, userId: number): Promise<IBranch> {
        const branch = await BranchModel.setHeadquarters(branchId);
        
        await ActionLogService.logAction(
            userId,
            'UPDATE',
            'Branch',
            branchId,
            { action: 'set_headquarters', branch_name: branch.name }
        );
        
        logger.info(`Branch ${branch.name} set as headquarters`);
        return branch;
    }

    /**
     * Set parent branch (update hierarchy)
     */
    async setParentBranch(branchId: number, parentId: number | null, userId: number): Promise<IBranch> {
        const branch = await BranchModel.setParent(branchId, parentId);
        
        await ActionLogService.logAction(
            userId,
            'UPDATE',
            'Branch',
            branchId,
            { action: 'set_parent', parent_id: parentId }
        );
        
        logger.info(`Branch ${branchId} parent set to ${parentId}`);
        return branch;
    }

    /**
     * Get all branch IDs that a user can access based on their branch
     */
    async getAccessibleBranchIds(userBranchId: number): Promise<number[]> {
        return BranchModel.getAccessibleBranchIds(userBranchId);
    }

    /**
     * Check if a user's branch can access a target branch's data
     */
    async canAccessBranch(userBranchId: number, targetBranchId: number): Promise<boolean> {
        return BranchModel.canAccessBranch(userBranchId, targetBranchId);
    }

    /**
     * Get direct children of a branch
     */
    async getChildren(branchId: number): Promise<IBranch[]> {
        return BranchModel.getChildren(branchId);
    }

    /**
     * Get all descendant branch IDs
     */
    async getDescendantIds(branchId: number): Promise<number[]> {
        return BranchModel.getDescendantIds(branchId);
    }

    /**
     * Update entire hierarchy structure
     * @param hierarchy Array of { branch_id, parent_id } objects
     */
    async updateHierarchy(hierarchy: { branch_id: number; parent_id: number | null }[], userId: number): Promise<void> {
        for (const item of hierarchy) {
            await BranchModel.setParent(item.branch_id, item.parent_id);
        }
        
        await ActionLogService.logAction(
            userId,
            'UPDATE',
            'Branch',
            0,
            { action: 'update_hierarchy', changes_count: hierarchy.length }
        );
        
        logger.info(`Branch hierarchy updated with ${hierarchy.length} changes`);
    }
}

export default new BranchService();