import { Request, Response } from 'express';
import RoleService from '../services/role.service';
import { successResponse, errorResponse } from '../utils/response';
import logger from '../utils/logger';
import { AuthenticatedRequest } from '../types';

class RoleController {
    /**
     * Get all roles
     */
    async getAll(req: Request, res: Response): Promise<void> {
        try {
            const includeInactive = req.query.include_inactive === 'true';
            const roles = await RoleService.findAll(includeInactive);
            
            // Add user count to each role
            const rolesWithCounts = await Promise.all(
                roles.map(async (role) => {
                    const userCount = await RoleService.getUserCount(role.id);
                    return { ...role, user_count: userCount };
                })
            );
            
            successResponse(res, 200, 'Roles retrieved successfully', rolesWithCounts);
        } catch (error: any) {
            logger.error('Error getting roles:', error);
            errorResponse(res, 500, error.message || 'Failed to get roles');
        }
    }

    /**
     * Get a single role
     */
    async getById(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            const role = await RoleService.findById(id);
            
            if (!role) {
                errorResponse(res, 404, 'Role not found');
                return;
            }

            // Get user count
            const userCount = await RoleService.getUserCount(id);

            successResponse(res, 200, 'Role retrieved successfully', { ...role, user_count: userCount });
        } catch (error: any) {
            logger.error('Error getting role:', error);
            errorResponse(res, 500, error.message || 'Failed to get role');
        }
    }

    /**
     * Create a new role
     */
    async create(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            if (!userId) {
                errorResponse(res, 401, 'User not authenticated');
                return;
            }

            const { name, description, is_active } = req.body;

            if (!name) {
                errorResponse(res, 400, 'Role name is required');
                return;
            }

            const role = await RoleService.create({ name, description, is_active }, userId);
            successResponse(res, 201, 'Role created successfully', role);
        } catch (error: any) {
            logger.error('Error creating role:', error);
            errorResponse(res, 400, error.message || 'Failed to create role');
        }
    }

    /**
     * Update a role
     */
    async update(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            if (!userId) {
                errorResponse(res, 401, 'User not authenticated');
                return;
            }

            const id = parseInt(req.params.id);
            const { name, description, is_active } = req.body;

            const role = await RoleService.update(id, { name, description, is_active }, userId);
            successResponse(res, 200, 'Role updated successfully', role);
        } catch (error: any) {
            logger.error('Error updating role:', error);
            errorResponse(res, 400, error.message || 'Failed to update role');
        }
    }

    /**
     * Delete a role
     */
    async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            if (!userId) {
                errorResponse(res, 401, 'User not authenticated');
                return;
            }

            const id = parseInt(req.params.id);
            await RoleService.delete(id, userId);
            successResponse(res, 200, 'Role deleted successfully');
        } catch (error: any) {
            logger.error('Error deleting role:', error);
            errorResponse(res, 400, error.message || 'Failed to delete role');
        }
    }

    /**
     * Toggle role active status
     */
    async toggleActive(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            if (!userId) {
                errorResponse(res, 401, 'User not authenticated');
                return;
            }

            const id = parseInt(req.params.id);
            const role = await RoleService.toggleActive(id, userId);
            successResponse(res, 200, `Role ${role.is_active ? 'activated' : 'deactivated'} successfully`, role);
        } catch (error: any) {
            logger.error('Error toggling role status:', error);
            errorResponse(res, 400, error.message || 'Failed to toggle role status');
        }
    }
}

export default new RoleController();
