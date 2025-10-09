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
}