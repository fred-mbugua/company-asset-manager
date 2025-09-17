"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const services_1 = require("../services");
const response_1 = require("../utils/response");
const logger_1 = __importDefault(require("../utils/logger"));
class UserController {
    async getAll(req, res) {
        try {
            const users = await services_1.UserService.getAllUsers();
            logger_1.default.info('All users retrieved successfully');
            (0, response_1.successResponse)(res, 200, 'Users retrieved successfully', users);
        }
        catch (error) {
            logger_1.default.error(`Failed to retrieve users: ${error.message}`, { error });
            (0, response_1.errorResponse)(res, 500, error.message);
        }
    }
    async getById(req, res) {
        try {
            const user = await services_1.UserService.getUserById(req.params.id);
            (0, response_1.successResponse)(res, 200, 'User retrieved successfully', user);
        }
        catch (error) {
            (0, response_1.errorResponse)(res, 404, error.message);
        }
    }
    async update(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const updatedUser = await services_1.UserService.updateUser(req.params.id, req.body, userId);
            (0, response_1.successResponse)(res, 200, 'User updated successfully', updatedUser);
        }
        catch (error) {
            (0, response_1.errorResponse)(res, 404, error.message);
        }
    }
    async delete(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const result = await services_1.UserService.deleteUser(req.params.id, userId);
            (0, response_1.successResponse)(res, 200, result.message);
        }
        catch (error) {
            (0, response_1.errorResponse)(res, 404, error.message);
        }
    }
}
exports.UserController = UserController;
