/**
 * Client-Side Date Formatting Utilities
 * Automatically formats dates to the user's local timezone
 */

const DateUtils = {
    /**
     * Formats a date string to the user's local date format
     * @param {string|Date} dateValue - The date to format
     * @param {object} options - Intl.DateTimeFormat options
     * @returns {string} Formatted date string
     */
    formatDate: function(dateValue, options = {}) {
        // console.log('Formatting date:', dateValue);
        if (!dateValue) return 'N/A';
        
        const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
        
        // console.log('Parsed date object:', date);
        // Check if date is valid
        // if (isNaN(date.getTime())) return 'Invalid Date';
        
        const defaultOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            ...options
        };
        
        return date.toLocaleDateString(undefined, defaultOptions);
    },

    /**
     * Formats a date string to the user's local date and time format
     * @param {string|Date} dateValue - The date to format
     * @param {object} options - Intl.DateTimeFormat options
     * @returns {string} Formatted date and time string
     */
    formatDateTime: function(dateValue, options = {}) {
        if (!dateValue) return 'N/A';
        
        const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
        
        // Check if date is valid
        if (isNaN(date.getTime())) return 'Invalid Date';
        
        const defaultOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            ...options
        };
        
        return date.toLocaleString(undefined, defaultOptions);
    },

    /**
     * Formats a date string to the user's local time format only
     * @param {string|Date} dateValue - The date to format
     * @param {object} options - Intl.DateTimeFormat options
     * @returns {string} Formatted time string
     */
    formatTime: function(dateValue, options = {}) {
        if (!dateValue) return 'N/A';
        
        const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
        
        // Check if date is valid
        if (isNaN(date.getTime())) return 'Invalid Date';
        
        const defaultOptions = {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            ...options
        };
        
        return date.toLocaleTimeString(undefined, defaultOptions);
    },

    /**
     * Formats a date for input fields (YYYY-MM-DD format)
     * @param {string|Date} dateValue - The date to format
     * @returns {string} Formatted date string for input fields
     */
    formatForInput: function(dateValue) {
        if (!dateValue) return '';
        
        const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
        
        // Check if date is valid
        if (isNaN(date.getTime())) return '';
        
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        return `${year}-${month}-${day}`;
    },

    /**
     * Gets the current date in the user's timezone for date input max attribute
     * @returns {string} Today's date in YYYY-MM-DD format
     */
    getTodayForInput: function() {
        const today = new Date();
        return this.formatForInput(today);
    },

    /**
     * Automatically formats all elements with data-date attribute
     * This should be called after DOM content is loaded or after dynamic content is added
     */
    formatAllDates: function() {
        // Format date elements
        document.querySelectorAll('[data-date]').forEach(element => {
            const dateValue = element.getAttribute('data-date');
            const formatType = element.getAttribute('data-format') || 'date';
            
            if (formatType === 'datetime') {
                element.textContent = this.formatDateTime(dateValue);
            } else if (formatType === 'time') {
                element.textContent = this.formatTime(dateValue);
            } else {
                element.textContent = this.formatDate(dateValue);
            }
        });
    },

    /**
     * Gets a relative time string (e.g., "2 hours ago", "3 days ago")
     * @param {string|Date} dateValue - The date to format
     * @returns {string} Relative time string
     */
    formatRelative: function(dateValue) {
        if (!dateValue) return 'N/A';
        
        const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
        
        // Check if date is valid
        if (isNaN(date.getTime())) return 'Invalid Date';
        
        const now = new Date();
        const diffMs = now - date;
        const diffSecs = Math.floor(diffMs / 1000);
        const diffMins = Math.floor(diffSecs / 60);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);
        
        if (diffSecs < 60) return 'just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
        if (diffDays < 30) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
        
        return this.formatDate(date);
    }
};

// Auto-format dates when DOM is ready
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function() {
        DateUtils.formatAllDates();
    });
}

// Make it available globally
if (typeof window !== 'undefined') {
    window.DateUtils = DateUtils;
}
