"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const asset_model_1 = __importDefault(require("../models/asset.model"));
const actionLog_service_1 = __importDefault(require("./actionLog.service"));
class AssetService {
    async create(assetData, userId) {
        const newAsset = await asset_model_1.default.create(assetData);
        await actionLog_service_1.default.logAction(userId, 'CREATE', 'Asset', newAsset.id, { asset_tag: newAsset.asset_tag });
        return newAsset;
    }
    async getAll() {
        return asset_model_1.default.findAll();
    }
    async getById(id) {
        const asset = await asset_model_1.default.findById(id);
        if (!asset) {
            throw new Error('Asset not found.');
        }
        return asset;
    }
    async update(id, updateData, userId) {
        const asset = await this.getById(id);
        const changes = { old_data: asset, new_data: updateData };
        const updatedAsset = await asset_model_1.default.update(id, updateData);
        await actionLog_service_1.default.logAction(userId, 'UPDATE', 'Asset', id, changes);
        return updatedAsset;
    }
    async delete(id, userId) {
        const asset = await this.getById(id);
        await asset_model_1.default.delete(id);
        await actionLog_service_1.default.logAction(userId, 'DELETE', 'Asset', id, { asset_tag: asset.asset_tag });
        return { message: 'Asset deleted successfully.' };
    }
    async search(query) {
        return asset_model_1.default.search(query);
    }
}
exports.default = new AssetService();
