import { Request, Response } from 'express';
import { successResponse, errorResponse } from '../utils/response';
import logger from '../utils/logger';
import AssignmentService from '../services/assignment.service';
import AssignmentModel from '../models/assignment.model';
import { AuthenticatedRequest } from '../types';
import { PermissionRequest } from '../middlewares/permission.middleware';
import AccessFilterUtil from '../utils/accessFilter.util';

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
            const returnData = req.body; // Contains return_date and return_notes
            const returnedAssignment = await AssignmentService.returnAsset(Number(id), userId, returnData);
            if (!returnedAssignment) {
                return errorResponse(res, 404, 'Assignment not found');
            }
            successResponse(res, 200, 'Asset returned successfully', returnedAssignment);
        } catch (error: any) {
            logger.error(`Failed to return asset with assignment ID ${req.params.id}:`, error);
            errorResponse(res, 500, error.message || 'Failed to return asset');
        }
    }

    async getAll(req: PermissionRequest, res: Response) {
        try {
            // Build permission context using req.user object
            const permissionContext = await AccessFilterUtil.buildContext(
                req.user,
                { branchLevelAccess: req.permissionContext?.branchLevelAccess || false, userBranchId: req.user?.branch_id || null }
            );

            const assignments = await AssignmentService.getAll(permissionContext);
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

    async getAssetHistory(req: Request, res: Response) {
        try {
            const { assetId } = req.params;
            const history = await AssignmentModel.getAssetHistory(Number(assetId));
            successResponse(res, 200, 'Asset history retrieved successfully', history);
        } catch (error: any) {
            logger.error(`Failed to retrieve asset history for asset ${req.params.assetId}:`, error);
            errorResponse(res, 500, `Failed to retrieve asset history: ${error.message}`);
        }
    }
}

export default new AssignmentController();