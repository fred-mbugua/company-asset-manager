import { Request, Response } from 'express';
import RepairRequestPriorityService from '../services/repairRequestPriority.service';
import { successResponse, errorResponse } from '../utils/response';
import logger from '../utils/logger';
import { AuthenticatedRequest } from '../types';

/**
 * Controller for Repair Request Priority management
 */
class RepairRequestPriorityController {
    /**
     * Create a new repair request priority
     */
    async create(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { name, description, color_code, display_order, is_active } = req.body;

            if (!name || typeof name !== 'string' || name.trim() === '') {
                res.status(400).json({ success: false, message: 'Priority name is required.' });
                return;
            }

            const priority = await RepairRequestPriorityService.create(
                { name: name.trim(), description, color_code, display_order, is_active },
                req.user?.id
            );

            res.status(201).json({
                success: true,
                message: 'Repair request priority created successfully.',
                data: priority
            });
        } catch (error: any) {
            logger.error('Error creating repair request priority:', error);
            if (error.message.startsWith('Duplicate')) {
                res.status(409).json({ success: false, message: error.message });
                return;
            }
            res.status(500).json({ success: false, message: 'Failed to create repair request priority.' });
        }
    }

    /**
     * Get all repair request priorities
     */
    async getAll(req: Request, res: Response): Promise<void> {
        try {
            const includeInactive = req.query.include_inactive === 'true';
            const priorities = await RepairRequestPriorityService.findAll(includeInactive);
            res.status(200).json({ success: true, data: priorities });
        } catch (error: any) {
            logger.error('Error getting repair request priorities:', error);
            res.status(500).json({ success: false, message: 'Failed to retrieve repair request priorities.' });
        }
    }

    /**
     * Get a single repair request priority by ID
     */
    async getById(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            const priority = await RepairRequestPriorityService.findById(id);

            if (!priority) {
                res.status(404).json({ success: false, message: 'Repair request priority not found.' });
                return;
            }

            res.status(200).json({ success: true, data: priority });
        } catch (error: any) {
            logger.error('Error getting repair request priority:', error);
            res.status(500).json({ success: false, message: 'Failed to retrieve repair request priority.' });
        }
    }

    /**
     * Update a repair request priority
     */
    async update(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            const { name, description, color_code, display_order, is_active } = req.body;

            const priority = await RepairRequestPriorityService.update(
                id,
                { name, description, color_code, display_order, is_active },
                req.user?.id
            );

            res.status(200).json({
                success: true,
                message: 'Repair request priority updated successfully.',
                data: priority
            });
        } catch (error: any) {
            logger.error('Error updating repair request priority:', error);
            if (error.message.startsWith('Duplicate')) {
                res.status(409).json({ success: false, message: error.message });
                return;
            }
            res.status(500).json({ success: false, message: error.message || 'Failed to update repair request priority.' });
        }
    }

    /**
     * Delete a repair request priority
     */
    async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            await RepairRequestPriorityService.delete(id, req.user?.id);
            res.status(200).json({ success: true, message: 'Repair request priority deleted successfully.' });
        } catch (error: any) {
            logger.error('Error deleting repair request priority:', error);
            res.status(500).json({ success: false, message: error.message || 'Failed to delete repair request priority.' });
        }
    }

    /**
     * Toggle active status
     */
    async toggleActive(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            const priority = await RepairRequestPriorityService.toggleActive(id, req.user?.id);
            res.status(200).json({
                success: true,
                message: `Repair request priority ${priority.is_active ? 'activated' : 'deactivated'} successfully.`,
                data: priority
            });
        } catch (error: any) {
            logger.error('Error toggling repair request priority:', error);
            res.status(500).json({ success: false, message: error.message || 'Failed to toggle repair request priority.' });
        }
    }
}

export default new RepairRequestPriorityController();
