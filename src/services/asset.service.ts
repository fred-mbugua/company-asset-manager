import { AssetModel } from '../models';

class AssetService {
  async getAssets() {
    return AssetModel.findAll();
  }

  async getAssetById(id: string) {
    const asset = await AssetModel.findById(id);
    if (!asset) {
      throw new Error('Asset not found');
    }
    return asset;
  }

  async createAsset(assetData: any) {
    // You can add validation and business logic here before saving
    return AssetModel.create(assetData);
  }

  async updateAsset(id: string, assetData: any) {
    const existingAsset = await AssetModel.findById(id);
    if (!existingAsset) {
      throw new Error('Asset not found');
    }
    return AssetModel.update(id, assetData);
  }

  async deleteAsset(id: string) {
    const existingAsset = await AssetModel.findById(id);
    if (!existingAsset) {
      throw new Error('Asset not found');
    }
    return AssetModel.delete(id);
  }

  async searchAssets(query: any) {
    return AssetModel.search(query);
  }

  
}

export default new AssetService();