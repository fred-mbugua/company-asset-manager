/**
 * Date Formatting Utility
 * Provides consistent date formatting throughout the application
 */

/**
 * Formats a date to ISO string format for database storage
 * All dates are stored in UTC in the database
 */
export const formatForDatabase = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toISOString();
};

/**
 * Formats a date for API responses
 * Returns ISO string which can be converted to local time on the client
 */
export const formatForAPI = (date: Date | string | null): string | null => {
    if (!date) return null;
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toISOString();
};

/**
 * Formats a date for display in EJS templates (server-side rendering)
 * This creates a data attribute that can be converted to local time on the client
 */
export const formatForDisplay = (date: Date | string | null): string => {
    if (!date) return 'N/A';
    const d = typeof date === 'string' ? new Date(date) : date;
    // Return ISO string - will be converted to local time on client side
    return d.toISOString();
};

/**
 * Formats a date for display with time
 */
export const formatDateTimeForDisplay = (date: Date | string | null): string => {
    if (!date) return 'N/A';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toISOString();
};

/**
 * Formats a date for display (date only, no time)
 */
export const formatDateOnlyForDisplay = (date: Date | string | null): string => {
    if (!date) return 'N/A';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toISOString().split('T')[0];
};

export default {
    formatForDatabase,
    formatForAPI,
    formatForDisplay,
    formatDateTimeForDisplay,
    formatDateOnlyForDisplay
};
