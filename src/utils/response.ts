import { Response } from 'express';

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

/**
 * Sends a consistent success response.
 * @param res The Express Response object.
 * @param status The HTTP status code (e.g., 200, 201).
 * @param message A success message.
 * @param data The payload data.
 */
export const successResponse = <T>(res: Response, status: number, message: string, data?: T) => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data
  };
  res.status(status).json(response);
};

/**
 * Sends a consistent error response.
 * @param res The Express Response object.
 * @param status The HTTP status code (e.g., 400, 401, 500).
 * @param message An error message.
 * @param data Optional error details.
 */
export const errorResponse = <T>(res: Response, status: number, message: string, data?: T) => {
  const response: ApiResponse<T> = {
    success: false,
    message,
    data
  };
  res.status(status).json(response);
};