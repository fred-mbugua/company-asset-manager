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
// User profile routes (self-management) - no permission check needed for own profile
router.get('/:id', middlewares_1.authenticate, (0, express_async_handler_1.default)(controllers_1.UserController.getById));
router.put('/profile', middlewares_1.authenticate, (0, express_async_handler_1.default)(controllers_1.UserController.updateProfile));
router.post('/change-password', middlewares_1.authenticate, (0, express_async_handler_1.default)(controllers_1.UserController.changePassword));
// Admin user management routes - require users permission
router.post('/reset-password/:id', middlewares_1.authenticate, (0, permission_middleware_1.checkPermission)('ADMIN_USERS', 'update'), (0, express_async_handler_1.default)(controllers_1.UserController.resetPassword));
router.post('/toggle-status/:id', middlewares_1.authenticate, (0, permission_middleware_1.checkPermission)('ADMIN_USERS', 'update'), (0, express_async_handler_1.default)(controllers_1.UserController.toggleStatus));
exports.default = router;
