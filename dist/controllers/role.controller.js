"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const role_service_1 = __importDefault(require("../services/role.service"));
const response_1 = require("../utils/response");
const logger_1 = __importDefault(require("../utils/logger"));
class RoleController {
    /**
     * Get all roles
     */
    async getAll(req, res) {
        try {
            const includeInactive = req.query.include_inactive === 'true';
            const roles = await role_service_1.default.findAll(includeInactive);
            // Add user count to each role
            const rolesWithCounts = await Promise.all(roles.map(async (role) => {
                const userCount = await role_service_1.default.getUserCount(role.id);
                return { ...role, user_count: userCount };
            }));
            (0, response_1.successResponse)(res, 200, 'Roles retrieved successfully', rolesWithCounts);
        }
        catch (error) {
            logger_1.default.error('Error getting roles:', error);
            (0, response_1.errorResponse)(res, 500, error.message || 'Failed to get roles');
        }
    }
    /**
     * Get a single role
     */
    async getById(req, res) {
        try {
            const id = parseInt(req.params.id);
            const role = await role_service_1.default.findById(id);
            if (!role) {
                (0, response_1.errorResponse)(res, 404, 'Role not found');
                return;
            }
            // Get user count
            const userCount = await role_service_1.default.getUserCount(id);
            (0, response_1.successResponse)(res, 200, 'Role retrieved successfully', { ...role, user_count: userCount });
        }
        catch (error) {
            logger_1.default.error('Error getting role:', error);
            (0, response_1.errorResponse)(res, 500, error.message || 'Failed to get role');
        }
    }
    /**
     * Create a new role
     */
    async create(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                (0, response_1.errorResponse)(res, 401, 'User not authenticated');
                return;
            }
            const { name, description, is_active } = req.body;
            if (!name) {
                (0, response_1.errorResponse)(res, 400, 'Role name is required');
                return;
            }
            const role = await role_service_1.default.create({ name, description, is_active }, userId);
            (0, response_1.successResponse)(res, 201, 'Role created successfully', role);
        }
        catch (error) {
            logger_1.default.error('Error creating role:', error);
            (0, response_1.errorResponse)(res, 400, error.message || 'Failed to create role');
        }
    }
    /**
     * Update a role
     */
    async update(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                (0, response_1.errorResponse)(res, 401, 'User not authenticated');
                return;
            }
            const id = parseInt(req.params.id);
            const { name, description, is_active } = req.body;
            const role = await role_service_1.default.update(id, { name, description, is_active }, userId);
            (0, response_1.successResponse)(res, 200, 'Role updated successfully', role);
        }
        catch (error) {
            logger_1.default.error('Error updating role:', error);
            (0, response_1.errorResponse)(res, 400, error.message || 'Failed to update role');
        }
    }
    /**
     * Delete a role
     */
    async delete(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                (0, response_1.errorResponse)(res, 401, 'User not authenticated');
                return;
            }
            const id = parseInt(req.params.id);
            await role_service_1.default.delete(id, userId);
            (0, response_1.successResponse)(res, 200, 'Role deleted successfully');
        }
        catch (error) {
            logger_1.default.error('Error deleting role:', error);
            (0, response_1.errorResponse)(res, 400, error.message || 'Failed to delete role');
        }
    }
    /**
     * Toggle role active status
     */
    async toggleActive(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                (0, response_1.errorResponse)(res, 401, 'User not authenticated');
                return;
            }
            const id = parseInt(req.params.id);
            const role = await role_service_1.default.toggleActive(id, userId);
            (0, response_1.successResponse)(res, 200, `Role ${role.is_active ? 'activated' : 'deactivated'} successfully`, role);
        }
        catch (error) {
            logger_1.default.error('Error toggling role status:', error);
            (0, response_1.errorResponse)(res, 400, error.message || 'Failed to toggle role status');
        }
    }
}
exports.default = new RoleController();
