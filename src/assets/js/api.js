// public/assets/js/api.js

class API {
    static async request(method, url, data = null) {
        const fullUrl = `/api${url}`; // Assuming API prefix
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                // JWT is handled by HTTP-only cookies, no need to manually attach headers
            },
            body: data ? JSON.stringify(data) : null,
        };

        try {
            const response = await fetch(fullUrl, options);

            // Handle 401 Unauthorized for token expiration
            if (response.status === 401) {
                // The server should handle token refresh/re-issuance implicitly. 
                // If it still returns 401, it means refresh failed.
                window.location.href = '/login'; // Redirect to login
                return; 
            }

            const jsonResponse = await response.json();

            if (!response.ok) {
                // Throw an error with the server message
                throw new Error(jsonResponse.message || 'API request failed.');
            }

            return jsonResponse;
        } catch (error) {
            // Log for debugging and re-throw for service/controller to handle
            console.error(`API Error on ${method} ${url}:`, error);
            throw error;
        }
    }

    static get(url) { return this.request('GET', url); }
    static post(url, data) { return this.request('POST', url, data); }
    static put(url, data) { return this.request('PUT', url, data); }
    static delete(url) { return this.request('DELETE', url); }
}