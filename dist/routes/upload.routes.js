"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
const services_1 = require("../services");
const middlewares_1 = require("../middlewares");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const router = (0, express_1.Router)();
router.post('/assets', middlewares_1.authenticate, (0, middlewares_1.authorize)(['Admin']), services_1.BulkUploadMiddleware.single('file'), (0, express_async_handler_1.default)(controllers_1.BulkUploadController.uploadAssets));
exports.default = router;
