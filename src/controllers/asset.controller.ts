import { Request, Response } from 'express';
import AssetService from '../services/asset.service';
import { successResponse, errorResponse } from '../utils/response';
import logger from '../utils/logger';
import { AuthenticatedRequest } from '../types';

export class AssetController {
    async getAll(req: Request, res: Response) {
        try {
            const assets = await AssetService.getAll();
            successResponse(res, 200, 'Assets retrieved successfully', assets);
        } catch (error: any) {
            logger.error('Failed to get assets:', error);
            errorResponse(res, 500, 'Failed to retrieve assets');
        }
    }

    async getById(req: Request, res: Response) {
        try {
            const asset = await AssetService.getById(Number(req.params.id));
            successResponse(res, 200, 'Asset retrieved successfully', asset);
        } catch (error: any) {
            logger.error(`Asset not found with ID ${req.params.id}:`, error);
            errorResponse(res, 404, (error as Error).message);
        }
    }

    async create(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.user?.id;
            const newAsset = await AssetService.create(req.body, userId);
            successResponse(res, 201, 'Asset created successfully', newAsset);
        } catch (error: any) {
            logger.error('Failed to create asset:', error);
            errorResponse(res, 400, 'Invalid asset data');
        }
    }

    async update(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.user?.id;
            const updatedAsset = await AssetService.update(Number(req.params.id), req.body, userId);
            successResponse(res, 200, 'Asset updated successfully', updatedAsset);
        } catch (error: any) {
            logger.error(`Failed to update asset with ID ${req.params.id}:`, error);
            errorResponse(res, 400, (error as Error).message);
        }
    }

    async delete(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.user?.id;
            const result = await AssetService.delete(Number(req.params.id), userId);
            successResponse(res, 200, result.message);
        } catch (error: any) {
            logger.error(`Failed to delete asset with ID ${req.params.id}:`, error);
            errorResponse(res, 404, (error as Error).message);
        }
    }

    async search(req: Request, res: Response) {
        try {
            const assets = await AssetService.search(req.query);
            successResponse(res, 200, 'Assets retrieved successfully', assets);
        } catch (error: any) {
            logger.error('Failed to search assets:', error);
            errorResponse(res, 500, 'Failed to search assets');
        }
    }
}

export default new AssetController();