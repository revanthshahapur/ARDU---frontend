// src/features/Auth/services/authHeaderService.js

// Storage keys
const TOKEN_KEY = 'user_jwt_token';
const USER_KEY = 'user_data';

export const getAuthToken = () => {
    try {
        return localStorage.getItem(TOKEN_KEY);
    } catch {
        return null;
    }
};

export const getCurrentUser = () => {
    try {
        const str = localStorage.getItem(USER_KEY);
        return str ? JSON.parse(str) : null;
    } catch {
        return null;
    }
};

export const getAuthHeaders = () => {
    const token = getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const handleAuthError = (error, defaultMessage = 'Authentication error') => {
    if (error?.response) {
        const status = error.response.status;
        if (status === 401) throw new Error('Session expired. Please log in again.');
        if (status === 403) throw new Error("Access denied. You don't have permission to perform this action.");
        throw new Error(error.response.data?.message || defaultMessage);
    }
    throw new Error('Network error. Please check your connection.');
};


export const getAuthHeader = getAuthHeaders;
