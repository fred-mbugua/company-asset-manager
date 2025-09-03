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
const jwtConfig = __importStar(require("../config"));
class AuthService {
    async register(userData) {
        const hashedPassword = await bcryptjs_1.default.hash(userData.password, 10);
        const newUser = await models_1.UserModel.create({ ...userData, password: hashedPassword });
        return newUser;
    }
    async login(email, password) {
        const user = await models_1.UserModel.findByEmail(email);
        if (!user || !await bcryptjs_1.default.compare(password, user.password)) {
            throw new Error('Invalid credentials');
        }
        const accessToken = this.generateAccessToken(user);
        const refreshToken = this.generateRefreshToken(user);
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 7);
        await models_1.RefreshTokenModel.save(user.id, refreshToken, expirationDate);
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
            return { accessToken: newAccessToken, refreshToken: newRefreshToken };
        }
        catch (error) {
            throw new Error('Invalid or expired refresh token');
        }
    }
    async logout(refreshToken) {
        await models_1.RefreshTokenModel.deleteByToken(refreshToken);
    }
    generateAccessToken(user) {
        const payload = { id: user.id, email: user.email, role: user.role };
        return jsonwebtoken_1.default.sign(payload, jwtConfig.JWT_ACCESS_SECRET_KEY, { expiresIn: jwtConfig.JWT_ACCESS_EXPIRATION_TIME });
    }
    generateRefreshToken(user) {
        const payload = { id: user.id, email: user.email, role: user.role };
        return jsonwebtoken_1.default.sign(payload, jwtConfig.JWT_REFRESH_SECRET_KEY, { expiresIn: jwtConfig.JWT_REFRESH_EXPIRATION_TIME });
    }
}
exports.AuthService = AuthService;
exports.default = new AuthService();
