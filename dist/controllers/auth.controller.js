"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const services_1 = require("../services");
const response_1 = require("../utils/response");
const logger_1 = __importDefault(require("../utils/logger")); // Import the logger
class AuthController {
    // async register(req: Request, res: Response) {
    //     // console.log('Registered user:', req.body);
    //     try {
    //         const newUser = await AuthService.register(req.body);
    //         const { password, ...user } = newUser;
    //         logger.info(`User registered successfully: ${user.email}`);
    //         successResponse(res, 201, 'User registered successfully', { user });
    //     } catch (error) {
    //         logger.error(`Registration failed: ${(error as Error).message}`, { error });
    //         errorResponse(res, 400, (error as Error).message);
    //     }
    // }
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
        try {
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken) {
                logger_1.default.warn('Token refresh failed: No refresh token found in cookies');
                return (0, response_1.errorResponse)(res, 401, 'Refresh token not found');
            }
            const { accessToken, newRefreshToken } = await services_1.AuthService.refresh(refreshToken);
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
    // async userRoles(req: AuthenticatedRequest, res: Response) {
    //     try {
    //         const userId = req.user?.id;
    //         if (!userId) {
    //             logger.warn('Fetching user roles failed: User ID not found in request');
    //             return errorResponse(res, 400, 'User ID not found');
    //         }
    //         const roles = await AuthService.(userId);
    //         successResponse(res, 200, 'User roles fetched successfully', { roles });
    //     } catch (error) {
    //         logger.error(`Fetching user roles failed: ${(error as Error).message}`, { error });
    //         errorResponse(res, 500, (error as Error).message);
    //     }
    // }
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
