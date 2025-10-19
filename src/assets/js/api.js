// class API {
//     static async request(method, url, data = null) {
//         const fullUrl = `/api${url}`; // Assuming API prefix
//         const options = {
//             method: method,
//             headers: {
//                 'Content-Type': 'application/json',
//                 // JWT is handled by HTTP-only cookies, no need to manually attach headers
//             },
//             body: data ? JSON.stringify(data) : null,
//         };

//         try {
//             const response = await fetch(fullUrl, options);

//             // Handle 401 Unauthorized for token expiration
//             if (response.status === 401) {
//                 // The server should handle token refresh/re-issuance implicitly. 
//                 // If it still returns 401, it means refresh failed.
//                 window.location.href = '/login'; // Redirect to login
//                 return; 
//             }

//             const jsonResponse = await response.json();

//             if (!response.ok) {
//                 // Throw an error with the server message
//                 throw new Error(jsonResponse.message || 'API request failed.');
//             }

//             return jsonResponse;
//         } catch (error) {
//             // Log for debugging and re-throw for service/controller to handle
//             console.error(`API Error on ${method} ${url}:`, error);
//             throw error;
//         }
//     }

//     static get(url) { return this.request('GET', url); }
//     static post(url, data) { return this.request('POST', url, data); }
//     static put(url, data) { return this.request('PUT', url, data); }
//     static delete(url) { return this.request('DELETE', url); }
// }

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

            // Handle 401 Unauthorized for token expiration
            if (response.status === 401) {
                window.location.href = '/login'; 
                return; 
            }

            const jsonResponse = await response.json();

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
    static delete(url) { return this.request('DELETE', url); }
}