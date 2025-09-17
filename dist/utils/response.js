"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorResponse = exports.successResponse = void 0;
/**
 * Sends a consistent success response.
 * @param res The Express Response object.
 * @param status The HTTP status code (e.g., 200, 201).
 * @param message A success message.
 * @param data The payload data.
 */
const successResponse = (res, status, message, data) => {
    const response = {
        success: true,
        message,
        data
    };
    res.status(status).json(response);
};
exports.successResponse = successResponse;
/**
 * Sends a consistent error response.
 * @param res The Express Response object.
 * @param status The HTTP status code (e.g., 400, 401, 500).
 * @param message An error message.
 * @param data Optional error details.
 */
const errorResponse = (res, status, message, data) => {
    const response = {
        success: false,
        message,
        data
    };
    res.status(status).json(response);
};
exports.errorResponse = errorResponse;
