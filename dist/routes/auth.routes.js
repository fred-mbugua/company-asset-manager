"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const router = (0, express_1.Router)();
router.post('/register', (0, express_async_handler_1.default)(controllers_1.AuthController.register));
router.post('/login', (0, express_async_handler_1.default)(controllers_1.AuthController.login));
router.post('/refresh-token', (0, express_async_handler_1.default)(controllers_1.AuthController.refresh));
router.post('/logout', (0, express_async_handler_1.default)(controllers_1.AuthController.logout));
exports.default = router;
