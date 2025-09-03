"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../models");
class AssetService {
    async getAssets() {
        return models_1.AssetModel.findAll();
    }
    async getAssetById(id) {
        const asset = await models_1.AssetModel.findById(id);
        if (!asset) {
            throw new Error('Asset not found');
        }
        return asset;
    }
    async createAsset(assetData) {
        // You can add validation and business logic here before saving
        return models_1.AssetModel.create(assetData);
    }
    async updateAsset(id, assetData) {
        const existingAsset = await models_1.AssetModel.findById(id);
        if (!existingAsset) {
            throw new Error('Asset not found');
        }
        return models_1.AssetModel.update(id, assetData);
    }
    async deleteAsset(id) {
        const existingAsset = await models_1.AssetModel.findById(id);
        if (!existingAsset) {
            throw new Error('Asset not found');
        }
        return models_1.AssetModel.delete(id);
    }
    async searchAssets(query) {
        return models_1.AssetModel.search(query);
    }
}
exports.default = new AssetService();
