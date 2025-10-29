import React from 'react';
import PendingUsers from './PendingUsers';
import { useAuth } from '../Auth/useAuth'; 
import AuthLayout from '../../components/layouts/AuthLayout'; 

const AdminReviewPage = () => {
    const { isAdmin, isLoading, user } = useAuth();
    
    // 1. Loading State
    if (isLoading) {
        // You can use your AutoRickshawLoader here if desired
        return <div className="text-center p-10 text-lg text-indigo-600">Loading user permissions...</div>;
    }

    // 2. Authorization Check
    // If the user is not an admin or not logged in, show an access denied message.
    if (!user || !isAdmin) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center p-10 bg-white shadow-xl rounded-lg max-w-lg">
                    <h1 className="text-3xl font-bold text-red-600 mb-4">403 Forbidden</h1>
                    <p className="text-gray-700">You do not have the required permissions to access the Admin Review Queue.</p>
                </div>
            </div>
        );
    }

    // 3. Render Admin Content (Layout + Users)
    return (
        <AuthLayout> 
            <div className="admin-review-page p-4 sm:p-8">
                <PendingUsers />
            </div>
        </AuthLayout>
    );
};

export default AdminReviewPage;