"use strict";
/**
 * Date Formatting Utility
 * Provides consistent date formatting throughout the application
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatDateOnlyForDisplay = exports.formatDateTimeForDisplay = exports.formatForDisplay = exports.formatForAPI = exports.formatForDatabase = void 0;
/**
 * Formats a date to ISO string format for database storage
 * All dates are stored in UTC in the database
 */
const formatForDatabase = (date) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toISOString();
};
exports.formatForDatabase = formatForDatabase;
/**
 * Formats a date for API responses
 * Returns ISO string which can be converted to local time on the client
 */
const formatForAPI = (date) => {
    if (!date)
        return null;
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toISOString();
};
exports.formatForAPI = formatForAPI;
/**
 * Formats a date for display in EJS templates (server-side rendering)
 * This creates a data attribute that can be converted to local time on the client
 */
const formatForDisplay = (date) => {
    if (!date)
        return 'N/A';
    const d = typeof date === 'string' ? new Date(date) : date;
    // Return ISO string - will be converted to local time on client side
    return d.toISOString();
};
exports.formatForDisplay = formatForDisplay;
/**
 * Formats a date for display with time
 */
const formatDateTimeForDisplay = (date) => {
    if (!date)
        return 'N/A';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toISOString();
};
exports.formatDateTimeForDisplay = formatDateTimeForDisplay;
/**
 * Formats a date for display (date only, no time)
 */
const formatDateOnlyForDisplay = (date) => {
    if (!date)
        return 'N/A';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toISOString().split('T')[0];
};
exports.formatDateOnlyForDisplay = formatDateOnlyForDisplay;
exports.default = {
    formatForDatabase: exports.formatForDatabase,
    formatForAPI: exports.formatForAPI,
    formatForDisplay: exports.formatForDisplay,
    formatDateTimeForDisplay: exports.formatDateTimeForDisplay,
    formatDateOnlyForDisplay: exports.formatDateOnlyForDisplay
};
