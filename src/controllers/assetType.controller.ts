import { Request, Response } from 'express';
import { AssetTypeService } from '../services';

/**
 * Controller class for handling Asset Type operations.
 */
export default new class AssetTypeController {

    /**
     * Handles the creation of a new asset type.
     */
    async createAssetType(req: Request, res: Response): Promise<void> {
        const { name, description } = req.body;

        if (!name || typeof name !== 'string' || name.trim() === '') {
            res.status(400).json({ success: false, message: 'Asset type name is required and must be valid text.' });
            return;
        }

        try {
            const newAssetType = await AssetTypeService.createType({ name: name.trim(), description });
            
            res.status(201).json({ 
                success: true, 
                message: 'Asset type created successfully.', 
                data: newAssetType 
            });
        } catch (error: any) {
            // Handle the specific duplication error message from the Service layer
            if (error.message.startsWith('Duplicate asset type:')) {
                res.status(409).json({ 
                    success: false, 
                    message: error.message 
                });
                return;
            }
            res.status(500).json({ success: false, message: 'Failed to create asset type due to a server error.' });
        }
    }

    /**
     * Retrieves all asset types.
     */
    async getAllAssetTypes(req: Request, res: Response): Promise<void> {
        try {
            const assetTypes = await AssetTypeService.findAll();
            res.status(200).json({ success: true, data: assetTypes });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Failed to retrieve asset types.' });
        }
    }

    /**
     * Retrieves a single asset type by ID.
     */
    async getAssetTypeById(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            const type = await AssetTypeService.findById(id);
            res.status(200).json({ success: true, data: type });
        } catch (error: any) {
            res.status(404).json({ success: false, message: error.message });
        }
    }

    /**
     * Updates an asset type.
     */
    async updateAssetType(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            const { name, description } = req.body;
            const updated = await AssetTypeService.update(id, { name, description });
            res.status(200).json({ success: true, message: 'Asset type updated successfully.', data: updated });
        } catch (error: any) {
            if (error.message.startsWith('Duplicate asset type:')) {
                res.status(409).json({ success: false, message: error.message });
                return;
            }
            res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
     * Deletes an asset type.
     */
    async deleteAssetType(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            await AssetTypeService.delete(id);
            res.status(200).json({ success: true, message: 'Asset type deleted successfully.' });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}