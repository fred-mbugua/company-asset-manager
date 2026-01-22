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
// Note: Authentication is handled at the main router level
// Get all roles
router.get('/', (0, express_async_handler_1.default)(role_controller_1.default.getAll));
// Get a single role
router.get('/:id', (0, express_async_handler_1.default)(role_controller_1.default.getById));
// Create a new role
router.post('/', (0, auth_middleware_1.authorize)(['Admin']), (0, express_async_handler_1.default)(role_controller_1.default.create));
// Update a role
router.put('/:id', (0, auth_middleware_1.authorize)(['Admin']), (0, express_async_handler_1.default)(role_controller_1.default.update));
// Delete a role
router.delete('/:id', (0, auth_middleware_1.authorize)(['Admin']), (0, express_async_handler_1.default)(role_controller_1.default.delete));
// Toggle role active status
router.patch('/:id/toggle', (0, auth_middleware_1.authorize)(['Admin']), (0, express_async_handler_1.default)(role_controller_1.default.toggleActive));
exports.default = router;
