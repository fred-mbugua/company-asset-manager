"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetController = void 0;
const asset_service_1 = __importDefault(require("../services/asset.service"));
const response_1 = require("../utils/response");
const logger_1 = __importDefault(require("../utils/logger"));
const accessFilter_util_1 = __importDefault(require("../utils/accessFilter.util"));
class AssetController {
    async getAll(req, res) {
        var _a, _b, _c, _d;
        try {
            logger_1.default.info(`Asset getAll - User: ${(_a = req.user) === null || _a === void 0 ? void 0 : _a.id}, Branch: ${(_b = req.user) === null || _b === void 0 ? void 0 : _b.branch_id}`);
            logger_1.default.info(`Asset getAll - PermissionContext: ${JSON.stringify(req.permissionContext)}`);
            // Build permission context using req.user object
            const permissionContext = await accessFilter_util_1.default.buildContext(req.user, { branchLevelAccess: ((_c = req.permissionContext) === null || _c === void 0 ? void 0 : _c.branchLevelAccess) || false, userBranchId: ((_d = req.user) === null || _d === void 0 ? void 0 : _d.branch_id) || null });
            logger_1.default.info(`Asset getAll - Built AccessFilterContext: ${JSON.stringify(permissionContext)}`);
            const assets = await asset_service_1.default.getAll(permissionContext);
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
        // console.log('Creating asset with data:', req.body);
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const newAsset = await asset_service_1.default.create(req.body, userId);
            (0, response_1.successResponse)(res, 201, 'Asset created successfully', newAsset);
        }
        catch (error) {
            logger_1.default.error('Failed to create asset:', error);
            (0, response_1.errorResponse)(res, 400, error.message || 'Invalid asset data');
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
        var _a, _b;
        try {
            // Build permission context using req.user object
            const permissionContext = await accessFilter_util_1.default.buildContext(req.user, { branchLevelAccess: ((_a = req.permissionContext) === null || _a === void 0 ? void 0 : _a.branchLevelAccess) || false, userBranchId: ((_b = req.user) === null || _b === void 0 ? void 0 : _b.branch_id) || null });
            const assets = await asset_service_1.default.search(req.query, permissionContext);
            (0, response_1.successResponse)(res, 200, 'Assets retrieved successfully', assets);
        }
        catch (error) {
            logger_1.default.error('Failed to search assets:', error);
            (0, response_1.errorResponse)(res, 500, 'Failed to search assets');
        }
    }
    async statusList(req, res) {
        try {
            const assets = await asset_service_1.default.statusList();
            (0, response_1.successResponse)(res, 200, 'Assets statuses retrieved successfully', assets);
        }
        catch (error) {
            logger_1.default.error('Failed to search asset statuses:', error);
            (0, response_1.errorResponse)(res, 500, 'Failed to search asset statuses');
        }
    }
    async getNextTagPreview(req, res) {
        try {
            const assetTypeId = Number(req.params.assetTypeId);
            if (!assetTypeId || isNaN(assetTypeId)) {
                return (0, response_1.errorResponse)(res, 400, 'Valid asset type ID is required');
            }
            const preview = await asset_service_1.default.getNextTagPreview(assetTypeId);
            (0, response_1.successResponse)(res, 200, 'Next tag preview retrieved successfully', preview);
        }
        catch (error) {
            logger_1.default.error('Failed to get next tag preview:', error);
            (0, response_1.errorResponse)(res, 500, 'Failed to get tag preview');
        }
    }
}
exports.AssetController = AssetController;
exports.default = new AssetController();
