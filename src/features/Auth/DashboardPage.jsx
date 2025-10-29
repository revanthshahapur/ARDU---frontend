import React from 'react';
import { useAuth } from '../features/Auth/AuthContext'; 
import { Button } from '../components/ui/button';

/**
 * Mock Protected Dashboard Page
 */
const DashboardPage = () => {
    // Consume the authentication state
    const { user, logout } = useAuth();
    
    // Ensure the user exists before accessing properties, though AuthGuard should handle it
    if (!user) return <div className="p-8 text-center">User data missing.</div>;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center p-8">
            <div className="w-full max-w-4xl bg-white shadow-lg rounded-xl p-8 space-y-6">
                <h1 className="text-4xl font-extrabold text-indigo-700">
                    Welcome to the Social Platform, {user.name}!
                </h1>
                
                <div className="p-6 bg-indigo-50 border-l-4 border-indigo-500 rounded-md">
                    <h2 className="text-2xl font-semibold mb-2">Your Profile Details</h2>
                    <p><strong>ID:</strong> {user.id}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Role:</strong> <span className="font-mono px-2 py-0.5 bg-green-200 text-green-800 rounded">{user.role}</span></p>
                    <p><strong>Main Admin:</strong> {user.mainAdmin ? 'Yes' : 'No'}</p>
                    <p className="mt-4 text-sm text-gray-600">
                        This page is protected by the **AuthGuard**. Only approved users with a valid token can see this content.
                    </p>
                </div>

                <div className="flex justify-end">
                    <Button 
                        onClick={logout} 
                        variant="destructive"
                    >
                        Logout
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
