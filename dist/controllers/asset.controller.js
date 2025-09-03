"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const services_1 = require("../services");
const logger_1 = __importDefault(require("../utils/logger"));
class AssetController {
    async getAssets(req, res) {
        try {
            const assets = await services_1.AssetService.getAssets();
            res.status(200).json(assets);
        }
        catch (error) {
            logger_1.default.error('Failed to get assets:', error);
            res.status(500).json({ error: 'Failed to retrieve assets' });
        }
    }
    async getAssetById(req, res) {
        try {
            const asset = await services_1.AssetService.getAssetById(req.params.id);
            res.status(200).json(asset);
        }
        catch (error) {
            logger_1.default.error(`Asset not found with ID ${req.params.id}:`, error);
            res.status(404).json({ error: error.message });
        }
    }
    async createAsset(req, res) {
        try {
            const newAsset = await services_1.AssetService.createAsset(req.body);
            res.status(201).json(newAsset);
        }
        catch (error) {
            logger_1.default.error('Failed to create asset:', error);
            res.status(400).json({ error: 'Invalid asset data' });
        }
    }
    async updateAsset(req, res) {
        try {
            const updatedAsset = await services_1.AssetService.updateAsset(req.params.id, req.body);
            res.status(200).json(updatedAsset);
        }
        catch (error) {
            logger_1.default.error(`Failed to update asset with ID ${req.params.id}:`, error);
            res.status(400).json({ error: error.message });
        }
    }
    async deleteAsset(req, res) {
        try {
            await services_1.AssetService.deleteAsset(req.params.id);
            res.status(204).send();
        }
        catch (error) {
            logger_1.default.error(`Failed to delete asset with ID ${req.params.id}:`, error);
            res.status(404).json({ error: error.message });
        }
    }
    async searchAssets(req, res) {
        try {
            const assets = await services_1.AssetService.searchAssets(req.query);
            res.status(200).json(assets);
        }
        catch (error) {
            logger_1.default.error('Failed to search assets:', error);
            res.status(500).json({ error: 'Failed to search assets' });
        }
    }
}
exports.default = new AssetController();
