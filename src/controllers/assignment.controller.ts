import { Request, Response } from 'express';
import { successResponse, errorResponse } from '../utils/response';
import logger from '../utils/logger';
import AssignmentService from '../services/assignment.service';
import { AuthenticatedRequest } from '../types';

export class AssignmentController {

    async assignAsset(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.user?.id;
            const newAssignment = await AssignmentService.assignAsset(req.body, userId);
            successResponse(res, 201, 'Asset assigned successfully', newAssignment);
        } catch (error: any) {
            logger.error('Failed to assign asset:', error);
            errorResponse(res, 400, `Failed to assign asset: ${error.message}`);
        }
    }

    async returnAsset(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            const { id } = req.params;
            const returnedAssignment = await AssignmentService.returnAsset(Number(id), userId);
            if (!returnedAssignment) {
                return errorResponse(res, 404, 'Assignment not found');
            }
            successResponse(res, 200, 'Asset returned successfully', returnedAssignment);
        } catch (error: any) {
            logger.error(`Failed to return asset with assignment ID ${req.params.id}:`, error);
            errorResponse(res, 500, 'Failed to return asset');
        }
    }

    async getAll(req: Request, res: Response) {
        try {
            const assignments = await AssignmentService.getAll();
            logger.info('All assignments retrieved successfully');
            successResponse(res, 200, 'Assignments retrieved successfully', assignments);
        } catch (error) {
            logger.error(`Failed to retrieve assignments: ${(error as Error).message}`, { error });
            errorResponse(res, 500, (error as Error).message);
        }
    }

    async getById(req: Request, res: Response) {
        try {
            const assignment = await AssignmentService.getById(Number(req.params.id));
            successResponse(res, 200, 'Assignment retrieved successfully', assignment);
        } catch (error) {
          logger.error(`Failed to retrieve assignment with ID ${req.params.id}:`, error);
            errorResponse(res, 404, (error as Error).message);
        }
    }

    async update(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.user?.id;
            const updatedAssignment = await AssignmentService.update(Number(req.params.id), req.body, userId);
            successResponse(res, 200, 'Assignment updated successfully', updatedAssignment);
        } catch (error) {
          logger.error(`Failed to update assignment with ID ${req.params.id}:`, error);
            errorResponse(res, 404, (error as Error).message);
        }
    }

    async delete(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.user?.id;
            const result = await AssignmentService.delete(Number(req.params.id), userId);
            successResponse(res, 200, result.message);
        } catch (error) {
          logger.error(`Failed to delete assignment with ID ${req.params.id}:`, error);
            errorResponse(res, 404, (error as Error).message);
        }
    }
}

export default new AssignmentController();