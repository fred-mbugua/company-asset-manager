"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = __importDefault(require("../controllers/auth.controller"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const router = (0, express_1.Router)();
router.post('/register', (0, express_async_handler_1.default)(auth_controller_1.default.register));
router.post('/login', (0, express_async_handler_1.default)(auth_controller_1.default.login));
router.post('/refresh-token', (0, express_async_handler_1.default)(auth_controller_1.default.refresh));
router.post('/logout', (0, express_async_handler_1.default)(auth_controller_1.default.logout));
router.get('/roles', (0, express_async_handler_1.default)(auth_controller_1.default.getAllUserRoles));
exports.default = router;
