import express from 'express';
import cookieParser from 'cookie-parser';
import { mainRoutes } from './routes';
import { connectDB } from './config/database';
import { PORT } from './config';
import logger from './utils/logger';
import 'express-async-errors'; // Handles async errors in Express

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// Connecting to database
connectDB();

// API Routes
app.use('/api', mainRoutes);

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(err.stack);
  res.status(500).json({ error: 'Something went wrong' });
});

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});