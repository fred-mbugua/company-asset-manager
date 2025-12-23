import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import cors from 'cors';
import { connectDB, pool } from './config/database';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';

// Initialize the PostgreSQL Session Store
const PgSession = connectPgSimple(session);

const app = express();
// app.use(session({
//     secret: 'assetManager@2025', // strong secret key
//     resave: false,
//     saveUninitialized: true,
//     cookie: { secure: process.env.NODE_ENV === 'production' }
// }));

app.use(session({
    secret: process.env.SESSION_SECRET || 'assetManager@2025', // Must be secure
    resave: false,
    saveUninitialized: false,
    // Use the external PostgreSQL store
    store: new PgSession({
        pool: pool, // Use the existing PG connection pool
        tableName: 'session', // The name of the table to store sessions
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 // 24 hours
    }
}));

import { mainRoutes, viewsRoutes } from './routes';
import { PORT } from './config';
import logger from './utils/logger';
import 'express-async-errors'; // Handles async errors in Express
import { currentPathMiddleware, systemConfigMiddleware } from './middlewares';



// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(currentPathMiddleware); // Add current path to all requests
app.use(systemConfigMiddleware); // Add system configuration to all views

// Connecting to database
connectDB();

// Serve static files (CSS, JS, images)
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Configure EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// API Routes
app.use('/api', mainRoutes);

// View Routes
app.use('/', viewsRoutes);

// Catch-all route to serve the login page as the default
app.get('/', (req, res) => {
    res.redirect('/login');
});

// 404 handler - must be after all other routes
app.use((req: express.Request, res: express.Response) => {
    res.status(404).render('404');
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(err.stack);
  res.status(500).json({ error: 'Something went wrong' });
});

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});