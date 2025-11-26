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
router.get('/assets', middlewares_1.authenticate, (0, express_async_handler_1.default)(controllers_1.ReportController.getFilteredAssets));
router.get('/assets/all', middlewares_1.authenticate, (0, express_async_handler_1.default)(controllers_1.ReportController.getAssetsByEmployee));
router.get('/assets/assignments', middlewares_1.authenticate, (0, express_async_handler_1.default)(controllers_1.ReportController.getAssetsByEmployee));
router.get('/expenses/all', middlewares_1.authenticate, (0, express_async_handler_1.default)(controllers_1.ReportController.getAssetsByEmployee));
router.get('/assets/employee/:employeeId', middlewares_1.authenticate, (0, express_async_handler_1.default)(controllers_1.ReportController.getAssetsByEmployee));
router.get('/assets/branch/:location', middlewares_1.authenticate, (0, express_async_handler_1.default)(controllers_1.ReportController.getAssetsByBranch));
router.get('/expenses/time-period', middlewares_1.authenticate, (0, middlewares_1.authorize)(['Admin']), (0, express_async_handler_1.default)(controllers_1.ReportController.getExpensesByTimePeriod));
router.get('/assets/export', middlewares_1.authenticate, (0, express_async_handler_1.default)(controllers_1.ReportController.exportAssetReport));
exports.default = router;
