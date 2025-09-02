import { Pool } from 'pg';
import { DATABASE_URL } from './index';
import logger from '../utils/logger';

const pool = new Pool({
  connectionString: DATABASE_URL,
});

export const connectDB = async () => {
  try {
    await pool.connect();
    logger.info('Database connected successfully!');
  } catch (error) {
    logger.error('Database connection failed:', error);
    process.exit(1);
  }
};

export default pool;