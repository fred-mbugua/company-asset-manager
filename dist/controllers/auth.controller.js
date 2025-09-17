"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const services_1 = require("../services");
const response_1 = require("../utils/response");
const logger_1 = __importDefault(require("../utils/logger")); // Import the logger
class AuthController {
    async register(req, res) {
        try {
            const newUser = await services_1.AuthService.register(req.body);
            const { password, ...user } = newUser;
            logger_1.default.info(`User registered successfully: ${user.email}`);
            (0, response_1.successResponse)(res, 201, 'User registered successfully', { user });
        }
        catch (error) {
            logger_1.default.error(`Registration failed: ${error.message}`, { error });
            (0, response_1.errorResponse)(res, 400, error.message);
        }
    }
    async login(req, res) {
        try {
            const { email, password } = req.body;
            const { accessToken, refreshToken, user } = await services_1.AuthService.login({ email, password });
            res.cookie('accessToken', accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 30 * 60 * 1000
            });
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });
            logger_1.default.info(`User logged in successfully: ${user.email}`);
            (0, response_1.successResponse)(res, 200, 'Logged in successfully', { user });
        }
        catch (error) {
            logger_1.default.error(`Login failed: ${error.message}`, { email: req.body.email, error });
            (0, response_1.errorResponse)(res, 401, error.message);
        }
    }
    async logout(req, res) {
        res.clearCookie('accessToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });
        logger_1.default.info('User logged out successfully');
        (0, response_1.successResponse)(res, 200, 'Logged out successfully');
    }
    async refresh(req, res) {
        var _a;
        try {
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken) {
                logger_1.default.warn('Token refresh failed: No refresh token found in cookies');
                return (0, response_1.errorResponse)(res, 401, 'Refresh token not found');
            }
            const { accessToken, newRefreshToken } = await services_1.AuthService.refresh(refreshToken, (_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
            res.cookie('accessToken', accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 30 * 60 * 1000
            });
            res.cookie('refreshToken', newRefreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });
            // logger.info('Access token refreshed successfully');
            (0, response_1.successResponse)(res, 200, 'Token refreshed successfully');
        }
        catch (error) {
            logger_1.default.error(`Token refresh failed: ${error.message}`, { error });
            (0, response_1.errorResponse)(res, 401, error.message);
        }
    }
}
exports.default = new AuthController();
