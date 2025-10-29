// src/features/Auth/services/authService.js

import axios from 'axios';
import { BASE_URL, API_ENDPOINTS } from '../../../core/config/api'; 

const api = axios.create({
    baseURL: BASE_URL,
    // Add Content-Type to avoid serialization issues
    headers: {
        'Content-Type': 'application/json',
    },
});

// --- AUTH UTILITIES: TOKEN STORAGE CONSTANTS ---
const TOKEN_KEY = 'user_jwt_token';
const USER_KEY = 'user_data';

/**
 * Helper to handle and format API errors
 */
const handleApiError = (error, defaultMessage) => {
    if (error.response) {
        const errorData = error.response.data;
        const statusCode = error.response.status;

        let errorMessage = errorData.message || defaultMessage;
        
        // 🎯 NEW: Logic to explicitly handle unapproved accounts
        if (statusCode === 403) {
             errorMessage = "Access Denied. Your account may not be approved yet by an admin, or your credentials are incorrect.";
        }
        // Existing logic for general 400 validation errors
        else if (statusCode === 400 && errorData.errors && Array.isArray(errorData.errors)) {
            errorMessage = errorData.errors.map(e => e.detail || e.message).join('; ');
        }
        
        throw new Error(errorMessage);
    }
    throw new Error('Network Error: Could not reach the server.');
};

// --- AUTH UTILITIES: TOKEN STORAGE FUNCTIONS ---
/**
 * Stores the authentication data (JWT and user details) in LocalStorage.
 * @param {object} data - The response object from the login API.
 */
export const saveAuthData = (data) => {
    // 1. Store the JWT token
    localStorage.setItem(TOKEN_KEY, data.jwt.token);
    try {
        // Also set a cookie for the JWT for server-assisted flows
        const token = data?.jwt?.token;
        const expiresSec = data?.jwt?.expiresInSeconds || 86400; // default 1 day if not provided
        if (token && typeof document !== 'undefined') {
            const expires = new Date(Date.now() + expiresSec * 1000).toUTCString();
            document.cookie = `${encodeURIComponent(TOKEN_KEY)}=${encodeURIComponent(token)}; Expires=${expires}; Path=/; SameSite=Lax`;
        }
    } catch {}
    
    // 2. Store minimal user details
    const userDataToStore = { 
        id: data.id, 
        email: data.email, 
        name: data.name, 
        role: data.role, 
        mainAdmin: data.mainAdmin 
    };
    localStorage.setItem(USER_KEY, JSON.stringify(userDataToStore));
};

/**
 * Clears authentication data from LocalStorage.
 */
export const clearAuthData = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    try {
        if (typeof document !== 'undefined') {
            // Expire the cookie immediately
            document.cookie = `${encodeURIComponent(TOKEN_KEY)}=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/; SameSite=Lax`;
        }
    } catch {}
};


// --- NEW SERVICE: LOGIN ---
/**
 * Handles user login and stores the JWT token if successful and approved.
 * @param {string} email - User's email.
 * @param {string} password - User's password.
 * @returns {Promise<object>} The response data upon successful login.
 */
export const loginUser = async (email, password) => {
    const payload = { email, password };

    // 1) Try member login first
    try {
        const memberResp = await api.post(API_ENDPOINTS.LOGIN, payload);
        saveAuthData(memberResp.data);
        return memberResp.data;
    } catch (memberErr) {
        // If explicitly forbidden, surface the approval message immediately
        if (memberErr?.response?.status === 403) {
            handleApiError(memberErr, 'Access denied. Your account may not be approved yet.');
        }

        // 2) If member login failed for other reasons (e.g., wrong endpoint/role), try admin login
        try {
            const adminResp = await api.post(API_ENDPOINTS.ADMIN_LOGIN, payload);
            saveAuthData(adminResp.data);
            return adminResp.data;
        } catch (adminErr) {
            // Preserve explicit 403 from admin endpoint too
            if (adminErr?.response?.status === 403) {
                handleApiError(adminErr, 'Access denied. Your account may not be approved yet.');
            }
            // Fallback unified error
            handleApiError(adminErr, 'Login failed. Please check your credentials.');
        }
    }
};

// --- EXISTING SERVICE: LOGOUT ---
export const logout = () => {
    clearAuthData();
    // Logic to redirect the user (e.g., window.location.href = '/login') should be in the component.
};

// --- EXISTING SERVICE: INITIAL REGISTRATION ---
export const registerUser = async (basicUserData) => {
    try {
        const response = await api.post(API_ENDPOINTS.REGISTER, basicUserData);
        return response.data;
    } catch (error) {
        handleApiError(error, 'Initial registration failed due to a server error.');
    }
};

// --- EXISTING SERVICE: PROFILE UPDATE ---
export const updateProfile = async (userId, profileData) => {
    try {
        // Conceptual endpoint: Using a PUT or PATCH request to update an existing user's profile
        // NOTE: This assumes API_ENDPOINTS.USER_PROFILE is defined if the path changes.
        const response = await api.patch(`/api/users/${userId}/profile`, profileData); 
        return response.data;
    } catch (error) {
        handleApiError(error, 'Failed to update user profile. Please check the profile data format.');
    }
};




