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
    /**
     * Retrieves a single asset status by ID.
     */
    async getAssetStatusById(req, res) {
        try {
            const id = parseInt(req.params.id);
            const status = await services_1.AssetStatusService.findById(id);
            res.status(200).json({ success: true, data: status });
        }
        catch (error) {
            res.status(404).json({ success: false, message: error.message });
        }
    }
    /**
     * Updates an asset status.
     */
    async updateAssetStatus(req, res) {
        try {
            const id = parseInt(req.params.id);
            const { name, is_available, description } = req.body;
            const updated = await services_1.AssetStatusService.update(id, { name, is_available, description });
            res.status(200).json({ success: true, message: 'Asset status updated successfully.', data: updated });
        }
        catch (error) {
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
    async deleteAssetStatus(req, res) {
        try {
            const id = parseInt(req.params.id);
            await services_1.AssetStatusService.delete(id);
            res.status(200).json({ success: true, message: 'Asset status deleted successfully.' });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};
