import { Request, Response } from 'express';
import { AssetService } from '../services';
import logger from '../utils/logger';

class AssetController {
  async getAssets(req: Request, res: Response) {
    try {
      const assets = await AssetService.getAssets();
      res.status(200).json(assets);
    } catch (error: any) {
      logger.error('Failed to get assets:', error);
      res.status(500).json({ error: 'Failed to retrieve assets' });
    }
  }

  async getAssetById(req: Request, res: Response) {
    try {
      const asset = await AssetService.getAssetById(req.params.id);
      res.status(200).json(asset);
    } catch (error: any) {
      logger.error(`Asset not found with ID ${req.params.id}:`, error);
      res.status(404).json({ error: error.message });
    }
  }

  async createAsset(req: Request, res: Response) {
    try {
      const newAsset = await AssetService.createAsset(req.body);
      res.status(201).json(newAsset);
    } catch (error: any) {
      logger.error('Failed to create asset:', error);
      res.status(400).json({ error: 'Invalid asset data' });
    }
  }

  async updateAsset(req: Request, res: Response) {
    try {
      const updatedAsset = await AssetService.updateAsset(req.params.id, req.body);
      res.status(200).json(updatedAsset);
    } catch (error: any) {
      logger.error(`Failed to update asset with ID ${req.params.id}:`, error);
      res.status(400).json({ error: error.message });
    }
  }

  async deleteAsset(req: Request, res: Response) {
    try {
      await AssetService.deleteAsset(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      logger.error(`Failed to delete asset with ID ${req.params.id}:`, error);
      res.status(404).json({ error: error.message });
    }
  }

  async searchAssets(req: Request, res: Response) {
    try {
      const assets = await AssetService.searchAssets(req.query);
      res.status(200).json(assets);
    } catch (error: any) {
      logger.error('Failed to search assets:', error);
      res.status(500).json({ error: 'Failed to search assets' });
    }
  }
}

export default new AssetController();