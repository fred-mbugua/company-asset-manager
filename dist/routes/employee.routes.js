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
router.get('/:id', middlewares_1.authenticate, (0, express_async_handler_1.default)(controllers_1.EmployeeController.getById));
router.get('/:employeeId/assets', middlewares_1.authenticate, (0, express_async_handler_1.default)(controllers_1.EmployeeController.getAssetsByEmployee));
exports.default = router;
