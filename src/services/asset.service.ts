import AssetModel from '../models/asset.model';
import ActionLogService from './actionLog.service';
import logger from '../utils/logger';

class AssetService {
    async create(assetData: any, userId: number) {
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

    async getAll() {
        return AssetModel.findAll();
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

    async search(query: any) {
        return AssetModel.search(query);
    }

    async statusList() {
        return AssetModel.getAssetStatuses();
    }
}

export default new AssetService();