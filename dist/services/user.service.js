"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../models");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const logger_1 = __importDefault(require("../utils/logger"));
const actionLog_service_1 = __importDefault(require("./actionLog.service"));
const models_2 = require("../models");
class UserService {
    constructor() {
        this.SALT_ROUNDS = 10;
    }
    async createUser(userData, userId) {
        if (userData.department_id) {
            const department = await models_2.DepartmentModel.findById(userData.department_id);
            if (!department) {
                throw new Error('Department not found.');
            }
        }
        const { password, ...rest } = userData;
        const existingUser = await models_1.UserModel.findByEmail(rest.email); // Call model method
        if (existingUser) {
            throw new Error('A user with this email already exists.');
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, this.SALT_ROUNDS);
        const newUser = await models_1.UserModel.create({
            ...rest,
            password: hashedPassword,
            department_id: userData.department_id
        });
        await actionLog_service_1.default.logAction(userId, 'CREATE', 'User', newUser.id, { created_email: newUser.email, department_id: newUser.department_id });
        return newUser;
    }
    async getAllUsers() {
        return models_1.UserModel.findAll();
    }
    async getAllUsersDetails() {
        return models_1.UserModel.findAllUserDetails();
    }
    async getUserById(id) {
        const user = await models_1.UserModel.findById(id);
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }
    async updateUser(id, updateData, userId) {
        if (updateData.department_id) {
            const department = await models_2.DepartmentModel.findById(updateData.department_id);
            if (!department) {
                throw new Error('Department not found.');
            }
        }
        if (updateData.branch_id) {
            const branch = await models_2.LocationModel.findById(updateData.branch_id);
            if (!branch) {
                throw new Error('Branch not found.');
            }
        }
        const user = await models_1.UserModel.findById(id);
        if (!user) {
            throw new Error('User not found');
        }
        const changes = { old_data: user, new_data: updateData };
        // Update the employee record first
        await models_1.EmployeeModel.update({ id, ...updateData }); // Passed client
        // Hash the new password
        if (updateData.password) {
            updateData.password = await bcryptjs_1.default.hash(updateData.password, 10);
        }
        const updateUser = await models_1.UserModel.update(id, updateData);
        await actionLog_service_1.default.logAction(userId, 'UPDATE', 'User', Number(id), changes);
        return updateUser;
    }
    async deleteUser(id, userId) {
        const user = await models_1.UserModel.findById(id);
        if (!user) {
            throw new Error('User not found');
        }
        await models_1.UserModel.delete(id);
        await actionLog_service_1.default.logAction(userId, 'DELETE', 'User', Number(id), { deleted_user_email: user.email });
        return { message: 'User deleted successfully.' };
    }
    async resetPassword(id, newPassword, userId) {
        const user = await models_1.UserModel.findById(id);
        if (!user) {
            throw new Error('User not found');
        }
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, this.SALT_ROUNDS);
        await models_1.UserModel.updatePassword(id, hashedPassword);
        await actionLog_service_1.default.logAction(userId, 'RESET_PASSWORD', 'User', Number(id), { email: user.email });
        logger_1.default.info(`Password reset for user ID: ${id}`);
    }
    async toggleUserStatus(id, isActive, userId) {
        const user = await models_1.UserModel.findById(id);
        if (!user) {
            throw new Error('User not found');
        }
        const updatedUser = await models_1.UserModel.updateStatus(id, isActive);
        await actionLog_service_1.default.logAction(userId, 'UPDATE', 'User', Number(id), {
            email: user.email,
            status_change: { from: user.is_active, to: isActive }
        });
        logger_1.default.info(`User ${id} status changed to ${isActive ? 'Active' : 'Disabled'}`);
        return updatedUser;
    }
    async changePassword(userId, currentPassword, newPassword) {
        const user = await models_1.UserModel.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        // Verify current password
        const isMatch = await bcryptjs_1.default.compare(currentPassword, user.password);
        if (!isMatch) {
            throw new Error('Current password is incorrect');
        }
        // Hash and update new password
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, this.SALT_ROUNDS);
        await models_1.UserModel.updatePassword(userId, hashedPassword);
        // Mark password as changed (for bulk imported users)
        await models_1.UserModel.markPasswordChanged(userId);
        await actionLog_service_1.default.logAction(Number(userId), 'CHANGE_PASSWORD', 'User', Number(userId), { email: user.email });
        logger_1.default.info(`Password changed for user ID: ${userId}`);
    }
}
exports.default = new UserService();
