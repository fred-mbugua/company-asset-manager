import { Request, Response } from 'express';
import { UserService } from '../services';
import { successResponse, errorResponse } from '../utils/response';
import logger from '../utils/logger';
import { AuthenticatedRequest } from '../types';

class UserController {
    
    async getAll(req: Request, res: Response) {
        try {
            const users = await UserService.getAllUsers();
            logger.info('All users retrieved successfully');
            successResponse(res, 200, 'Users retrieved successfully', users);
        } catch (error) {
            logger.error(`Failed to retrieve users: ${(error as Error).message}`, { error });
            errorResponse(res, 500, (error as Error).message);
        }
    }

    async getById(req: Request, res: Response) {
        try {
            const user = await UserService.getUserById(req.params.id);
            successResponse(res, 200, 'User retrieved successfully', user);
        } catch (error) {
            errorResponse(res, 404, (error as Error).message);
        }
    }

    async update(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.user?.id;
            const updatedUser = await UserService.updateUser(req.params.id, req.body, userId);
            successResponse(res, 200, 'User updated successfully', updatedUser);
        } catch (error) {
            errorResponse(res, 404, (error as Error).message);
        }
    }

    async delete(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.user?.id;
            const result = await UserService.deleteUser(req.params.id, userId);
            successResponse(res, 200, result.message);
        } catch (error) {
            errorResponse(res, 404, (error as Error).message);
        }
    }

    async resetPassword(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.user?.id;
            const { password } = req.body;
            
            if (!password || password.length < 6) {
                return errorResponse(res, 400, 'Password must be at least 6 characters long');
            }

            await UserService.resetPassword(req.params.id, password, userId);
            successResponse(res, 200, 'Password reset successfully');
        } catch (error) {
            logger.error(`Password reset failed: ${(error as Error).message}`, { error });
            errorResponse(res, 500, (error as Error).message);
        }
    }

    async toggleStatus(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.user?.id;
            const { is_active } = req.body;
            
            const result = await UserService.toggleUserStatus(req.params.id, is_active, userId);
            successResponse(res, 200, 'User status updated successfully', result);
        } catch (error) {
            logger.error(`Toggle status failed: ${(error as Error).message}`, { error });
            errorResponse(res, 500, (error as Error).message);
        }
    }
}

export default new UserController();