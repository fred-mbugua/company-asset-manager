"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const asset_model_1 = __importDefault(require("../models/asset.model"));
const assetTagPrefix_model_1 = __importDefault(require("../models/assetTagPrefix.model"));
const actionLog_service_1 = __importDefault(require("./actionLog.service"));
class AssetService {
    async create(assetData, userId) {
        // If asset_tag is 'AUTO' or empty, generate it automatically
        if (!assetData.asset_tag || assetData.asset_tag === 'AUTO' || assetData.asset_tag.trim() === '') {
            if (!assetData.asset_type_id) {
                throw new Error('Asset type is required for auto-generating asset tag');
            }
            assetData.asset_tag = await assetTagPrefix_model_1.default.generateNextTag(assetData.asset_type_id);
        }
        const newAsset = await asset_model_1.default.create(assetData);
        await actionLog_service_1.default.logAction(userId, 'CREATE', 'Asset', newAsset.id, { asset_tag: newAsset.asset_tag });
        return newAsset;
    }
    async getAll(permissionContext) {
        return asset_model_1.default.findAll(1, 10000, permissionContext);
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
    async search(query, permissionContext) {
        return asset_model_1.default.search(query, permissionContext);
    }
    async statusList() {
        return asset_model_1.default.getAssetStatuses();
    }
    /**
     * Get preview of next asset tag for a given asset type
     */
    async getNextTagPreview(assetTypeId) {
        const preview = await assetTagPrefix_model_1.default.getNextSequencePreview(assetTypeId);
        const paddedSequence = preview.nextNumber.toString().padStart(3, '0');
        return {
            prefix: preview.prefix,
            nextNumber: preview.nextNumber,
            fullTag: `${preview.prefix}-${paddedSequence}`
        };
    }
}
exports.default = new AssetService();
