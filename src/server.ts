import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import cors from 'cors';
import { mainRoutes, viewsRoutes } from './routes';
import { connectDB } from './config/database';
import { PORT } from './config';
import logger from './utils/logger';
import 'express-async-errors'; // Handles async errors in Express

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors());

// Connecting to database
connectDB();

// Serve static files (CSS, JS, images)
app.use('/assets', express.static(path.join(__dirname, 'assets')));

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

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(err.stack);
  res.status(500).json({ error: 'Something went wrong' });
});

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});