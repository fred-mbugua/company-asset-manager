"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
const middlewares_1 = require("../middlewares");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const router = (0, express_1.Router)();
router.get('/', middlewares_1.authenticate, (0, middlewares_1.authorize)(['*']), (0, express_async_handler_1.default)(controllers_1.AssetController.getAll));
router.get('/search', middlewares_1.authenticate, (0, middlewares_1.authorize)(['*']), (0, express_async_handler_1.default)(controllers_1.AssetController.search));
router.get('/statuses/list', middlewares_1.authenticate, (0, middlewares_1.authorize)(['*']), (0, express_async_handler_1.default)(controllers_1.AssetController.statusList));
router.get('/next-tag/:assetTypeId', middlewares_1.authenticate, (0, middlewares_1.authorize)(['*']), (0, express_async_handler_1.default)(controllers_1.AssetController.getNextTagPreview));
router.get('/:id', middlewares_1.authenticate, (0, middlewares_1.authorize)(['*']), (0, express_async_handler_1.default)(controllers_1.AssetController.getById));
router.post('/', middlewares_1.authenticate, (0, middlewares_1.authorize)(['Admin']), (0, express_async_handler_1.default)(controllers_1.AssetController.create));
router.put('/:id', middlewares_1.authenticate, (0, middlewares_1.authorize)(['Admin']), (0, express_async_handler_1.default)(controllers_1.AssetController.update));
router.delete('/:id', middlewares_1.authenticate, (0, middlewares_1.authorize)(['Admin']), (0, express_async_handler_1.default)(controllers_1.AssetController.delete));
router.post('/asset-types/create', middlewares_1.authenticate, (0, middlewares_1.authorize)(['Admin']), (0, express_async_handler_1.default)(controllers_1.AssetTypeController.createAssetType));
router.get('/asset-types/all', middlewares_1.authenticate, (0, express_async_handler_1.default)(controllers_1.AssetTypeController.getAllAssetTypes));
router.post('/asset-statuses/create', middlewares_1.authenticate, (0, middlewares_1.authorize)(['Admin']), // Only Admin can create new statuses
(0, express_async_handler_1.default)(controllers_1.AssetStatusController.createAssetStatus));
router.get('/asset-statuses/all', middlewares_1.authenticate, (0, express_async_handler_1.default)(controllers_1.AssetStatusController.getAllAssetStatuses) // Can be accessed by most authenticated users
);
router.get('/asset-statuses/:id', middlewares_1.authenticate, (0, express_async_handler_1.default)(controllers_1.AssetStatusController.getAssetStatusById));
router.put('/asset-statuses/:id', middlewares_1.authenticate, (0, middlewares_1.authorize)(['Admin']), (0, express_async_handler_1.default)(controllers_1.AssetStatusController.updateAssetStatus));
router.delete('/asset-statuses/:id', middlewares_1.authenticate, (0, middlewares_1.authorize)(['Admin']), (0, express_async_handler_1.default)(controllers_1.AssetStatusController.deleteAssetStatus));
exports.default = router;
