class API {
    /**
     * Core request handler that constructs the URL, headers, and body.
     * @param {string} method - HTTP method (GET, POST, PUT, DELETE).
     * @param {string} url - API endpoint path (e.g., '/assets').
     * @param {object | null} data - Data for POST/PUT requests.
     * @param {object | null} params - Query parameters for GET requests (e.g., {limit: 20, offset: 0}).
     */
    static async request(method, url, data = null, params = null) {
        let fullUrl = `/api${url}`;
        
        // Convert parameters object to query string and append to URL for GET requests
        if (params && method === 'GET') {
            const queryString = new URLSearchParams(params).toString();
            if (queryString) {
                fullUrl = `${fullUrl}?${queryString}`;
            }
        }

        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                // Cookie is automatically attached by the browser
            },
            // For GET/HEAD requests, the body must be null
            body: (method !== 'GET' && data) ? JSON.stringify(data) : null,
        };

        try {
            const response = await fetch(fullUrl, options);

            const jsonResponse = await response.json();

            // Handle 401 Unauthorized for token expiration (but not for login endpoint)
            if (response.status === 401 && url !== '/auth/login') {
                window.location.href = '/login'; 
                return; 
            }

            if (!response.ok) {
                throw new Error(jsonResponse.message || 'API request failed.');
            }

            return jsonResponse;
        } catch (error) {
            console.error(`API Error on ${method} ${url}:`, error);
            throw error;
        }
    }

    /**
     * GET request method
     * @param {string} url - The API endpoint (e.g., '/reports/assets').
     * @param {object | null} params - The query parameters object (e.g., {limit: 20, type: 'Laptop'}).
     */
    static get(url, params = null) { 
        return this.request('GET', url, null, params); // Pass params to the request method
    }

    static post(url, data) { return this.request('POST', url, data); }
    static put(url, data) { return this.request('PUT', url, data); }
    static patch(url, data) { return this.request('PATCH', url, data); }
    static delete(url) { return this.request('DELETE', url); }

    /**
     * Upload files using FormData
     * @param {string} url - The API endpoint
     * @param {FormData} formData - FormData object with files
     */
    static async upload(url, formData, method = 'POST') {
        const fullUrl = `/api${url}`;
        
        try {
            const response = await fetch(fullUrl, {
                method: method,
                body: formData
                // Don't set Content-Type header - browser will set it with boundary
            });

            const jsonResponse = await response.json();

            if (response.status === 401 && url !== '/auth/login') {
                window.location.href = '/login'; 
                return; 
            }

            if (!response.ok) {
                throw new Error(jsonResponse.message || 'Upload failed.');
            }

            return jsonResponse;
        } catch (error) {
            console.error(`API Upload Error on ${url}:`, error);
            throw error;
        }
    }
}