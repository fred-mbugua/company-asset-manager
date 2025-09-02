import dotenv from 'dotenv';
dotenv.config();

export const PORT = process.env.PORT || 3000;
export const DATABASE_URL = process.env.DATABASE_URL;
export const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'your-access-token-secret';
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-token-secret';
export const JWT_ACCESS_EXPIRATION = process.env.JWT_ACCESS_EXPIRATION || '15m';
export const JWT_REFRESH_EXPIRATION = process.env.JWT_REFRESH_EXPIRATION || '7d';
export const MAIL_SERVICE = process.env.MAIL_SERVICE;
export const MAIL_USER = process.env.MAIL_USER;
export const MAIL_PASS = process.env.MAIL_PASS;
export const SMS_API_KEY = process.env.SMS_API_KEY;