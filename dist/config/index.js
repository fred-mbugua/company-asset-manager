"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SMS_API_KEY = exports.MAIL_PASS = exports.MAIL_USER = exports.MAIL_SERVICE = exports.JWT_REFRESH_EXPIRATION_TIME = exports.JWT_ACCESS_EXPIRATION_TIME = exports.JWT_REFRESH_SECRET_KEY = exports.JWT_ACCESS_SECRET_KEY = exports.DATABASE_URL = exports.PORT = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.PORT = process.env.PORT || 3000;
exports.DATABASE_URL = process.env.DATABASE_URL;
exports.JWT_ACCESS_SECRET_KEY = process.env.JWT_ACCESS_SECRET || 'your-access-token-secret';
exports.JWT_REFRESH_SECRET_KEY = process.env.JWT_REFRESH_SECRET || 'your-refresh-token-secret';
exports.JWT_ACCESS_EXPIRATION_TIME = '1h';
exports.JWT_REFRESH_EXPIRATION_TIME = '7d';
exports.MAIL_SERVICE = process.env.MAIL_SERVICE;
exports.MAIL_USER = process.env.MAIL_USER;
exports.MAIL_PASS = process.env.MAIL_PASS;
exports.SMS_API_KEY = process.env.SMS_API_KEY;
