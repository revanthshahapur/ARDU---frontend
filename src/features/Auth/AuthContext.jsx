import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { loginUser, logout as logoutService, saveAuthData, clearAuthData } from './services/authService';

// 1. Define the Context
const AuthContext = createContext(null);

/**
 * Custom hook to use the Auth context
 * @returns {{
 * user: {id: number, email: string, name: string, role: string, mainAdmin: boolean} | null,
 * token: string | null,
 * isAuthenticated: boolean,
 * isLoading: boolean,
 * login: (email: string, password: string) => Promise<void>,
 * logout: () => void
 * }}
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

// Helper function to read auth data from LocalStorage
const getInitialAuthData = () => {
    try {
        const token = localStorage.getItem('user_jwt_token');
        const userDataString = localStorage.getItem('user_data');
        
        if (token && userDataString) {
            const user = JSON.parse(userDataString);
            return { token, user, isAuthenticated: true };
        }
    } catch (error) {
        console.error("Error reading auth data from localStorage:", error);
        // Clear broken data
        clearAuthData();
    }
    return { token: null, user: null, isAuthenticated: false };
};


// 2. Define the Provider Component
export const AuthProvider = ({ children }) => {
    const [authData, setAuthData] = useState(getInitialAuthData);
    const [isLoading, setIsLoading] = useState(false);

    // -------------------
    // AUTH ACTIONS
    // -------------------

    // Handles the login API call and state update
    const login = async (email, password) => {
        setIsLoading(true);
        try {
            const response = await loginUser(email, password); // This call also saves data to localStorage
            
            // Update context state directly from the successful response
            const { jwt, ...userData } = response;
            setAuthData({
                token: jwt.token,
                user: userData,
                isAuthenticated: true
            });
            return response; // Pass response back for component use (e.g., notification)

        } catch (error) {
            // Error handling is managed by authService, just re-throw
            throw error; 
        } finally {
            setIsLoading(false);
        }
    };

    // Handles logout and state cleanup
    const logout = () => {
        logoutService(); // Clears LocalStorage
        setAuthData({ user: null, token: null, isAuthenticated: false });
        // Optional: Redirect the user to the login page
        window.location.href = '/login'; 
    };

    // Memoize the context value to prevent unnecessary re-renders
    const contextValue = useMemo(() => ({
        user: authData.user,
        token: authData.token,
        isAuthenticated: authData.isAuthenticated,
        isAdmin: authData.user?.role === 'ADMIN' || authData.user?.role === 'MAIN_ADMIN',
        isLoading,
        login,
        logout,
    }), [authData, isLoading]);


    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};
