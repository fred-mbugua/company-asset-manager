"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const router = (0, express_1.Router)();
router.get('/login', controllers_1.ViewsController.renderLogin);
router.get('/dashboard', (0, express_async_handler_1.default)(controllers_1.ViewsController.renderDashboard));
router.get('/assets/create', (0, express_async_handler_1.default)(controllers_1.ViewsController.renderCreateAsset));
router.get('/assets/view', (0, express_async_handler_1.default)(controllers_1.ViewsController.renderViewAssets));
router.get('/assets/assign', (0, express_async_handler_1.default)(controllers_1.ViewsController.renderAssignAssets));
router.get('/expenses/create', (0, express_async_handler_1.default)(controllers_1.ViewsController.renderCreateExpenses));
router.get('/users/create', (0, express_async_handler_1.default)(controllers_1.ViewsController.renderCreateUser));
router.get('/reports', (0, express_async_handler_1.default)(controllers_1.ViewsController.renderReports));
exports.default = router;
