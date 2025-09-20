import { Request, Response } from 'express';
import BranchService from '../services/branch.service';
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
}

export default new BranchController();