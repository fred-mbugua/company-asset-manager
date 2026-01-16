"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
const database_1 = require("./config/database");
const express_session_1 = __importDefault(require("express-session"));
const connect_pg_simple_1 = __importDefault(require("connect-pg-simple"));
// Initialize the PostgreSQL Session Store
const PgSession = (0, connect_pg_simple_1.default)(express_session_1.default);
const app = (0, express_1.default)();
// app.use(session({
//     secret: 'assetManager@2025', // strong secret key
//     resave: false,
//     saveUninitialized: true,
//     cookie: { secure: process.env.NODE_ENV === 'production' }
// }));
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET || 'assetManager@2025', // Must be secure
    resave: false,
    saveUninitialized: false,
    // Use the external PostgreSQL store
    store: new PgSession({
        pool: database_1.pool, // Use the existing PG connection pool
        tableName: 'session', // The name of the table to store sessions
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 // 24 hours
    }
}));
const routes_1 = require("./routes");
const config_1 = require("./config");
const logger_1 = __importDefault(require("./utils/logger"));
require("express-async-errors"); // Handles async errors in Express
const middlewares_1 = require("./middlewares");
// Middleware
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)());
app.use(middlewares_1.currentPathMiddleware); // Add current path to all requests
app.use(middlewares_1.systemConfigMiddleware); // Add system configuration to all views
// Connecting to database
(0, database_1.connectDB)();
// Serve static files (CSS, JS, images)
app.use('/assets', express_1.default.static(path_1.default.join(process.cwd(), 'src', 'assets')));
app.use('/uploads', express_1.default.static(path_1.default.join(process.cwd(), 'uploads')));
// Configure EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path_1.default.join(process.cwd(), 'src', 'views'));
// API Routes
app.use('/api', routes_1.mainRoutes);
// View Routes
app.use('/', routes_1.viewsRoutes);
// Catch-all route to serve the login page as the default
app.get('/', (req, res) => {
    res.redirect('/login');
});
// 404 handler - must be after all other routes
app.use((req, res) => {
    res.status(404).render('404');
});
// Global error handler
app.use((err, req, res, next) => {
    logger_1.default.error(err.stack);
    res.status(500).json({ error: 'Something went wrong' });
});
app.listen(config_1.PORT, () => {
    logger_1.default.info(`Server running on port ${config_1.PORT}`);
});
