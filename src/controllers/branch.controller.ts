import { Request, Response } from 'express';
import BranchService from '../services/branch.service';
import { IBranch } from '../models/branch.model';
import { successResponse, errorResponse } from '../utils/response';
import logger from '../utils/logger';

class BranchController {
    async create(req: Request, res: Response) {
        const userId = req.user?.id; // Get the user ID from the request
        try {
            const newBranch = await BranchService.create(req.body, userId);
            successResponse(res, 201, 'Branch created successfully', newBranch);
        } catch (error) {
            logger.error(`Failed to create branch: ${(error as Error).message}`);
            errorResponse(res, 400, (error as Error).message);
        }
    }

    async findAll(req: Request, res: Response) {
        try {
            const branches = await BranchService.findAll();
            successResponse(res, 200, 'Branches retrieved successfully', branches);
        } catch (error) {
            logger.error(`Failed to retrieve branches: ${(error as Error).message}`);
            errorResponse(res, 500, 'Failed to retrieve branches');
        }
    }

    /**
     * API: Getting a single branch by ID. (..for populating the Edit modal)
     */
    async getBranchById(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            const branch = await BranchService.findById(id);
            if (!branch) {
                errorResponse(res, 404, 'Branch not found.');
            }
            successResponse(res, 200, 'Branch retrieved successfully.', branch);
        } catch (error) {
            logger.error(`Failed to retrieve branch: ${(error as Error).message}`);
            errorResponse(res, 500, 'Failed to retrieve branch.');
        }
    }

    /**
     * API: Updating an existing branch.
     */
    async updateBranch(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            const branchData = req.body as Partial<IBranch>;
            const updatedBranch = await BranchService.updateBranch(id, branchData);

            if (!updatedBranch) {
                errorResponse(res, 404, 'Branch not found.');
            }
            successResponse(res, 200, 'Branch updated successfully.', updatedBranch);
        } catch (error) {
            logger.error(`Failed to update branch: ${(error as Error).message}`);
            errorResponse(res, 500, 'Failed to update branch.');
        }
    }

    /**
     * API: Deleting a branch.
     */
    async deleteBranch(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            const success = await BranchService.deleteBranch(id);

            if (!success) {
                errorResponse(res, 404, 'Branch not found or deletion failed.');
                return;
            }
            successResponse(res, 200, 'Branch deleted successfully.', null);
        } catch (error) {
            logger.error(`Failed to delete branch: ${(error as Error).message}`);
            errorResponse(res, 500, 'Failed to delete branch.');
        }
    }

    // ==================== HIERARCHY ENDPOINTS ====================

    /**
     * Get all branches with hierarchy information
     */
    async getHierarchy(req: Request, res: Response): Promise<void> {
        try {
            const branches = await BranchService.findAllWithHierarchy();
            successResponse(res, 200, 'Branch hierarchy retrieved successfully', branches);
        } catch (error) {
            logger.error(`Failed to retrieve branch hierarchy: ${(error as Error).message}`);
            errorResponse(res, 500, 'Failed to retrieve branch hierarchy');
        }
    }

    /**
     * Get branch hierarchy as a tree structure
     */
    async getHierarchyTree(req: Request, res: Response): Promise<void> {
        try {
            const tree = await BranchService.getHierarchyTree();
            successResponse(res, 200, 'Branch hierarchy tree retrieved successfully', tree);
        } catch (error) {
            logger.error(`Failed to retrieve branch hierarchy tree: ${(error as Error).message}`);
            errorResponse(res, 500, 'Failed to retrieve branch hierarchy tree');
        }
    }

    /**
     * Get headquarters branch
     */
    async getHeadquarters(req: Request, res: Response): Promise<void> {
        try {
            const hq = await BranchService.getHeadquarters();
            successResponse(res, 200, 'Headquarters retrieved successfully', hq);
        } catch (error) {
            logger.error(`Failed to retrieve headquarters: ${(error as Error).message}`);
            errorResponse(res, 500, 'Failed to retrieve headquarters');
        }
    }

    /**
     * Set a branch as headquarters
     */
    async setHeadquarters(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            if (!userId) {
                errorResponse(res, 401, 'Unauthorized');
                return;
            }

            const branchId = parseInt(req.params.id);
            const branch = await BranchService.setHeadquarters(branchId, userId);
            successResponse(res, 200, 'Headquarters set successfully', branch);
        } catch (error) {
            logger.error(`Failed to set headquarters: ${(error as Error).message}`);
            errorResponse(res, 400, (error as Error).message);
        }
    }

    /**
     * Set parent branch for a branch
     */
    async setParent(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            if (!userId) {
                errorResponse(res, 401, 'Unauthorized');
                return;
            }

            const branchId = parseInt(req.params.id);
            const { parent_id } = req.body;
            
            const branch = await BranchService.setParentBranch(
                branchId, 
                parent_id !== undefined ? parent_id : null, 
                userId
            );
            successResponse(res, 200, 'Branch parent updated successfully', branch);
        } catch (error) {
            logger.error(`Failed to set branch parent: ${(error as Error).message}`);
            errorResponse(res, 400, (error as Error).message);
        }
    }

    /**
     * Update entire hierarchy structure
     */
    async updateHierarchy(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            if (!userId) {
                errorResponse(res, 401, 'Unauthorized');
                return;
            }

            const { hierarchy } = req.body;
            if (!hierarchy || !Array.isArray(hierarchy)) {
                errorResponse(res, 400, 'Hierarchy array is required');
                return;
            }

            await BranchService.updateHierarchy(hierarchy, userId);
            successResponse(res, 200, 'Branch hierarchy updated successfully', null);
        } catch (error) {
            logger.error(`Failed to update hierarchy: ${(error as Error).message}`);
            errorResponse(res, 400, (error as Error).message);
        }
    }

    /**
     * Get accessible branches for a user based on their branch
     */
    async getAccessibleBranches(req: Request, res: Response): Promise<void> {
        try {
            const userBranchId = req.user?.branch_id;
            if (!userBranchId) {
                // If no branch assigned, return empty array
                successResponse(res, 200, 'Accessible branches retrieved', []);
                return;
            }

            const branchIds = await BranchService.getAccessibleBranchIds(userBranchId);
            successResponse(res, 200, 'Accessible branches retrieved', branchIds);
        } catch (error) {
            logger.error(`Failed to get accessible branches: ${(error as Error).message}`);
            errorResponse(res, 500, 'Failed to get accessible branches');
        }
    }

    /**
     * Get children of a branch
     */
    async getChildren(req: Request, res: Response): Promise<void> {
        try {
            const branchId = parseInt(req.params.id);
            const children = await BranchService.getChildren(branchId);
            successResponse(res, 200, 'Children retrieved successfully', children);
        } catch (error) {
            logger.error(`Failed to get branch children: ${(error as Error).message}`);
            errorResponse(res, 500, 'Failed to get branch children');
        }
    }
}

export default new BranchController();