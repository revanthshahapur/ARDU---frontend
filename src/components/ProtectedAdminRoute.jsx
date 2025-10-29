import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../features/Auth/AuthContext';

const ProtectedAdminRoute = ({ children }) => {
    const { user, isAuthenticated, isLoading } = useAuth();
    
    useEffect(() => {
        // Detailed debug logging
        const debug = {
            isAuthenticated,
            userRole: user?.role,
            isMainAdmin: user?.mainAdmin === true,
            tokenRole: user?.role === 'MAIN_ADMIN',
            user: JSON.stringify(user, null, 2)
        };
        console.table(debug);
    }, [isAuthenticated, user]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    // Check authentication first
    if (!isAuthenticated || !user) {
        return <Navigate to="/login" state={{ from: window.location.pathname }} replace />;
    }

    // Check for admin access - using both role and mainAdmin flag
    const isAdmin = user.role === 'MAIN_ADMIN' || user.role === 'ADMIN' || user.mainAdmin === true;
    
    if (isAdmin) {
        console.log('Access granted - User has admin privileges');
        return children;
    }

    // Access denied with detailed logging
    console.error('Access denied:', {
        role: user.role,
        mainAdmin: user.mainAdmin,
        isAuthenticated,
        userId: user.id
    });

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
                <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
                <p className="text-gray-600 mb-4">
                    Sorry, you don't have permission to access this page. 
                    This area is restricted to administrators only.
                </p>
                <div className="text-sm text-gray-500 mb-4">
                    Current role: {user.role || 'No role assigned'}
                </div>
                <button 
                    onClick={() => window.history.back()} 
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Go Back
                </button>
            </div>
        </div>
    );
};

export default ProtectedAdminRoute;