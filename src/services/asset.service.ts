import AssetModel from '../models/asset.model';
import AssetTagPrefixModel from '../models/assetTagPrefix.model';
import ActionLogService from './actionLog.service';
import logger from '../utils/logger';
import { AccessFilterContext } from '../utils/accessFilter.util';

class AssetService {
    async create(assetData: any, userId: number) {
        // If asset_tag is 'AUTO' or empty, generate it automatically
        if (!assetData.asset_tag || assetData.asset_tag === 'AUTO' || assetData.asset_tag.trim() === '') {
            if (!assetData.asset_type_id) {
                throw new Error('Asset type is required for auto-generating asset tag');
            }
            assetData.asset_tag = await AssetTagPrefixModel.generateNextTag(assetData.asset_type_id);
        }

        const newAsset = await AssetModel.create(assetData);
        
        await ActionLogService.logAction(
            userId, 
            'CREATE', 
            'Asset', 
            newAsset.id,
            { asset_tag: newAsset.asset_tag }
        );

        return newAsset;
    }

    async getAll(permissionContext?: AccessFilterContext) {
        return AssetModel.findAll(1, 10000, permissionContext);
    }
    
    async getById(id: number) {
        const asset = await AssetModel.findById(id);
        if (!asset) {
            throw new Error('Asset not found.');
        }
        return asset;
    }

    async update(id: number, updateData: any, userId: number) {
        const asset = await this.getById(id);
        const changes = { old_data: asset, new_data: updateData };
        
        const updatedAsset = await AssetModel.update(id, updateData);

        await ActionLogService.logAction(
            userId,
            'UPDATE',
            'Asset',
            id,
            changes
        );
        
        return updatedAsset;
    }

    async delete(id: number, userId: number) {
        const asset = await this.getById(id);
        await AssetModel.delete(id);

        await ActionLogService.logAction(
            userId, 
            'DELETE', 
            'Asset', 
            id,
            { asset_tag: asset.asset_tag }
        );

        return { message: 'Asset deleted successfully.' };
    }

    async search(query: any, permissionContext?: AccessFilterContext) {
        return AssetModel.search(query, permissionContext);
    }

    async statusList() {
        return AssetModel.getAssetStatuses();
    }

    /**
     * Get preview of next asset tag for a given asset type
     */
    async getNextTagPreview(assetTypeId: number) {
        const preview = await AssetTagPrefixModel.getNextSequencePreview(assetTypeId);
        const paddedSequence = preview.nextNumber.toString().padStart(3, '0');
        return {
            prefix: preview.prefix,
            nextNumber: preview.nextNumber,
            fullTag: `${preview.prefix}-${paddedSequence}`
        };
    }
}

export default new AssetService();