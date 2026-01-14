import { Request, Response } from 'express';
import RepairRequestTypeService from '../services/repairRequestType.service';
import { successResponse, errorResponse } from '../utils/response';
import logger from '../utils/logger';
import { AuthenticatedRequest } from '../types';

/**
 * Controller for Repair Request Type management
 */
class RepairRequestTypeController {
    /**
     * Create a new repair request type
     */
    async create(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { name, description, is_active } = req.body;

            if (!name || typeof name !== 'string' || name.trim() === '') {
                res.status(400).json({ success: false, message: 'Type name is required.' });
                return;
            }

            const type = await RepairRequestTypeService.create(
                { name: name.trim(), description, is_active },
                req.user?.id
            );

            res.status(201).json({
                success: true,
                message: 'Repair request type created successfully.',
                data: type
            });
        } catch (error: any) {
            logger.error('Error creating repair request type:', error);
            if (error.message.startsWith('Duplicate')) {
                res.status(409).json({ success: false, message: error.message });
                return;
            }
            res.status(500).json({ success: false, message: 'Failed to create repair request type.' });
        }
    }

    /**
     * Get all repair request types
     */
    async getAll(req: Request, res: Response): Promise<void> {
        try {
            const includeInactive = req.query.include_inactive === 'true';
            const types = await RepairRequestTypeService.findAll(includeInactive);
            res.status(200).json({ success: true, data: types });
        } catch (error: any) {
            logger.error('Error getting repair request types:', error);
            res.status(500).json({ success: false, message: 'Failed to retrieve repair request types.' });
        }
    }

    /**
     * Get a single repair request type by ID
     */
    async getById(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            const type = await RepairRequestTypeService.findById(id);

            if (!type) {
                res.status(404).json({ success: false, message: 'Repair request type not found.' });
                return;
            }

            res.status(200).json({ success: true, data: type });
        } catch (error: any) {
            logger.error('Error getting repair request type:', error);
            res.status(500).json({ success: false, message: 'Failed to retrieve repair request type.' });
        }
    }

    /**
     * Update a repair request type
     */
    async update(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            const { name, description, is_active } = req.body;

            const type = await RepairRequestTypeService.update(
                id,
                { name, description, is_active },
                req.user?.id
            );

            res.status(200).json({
                success: true,
                message: 'Repair request type updated successfully.',
                data: type
            });
        } catch (error: any) {
            logger.error('Error updating repair request type:', error);
            if (error.message.startsWith('Duplicate')) {
                res.status(409).json({ success: false, message: error.message });
                return;
            }
            res.status(500).json({ success: false, message: error.message || 'Failed to update repair request type.' });
        }
    }

    /**
     * Delete a repair request type
     */
    async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            await RepairRequestTypeService.delete(id, req.user?.id);
            res.status(200).json({ success: true, message: 'Repair request type deleted successfully.' });
        } catch (error: any) {
            logger.error('Error deleting repair request type:', error);
            res.status(500).json({ success: false, message: error.message || 'Failed to delete repair request type.' });
        }
    }

    /**
     * Toggle active status
     */
    async toggleActive(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            const type = await RepairRequestTypeService.toggleActive(id, req.user?.id);
            res.status(200).json({
                success: true,
                message: `Repair request type ${type.is_active ? 'activated' : 'deactivated'} successfully.`,
                data: type
            });
        } catch (error: any) {
            logger.error('Error toggling repair request type:', error);
            res.status(500).json({ success: false, message: error.message || 'Failed to toggle repair request type.' });
        }
    }
}

export default new RepairRequestTypeController();
