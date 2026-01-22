"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
const middlewares_1 = require("../middlewares");
const permission_middleware_1 = require("../middlewares/permission.middleware");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const router = (0, express_1.Router)();
// Asset routes with permission-based access control
router.get('/', middlewares_1.authenticate, (0, permission_middleware_1.checkPermission)('ASSETS', 'read'), (0, express_async_handler_1.default)(controllers_1.AssetController.getAll));
router.get('/search', middlewares_1.authenticate, (0, permission_middleware_1.checkPermission)('ASSETS', 'read'), (0, express_async_handler_1.default)(controllers_1.AssetController.search));
router.get('/statuses/list', middlewares_1.authenticate, (0, permission_middleware_1.checkPermission)('ASSETS', 'read'), (0, express_async_handler_1.default)(controllers_1.AssetController.statusList));
router.get('/next-tag/:assetTypeId', middlewares_1.authenticate, (0, permission_middleware_1.checkPermission)('ASSETS', 'read'), (0, express_async_handler_1.default)(controllers_1.AssetController.getNextTagPreview));
router.get('/:id', middlewares_1.authenticate, (0, permission_middleware_1.checkPermission)('ASSETS', 'read'), (0, express_async_handler_1.default)(controllers_1.AssetController.getById));
router.post('/', middlewares_1.authenticate, (0, permission_middleware_1.checkPermission)('ASSETS', 'create'), (0, express_async_handler_1.default)(controllers_1.AssetController.create));
router.put('/:id', middlewares_1.authenticate, (0, permission_middleware_1.checkPermission)('ASSETS', 'update'), (0, express_async_handler_1.default)(controllers_1.AssetController.update));
router.delete('/:id', middlewares_1.authenticate, (0, permission_middleware_1.checkPermission)('ASSETS', 'delete'), (0, express_async_handler_1.default)(controllers_1.AssetController.delete));
// Asset Types routes
router.post('/asset-types/create', middlewares_1.authenticate, (0, permission_middleware_1.checkPermission)('ADMIN_ASSET_TYPES', 'create'), (0, express_async_handler_1.default)(controllers_1.AssetTypeController.createAssetType));
router.get('/asset-types/all', middlewares_1.authenticate, (0, permission_middleware_1.checkPermission)('ADMIN_ASSET_TYPES', 'read'), (0, express_async_handler_1.default)(controllers_1.AssetTypeController.getAllAssetTypes));
// Asset Statuses routes
router.post('/asset-statuses/create', middlewares_1.authenticate, (0, permission_middleware_1.checkPermission)('ADMIN_ASSET_STATUSES', 'create'), (0, express_async_handler_1.default)(controllers_1.AssetStatusController.createAssetStatus));
router.get('/asset-statuses/all', middlewares_1.authenticate, (0, permission_middleware_1.checkPermission)('ADMIN_ASSET_STATUSES', 'read'), (0, express_async_handler_1.default)(controllers_1.AssetStatusController.getAllAssetStatuses));
router.get('/asset-statuses/:id', middlewares_1.authenticate, (0, permission_middleware_1.checkPermission)('ADMIN_ASSET_STATUSES', 'read'), (0, express_async_handler_1.default)(controllers_1.AssetStatusController.getAssetStatusById));
router.put('/asset-statuses/:id', middlewares_1.authenticate, (0, permission_middleware_1.checkPermission)('ADMIN_ASSET_STATUSES', 'update'), (0, express_async_handler_1.default)(controllers_1.AssetStatusController.updateAssetStatus));
router.delete('/asset-statuses/:id', middlewares_1.authenticate, (0, permission_middleware_1.checkPermission)('ADMIN_ASSET_STATUSES', 'delete'), (0, express_async_handler_1.default)(controllers_1.AssetStatusController.deleteAssetStatus));
exports.default = router;
