"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const role_controller_1 = __importDefault(require("../controllers/role.controller"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const router = (0, express_1.Router)();
// Get all roles
router.get('/', auth_middleware_1.authenticate, (0, express_async_handler_1.default)(role_controller_1.default.getAll));
// Get a single role
router.get('/:id', auth_middleware_1.authenticate, (0, express_async_handler_1.default)(role_controller_1.default.getById));
// Create a new role
router.post('/', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['Admin']), (0, express_async_handler_1.default)(role_controller_1.default.create));
// Update a role
router.put('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['Admin']), (0, express_async_handler_1.default)(role_controller_1.default.update));
// Delete a role
router.delete('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['Admin']), (0, express_async_handler_1.default)(role_controller_1.default.delete));
// Toggle role active status
router.patch('/:id/toggle', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['Admin']), (0, express_async_handler_1.default)(role_controller_1.default.toggleActive));
exports.default = router;
