import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext'; 

/**
 * AuthGuard component wraps routes that require authentication.
 * If the user is authenticated, it renders the children.
 * If not, it redirects to the login page.
 */
const AuthGuard = ({ children }) => {
    // Get the authentication state from the context
    const { isAuthenticated, isLoading } = useAuth();

    // While checking LocalStorage or performing initial load
    if (isLoading) {
        // You might replace this with a full-screen spinner later
        return <div className="p-8 text-center text-xl">Loading authentication state...</div>; 
    }

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // If authenticated, render the protected component
    return children;
};

export default AuthGuard;
