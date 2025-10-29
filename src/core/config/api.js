// src/core/config/api.js
import axios from 'axios'; 

// --- Configuration Constants ---
export const BASE_URL = 'http://https://ardu-backend.onrender.com'; // Replace with your actual base URL
export const API_ENDPOINTS = {
    // Authentication
    REGISTER: '/api/users/register',
    LOGIN: '/api/auth/login',
    ADMIN_LOGIN: '/api/auth/admin/login',

    // Posts (Example endpoints)
    PUBLIC_POSTS: '/api/public/posts', // For getPublicPosts()
    POSTS: '/api/posts', // Base path for authenticated post actions
    
    // User Management (Example endpoints)
    USER_PROFILE: '/api/users', 
    // ... other endpoints
};

// --- Pre-configured Axios Instance ---
/**
 * A reusable Axios instance configured with the BASE_URL.
 * All requests made using this instance will automatically prepend 
 * the BASE_URL to the endpoint path.
 */
const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api; // Export the configured Axios instance as default
// Keep BASE_URL and API_ENDPOINTS as named exports for maximum flexibility
export { api as axiosInstance };