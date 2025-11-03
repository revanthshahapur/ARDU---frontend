import React, { useState } from 'react';
import PendingUsers from './PendingUsers';
import PendingPosts from './PendingPosts';
import { useAuth } from '../Auth/useAuth'; 
import AuthLayout from '../../components/layouts/AuthLayout'; 

const AdminReviewPage = () => {
    const { isAdmin, isLoading, user } = useAuth();
    const [activeTab, setActiveTab] = useState('users');
    
    // 1. Loading State
    if (isLoading) {
        return <div className="text-center p-10 text-lg text-indigo-600">Loading user permissions...</div>;
    }

    // 2. Authorization Check
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

    // 3. Render Admin Content with Tabs
    return (
        <AuthLayout> 
            <div className="admin-review-page p-4 sm:p-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Admin Review Panel</h1>
                    
                    {/* Tab Navigation */}
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8">
                            <button
                                onClick={() => setActiveTab('users')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'users'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                Pending Users
                            </button>
                            <button
                                onClick={() => setActiveTab('posts')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'posts'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                Pending Posts
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="mt-6">
                    {activeTab === 'users' ? <PendingUsers /> : <PendingPosts />}
                </div>
            </div>
        </AuthLayout>
    );
};

export default AdminReviewPage;