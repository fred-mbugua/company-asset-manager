"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../models");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class UserService {
    async createUser(userData) {
        // Hash the password before saving
        userData.password = await bcryptjs_1.default.hash(userData.password, 10);
        return models_1.UserModel.create(userData);
    }
    async getAllUsers() {
        return models_1.UserModel.findAll();
    }
    async getUserById(id) {
        const user = await models_1.UserModel.findById(id);
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }
    async updateUser(id, updateData) {
        const user = await models_1.UserModel.findById(id);
        if (!user) {
            throw new Error('User not found');
        }
        // Hash the new password
        if (updateData.password) {
            updateData.password = await bcryptjs_1.default.hash(updateData.password, 10);
        }
        return models_1.UserModel.update(id, updateData);
    }
    async deleteUser(id) {
        const user = await models_1.UserModel.findById(id);
        if (!user) {
            throw new Error('User not found');
        }
        return models_1.UserModel.delete(id);
    }
}
exports.default = new UserService();
