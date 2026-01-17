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
        var _a;
        logger_1.default.info('Received request to register a new user.');
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        try {
            const newUser = await services_1.AuthService.registerUser(req.body, userId);
            logger_1.default.info(`New user registered successfully with email: ${newUser.email}`);
            (0, response_1.successResponse)(res, 201, 'User registered successfully', newUser);
        }
        catch (error) {
            logger_1.default.error('Failed to register user:', error);
            (0, response_1.errorResponse)(res, 400, error.message);
        }
    }
    async login(req, res) {
        try {
            const { email, password } = req.body;
            const { accessToken, refreshToken, user } = await services_1.AuthService.login({ email, password });
            if (!user) {
                logger_1.default.warn(`Login failed: User not found for email ${email}`);
                return (0, response_1.errorResponse)(res, 401, 'Invalid email or password');
            }
            // Check if the request is actually using HTTPS (either directly or via proxy)
            const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';
            res.cookie('accessToken', accessToken, {
                httpOnly: true,
                secure: isSecure,
                sameSite: isSecure ? 'strict' : 'lax',
                maxAge: 30 * 60 * 1000
            });
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: isSecure,
                sameSite: isSecure ? 'strict' : 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });
            // Get the returnTo URL from session and clear it
            const returnTo = req.session.returnTo || '/dashboard';
            delete req.session.returnTo;
            logger_1.default.info(`User logged in successfully: ${user.email}`);
            (0, response_1.successResponse)(res, 200, 'Logged in successfully', { user, accessToken, refreshToken, returnTo });
        }
        catch (error) {
            logger_1.default.error(`Login failed: ${error.message}`, { email: req.body.email, error });
            (0, response_1.errorResponse)(res, 401, error.message);
        }
    }
    async logout(req, res) {
        // Check if the request is actually using HTTPS (either directly or via proxy)
        const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';
        res.clearCookie('accessToken', {
            httpOnly: true,
            secure: isSecure,
            sameSite: isSecure ? 'strict' : 'lax'
        });
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: isSecure,
            sameSite: isSecure ? 'strict' : 'lax'
        });
        logger_1.default.info('User logged out successfully');
        (0, response_1.successResponse)(res, 200, 'Logged out successfully');
    }
    async refresh(req, res) {
        try {
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken) {
                logger_1.default.warn('Token refresh failed: No refresh token found in cookies');
                return (0, response_1.errorResponse)(res, 401, 'Refresh token not found');
            }
            const { accessToken, newRefreshToken } = await services_1.AuthService.refresh(refreshToken);
            // Check if the request is actually using HTTPS (either directly or via proxy)
            const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';
            res.cookie('accessToken', accessToken, {
                httpOnly: true,
                secure: isSecure,
                sameSite: isSecure ? 'strict' : 'lax',
                maxAge: 30 * 60 * 1000
            });
            res.cookie('refreshToken', newRefreshToken, {
                httpOnly: true,
                secure: isSecure,
                sameSite: isSecure ? 'strict' : 'lax',
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
    async getAllUserRoles(req, res) {
        try {
            const roles = await services_1.AuthService.getAllUserRoles();
            (0, response_1.successResponse)(res, 200, 'All user roles fetched successfully', { roles });
        }
        catch (error) {
            logger_1.default.error(`Fetching all user roles failed: ${error.message}`, { error });
            (0, response_1.errorResponse)(res, 500, error.message);
        }
    }
}
exports.default = new AuthController();
