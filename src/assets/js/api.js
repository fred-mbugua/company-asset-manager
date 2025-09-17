// src/assets/js/api.js
// This file is now very simple as cookies are handled by the browser.

const api = async (endpoint, options = {}) => {
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        },
        // This is crucial for sending cookies with cross-origin requests
        credentials: 'include'
    };

    // Merge provided options with defaults
    const mergedOptions = { ...defaultOptions, ...options };
    
    // The browser automatically attaches the 'accessToken' cookie
    // So we don't need to add it to the Authorization header here.

    const url = `/api${endpoint}`;

    try {
        const response = await fetch(url, mergedOptions);
        
        // Handle unauthorized responses (e.g., expired token)
        if (response.status === 401) {
            // Optional: You could implement a refresh token flow here, but
            // for simplicity, we just redirect to login if the request fails
            window.location.href = '/login';
            return;
        }

        return response;
    } catch (error) {
        console.error('API call failed:', error);
        throw error;
    }
};

// Exporting the API helper for use in other JS files
window.api = api;