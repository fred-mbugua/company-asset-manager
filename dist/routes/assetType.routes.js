"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const middlewares_1 = require("../middlewares");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const controllers_1 = require("../controllers");
const router = (0, express_1.Router)();
router.post('/asset-types/create', middlewares_1.authenticate, (0, middlewares_1.authorize)(['Admin']), (0, express_async_handler_1.default)(controllers_1.AssetTypeController.createAssetType));
router.get('/asset-types', middlewares_1.authenticate, (0, express_async_handler_1.default)(controllers_1.AssetTypeController.getAllAssetTypes));
router.get('/asset-types/:id', middlewares_1.authenticate, (0, express_async_handler_1.default)(controllers_1.AssetTypeController.getAssetTypeById));
router.put('/asset-types/:id', middlewares_1.authenticate, (0, middlewares_1.authorize)(['Admin']), (0, express_async_handler_1.default)(controllers_1.AssetTypeController.updateAssetType));
router.delete('/asset-types/:id', middlewares_1.authenticate, (0, middlewares_1.authorize)(['Admin']), (0, express_async_handler_1.default)(controllers_1.AssetTypeController.deleteAssetType));
exports.default = router;
