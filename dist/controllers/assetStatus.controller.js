"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const services_1 = require("../services");
/**
 * Controller class for handling Asset Status operations.
 */
exports.default = new class AssetStatusController {
    /**
     * Handles the creation of a new asset status.
     */
    async createAssetStatus(req, res) {
        const { name, is_available, description } = req.body;
        if (!name || typeof name !== 'string' || name.trim() === '') {
            res.status(400).json({ success: false, message: 'Asset status name is required.' });
            return;
        }
        try {
            const newStatus = await services_1.AssetStatusService.createStatus({
                name: name.trim(),
                is_available,
                description
            });
            res.status(201).json({
                success: true,
                message: 'Asset status created successfully.',
                data: newStatus
            });
        }
        catch (error) {
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
    async getAllAssetStatuses(req, res) {
        try {
            const assetStatuses = await services_1.AssetStatusService.findAll();
            res.status(200).json({ success: true, data: assetStatuses });
        }
        catch (error) {
            res.status(500).json({ success: false, message: 'Failed to retrieve asset statuses.' });
        }
    }
};
