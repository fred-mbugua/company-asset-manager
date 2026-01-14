"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const models_1 = require("../models");
const logger_1 = __importDefault(require("../utils/logger"));
const employee_model_1 = __importDefault(require("../models/employee.model"));
const database_1 = __importDefault(require("../config/database"));
const jwtConfig = __importStar(require("../config"));
const actionLog_service_1 = __importDefault(require("./actionLog.service"));
class AuthService {
    constructor() {
        this.SALT_ROUNDS = 10;
    }
    // The userId parameter is required, representing the Admin/User
    // who is registering the new user.
    async registerUser(registrationData, performingUserId) {
        // console.log('Registration data received:', registrationData);
        // Start a database transaction
        const client = await database_1.default.connect();
        try {
            await client.query('BEGIN');
            // Check if the user's email already exists
            const existingUser = await models_1.UserModel.findByEmail(registrationData.email);
            if (existingUser) {
                return Promise.reject(new Error('A user with this email already exists.'));
            }
            // Create the employee record first
            const newEmployee = await employee_model_1.default.create({
                first_name: registrationData.first_name,
                middle_name: registrationData.middle_name,
                last_name: registrationData.last_name,
                email: registrationData.email,
                department: registrationData.department,
                department_id: registrationData.department_id,
                branch_location: registrationData.branch_location,
                branch_id: registrationData.branch_id
            }); // Passed client
            // Hash the password
            const hashedPassword = await bcryptjs_1.default.hash(registrationData.password, this.SALT_ROUNDS);
            // Create the user account, linking it to the new employee's ID
            const newUser = await models_1.UserModel.create({
                employee_id: newEmployee.id,
                first_name: registrationData.first_name,
                middle_name: registrationData.middle_name,
                last_name: registrationData.last_name,
                email: registrationData.email,
                phone: registrationData.phone,
                password: hashedPassword,
                role_id: registrationData.role_id,
                branch_id: registrationData.branch_id
            }); // Passed client
            // Log the creation of both the user and employee
            await actionLog_service_1.default.logAction(performingUserId, // User ID who performed the action (Admin)
            'CREATE', 'User', newUser.id, { registered_email: newUser.email });
            await client.query('COMMIT');
            return newUser;
        }
        catch (error) {
            await client.query('ROLLBACK');
            logger_1.default.error('Registration failed:', error);
            throw error;
        }
        finally {
            client.release();
        }
    }
    async login(credentials) {
        const user = await models_1.UserModel.findByEmail(credentials.email);
        if (!user || !await bcryptjs_1.default.compare(credentials.password, user.password)) {
            return Promise.reject(new Error('Invalid credentials'));
        }
        const accessToken = this.generateAccessToken(user);
        const refreshToken = this.generateRefreshToken(user);
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 7);
        await models_1.RefreshTokenModel.save(user.id, refreshToken, expirationDate);
        // Log the login action
        await actionLog_service_1.default.logAction(user.id, 'LOGIN', 'User', user.id, { email: user.email });
        return { accessToken, refreshToken, user };
    }
    async refresh(refreshToken) {
        try {
            const storedToken = await models_1.RefreshTokenModel.findByToken(refreshToken);
            if (!storedToken) {
                throw new Error('Refresh token not found');
            }
            if (storedToken.expires_at < new Date()) {
                throw new Error('Refresh token expired');
            }
            const decoded = jsonwebtoken_1.default.verify(refreshToken, jwtConfig.JWT_REFRESH_SECRET_KEY);
            const user = await models_1.UserModel.findById(decoded.id);
            if (!user) {
                throw new Error('User not found');
            }
            const newAccessToken = this.generateAccessToken(user);
            const newRefreshToken = this.generateRefreshToken(user);
            const expirationDate = new Date();
            expirationDate.setDate(expirationDate.getDate() + 7);
            await models_1.RefreshTokenModel.save(user.id, newRefreshToken, expirationDate);
            return { accessToken: newAccessToken, newRefreshToken: newRefreshToken };
        }
        catch (error) {
            throw new Error('Invalid or expired refresh token');
        }
    }
    async logout(refreshToken) {
        await models_1.RefreshTokenModel.deleteByToken(refreshToken);
    }
    generateAccessToken(user) {
        // console.log('Generating access token for user:', user);
        const payload = { id: user.id, email: user.email, role: user.role, role_id: user.role_id };
        return jsonwebtoken_1.default.sign(payload, jwtConfig.JWT_ACCESS_SECRET_KEY, { expiresIn: jwtConfig.JWT_ACCESS_EXPIRATION_TIME });
    }
    generateRefreshToken(user) {
        const payload = { id: user.id, email: user.email, role: user.role, role_id: user.role_id };
        return jsonwebtoken_1.default.sign(payload, jwtConfig.JWT_REFRESH_SECRET_KEY, { expiresIn: jwtConfig.JWT_REFRESH_EXPIRATION_TIME });
    }
    async getAllUserRoles() {
        const roles = await models_1.RoleModel.findAll();
        return roles;
    }
}
exports.AuthService = AuthService;
exports.default = new AuthService();
