"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetController = void 0;
const asset_service_1 = __importDefault(require("../services/asset.service"));
const response_1 = require("../utils/response");
const logger_1 = __importDefault(require("../utils/logger"));
class AssetController {
    async getAll(req, res) {
        try {
            const assets = await asset_service_1.default.getAll();
            (0, response_1.successResponse)(res, 200, 'Assets retrieved successfully', assets);
        }
        catch (error) {
            logger_1.default.error('Failed to get assets:', error);
            (0, response_1.errorResponse)(res, 500, 'Failed to retrieve assets');
        }
    }
    async getById(req, res) {
        try {
            const asset = await asset_service_1.default.getById(Number(req.params.id));
            (0, response_1.successResponse)(res, 200, 'Asset retrieved successfully', asset);
        }
        catch (error) {
            logger_1.default.error(`Asset not found with ID ${req.params.id}:`, error);
            (0, response_1.errorResponse)(res, 404, error.message);
        }
    }
    async create(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const newAsset = await asset_service_1.default.create(req.body, userId);
            (0, response_1.successResponse)(res, 201, 'Asset created successfully', newAsset);
        }
        catch (error) {
            logger_1.default.error('Failed to create asset:', error);
            (0, response_1.errorResponse)(res, 400, 'Invalid asset data');
        }
    }
    async update(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const updatedAsset = await asset_service_1.default.update(Number(req.params.id), req.body, userId);
            (0, response_1.successResponse)(res, 200, 'Asset updated successfully', updatedAsset);
        }
        catch (error) {
            logger_1.default.error(`Failed to update asset with ID ${req.params.id}:`, error);
            (0, response_1.errorResponse)(res, 400, error.message);
        }
    }
    async delete(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const result = await asset_service_1.default.delete(Number(req.params.id), userId);
            (0, response_1.successResponse)(res, 200, result.message);
        }
        catch (error) {
            logger_1.default.error(`Failed to delete asset with ID ${req.params.id}:`, error);
            (0, response_1.errorResponse)(res, 404, error.message);
        }
    }
    async search(req, res) {
        try {
            const assets = await asset_service_1.default.search(req.query);
            (0, response_1.successResponse)(res, 200, 'Assets retrieved successfully', assets);
        }
        catch (error) {
            logger_1.default.error('Failed to search assets:', error);
            (0, response_1.errorResponse)(res, 500, 'Failed to search assets');
        }
    }
}
exports.AssetController = AssetController;
exports.default = new AssetController();
