"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const pg_1 = require("pg");
const index_1 = require("./index");
const logger_1 = __importDefault(require("../utils/logger"));
const pool = new pg_1.Pool({
    connectionString: index_1.DATABASE_URL,
});
const connectDB = async () => {
    try {
        await pool.connect();
        logger_1.default.info('Database connected successfully!');
    }
    catch (error) {
        logger_1.default.error('Database connection failed:', error);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
exports.default = pool;
