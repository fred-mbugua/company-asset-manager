import { Request, Response } from 'express';
import RepairRequestStatusService from '../services/repairRequestStatus.service';
import { successResponse, errorResponse } from '../utils/response';
import logger from '../utils/logger';
import { AuthenticatedRequest } from '../types';

/**
 * Controller for Repair Request Status management
 */
class RepairRequestStatusController {
    /**
     * Create a new repair request status
     */
    async create(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { name, description, color_code, display_order, is_active, is_terminal } = req.body;

            if (!name || typeof name !== 'string' || name.trim() === '') {
                res.status(400).json({ success: false, message: 'Status name is required.' });
                return;
            }

            const status = await RepairRequestStatusService.create(
                { name: name.trim(), description, color_code, display_order, is_active, is_terminal },
                req.user?.id
            );

            res.status(201).json({
                success: true,
                message: 'Repair request status created successfully.',
                data: status
            });
        } catch (error: any) {
            logger.error('Error creating repair request status:', error);
            if (error.message.startsWith('Duplicate')) {
                res.status(409).json({ success: false, message: error.message });
                return;
            }
            res.status(500).json({ success: false, message: 'Failed to create repair request status.' });
        }
    }

    /**
     * Get all repair request statuses
     */
    async getAll(req: Request, res: Response): Promise<void> {
        try {
            const includeInactive = req.query.include_inactive === 'true';
            const statuses = await RepairRequestStatusService.findAll(includeInactive);
            res.status(200).json({ success: true, data: statuses });
        } catch (error: any) {
            logger.error('Error getting repair request statuses:', error);
            res.status(500).json({ success: false, message: 'Failed to retrieve repair request statuses.' });
        }
    }

    /**
     * Get a single repair request status by ID
     */
    async getById(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            const status = await RepairRequestStatusService.findById(id);

            if (!status) {
                res.status(404).json({ success: false, message: 'Repair request status not found.' });
                return;
            }

            res.status(200).json({ success: true, data: status });
        } catch (error: any) {
            logger.error('Error getting repair request status:', error);
            res.status(500).json({ success: false, message: 'Failed to retrieve repair request status.' });
        }
    }

    /**
     * Update a repair request status
     */
    async update(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            const { name, description, color_code, display_order, is_active, is_terminal } = req.body;

            const status = await RepairRequestStatusService.update(
                id,
                { name, description, color_code, display_order, is_active, is_terminal },
                req.user?.id
            );

            res.status(200).json({
                success: true,
                message: 'Repair request status updated successfully.',
                data: status
            });
        } catch (error: any) {
            logger.error('Error updating repair request status:', error);
            if (error.message.startsWith('Duplicate')) {
                res.status(409).json({ success: false, message: error.message });
                return;
            }
            res.status(500).json({ success: false, message: error.message || 'Failed to update repair request status.' });
        }
    }

    /**
     * Delete a repair request status
     */
    async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            await RepairRequestStatusService.delete(id, req.user?.id);
            res.status(200).json({ success: true, message: 'Repair request status deleted successfully.' });
        } catch (error: any) {
            logger.error('Error deleting repair request status:', error);
            res.status(500).json({ success: false, message: error.message || 'Failed to delete repair request status.' });
        }
    }

    /**
     * Toggle active status
     */
    async toggleActive(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            const status = await RepairRequestStatusService.toggleActive(id, req.user?.id);
            res.status(200).json({
                success: true,
                message: `Repair request status ${status.is_active ? 'activated' : 'deactivated'} successfully.`,
                data: status
            });
        } catch (error: any) {
            logger.error('Error toggling repair request status:', error);
            res.status(500).json({ success: false, message: error.message || 'Failed to toggle repair request status.' });
        }
    }
}

export default new RepairRequestStatusController();
