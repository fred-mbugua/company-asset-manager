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
}

export default new BranchController();