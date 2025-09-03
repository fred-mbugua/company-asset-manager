"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const routes_1 = require("./routes");
const database_1 = require("./config/database");
const config_1 = require("./config");
const logger_1 = __importDefault(require("./utils/logger"));
require("express-async-errors"); // Handles async errors in Express
const app = (0, express_1.default)();
// Middleware
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
// Connecting to database
(0, database_1.connectDB)();
// API Routes
app.use('/api', routes_1.mainRoutes);
// Global error handler
app.use((err, req, res, next) => {
    logger_1.default.error(err.stack);
    res.status(500).json({ error: 'Something went wrong' });
});
app.listen(config_1.PORT, () => {
    logger_1.default.info(`Server running on port ${config_1.PORT}`);
});
