import { Request, Response } from 'express';
import { AssetStatusService } from '../services';

/**
 * Controller class for handling Asset Status operations.
 */
export default new class AssetStatusController {

    /**
     * Handles the creation of a new asset status.
     */
    async createAssetStatus(req: Request, res: Response): Promise<void> {
        const { name, is_available, description } = req.body;

        if (!name || typeof name !== 'string' || name.trim() === '') {
            res.status(400).json({ success: false, message: 'Asset status name is required.' });
            return;
        }

        try {
            const newStatus = await AssetStatusService.createStatus({ 
                name: name.trim(), 
                is_available, 
                description 
            });
            
            res.status(201).json({ 
                success: true, 
                message: 'Asset status created successfully.', 
                data: newStatus 
            });
        } catch (error: any) {
            // Handle the specific duplication error
            if (error.message.startsWith('Duplicate asset status:')) {
                res.status(409).json({ success: false, message: error.message });
                return;
            }
            res.status(500).json({ success: false, message: 'Failed to create asset status.' });
        }
    }

    /**
     * Retrieves all asset statuses.
     */
    async getAllAssetStatuses(req: Request, res: Response): Promise<void> {
        try {
            const assetStatuses = await AssetStatusService.findAll();
            res.status(200).json({ success: true, data: assetStatuses });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Failed to retrieve asset statuses.' });
        }
    }

    /**
     * Retrieves a single asset status by ID.
     */
    async getAssetStatusById(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            const status = await AssetStatusService.findById(id);
            res.status(200).json({ success: true, data: status });
        } catch (error: any) {
            res.status(404).json({ success: false, message: error.message });
        }
    }

    /**
     * Updates an asset status.
     */
    async updateAssetStatus(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            const { name, is_available, description } = req.body;
            const updated = await AssetStatusService.update(id, { name, is_available, description });
            res.status(200).json({ success: true, message: 'Asset status updated successfully.', data: updated });
        } catch (error: any) {
            if (error.message.startsWith('Duplicate asset status:')) {
                res.status(409).json({ success: false, message: error.message });
                return;
            }
            res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
     * Deletes an asset status.
     */
    async deleteAssetStatus(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            await AssetStatusService.delete(id);
            res.status(200).json({ success: true, message: 'Asset status deleted successfully.' });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}