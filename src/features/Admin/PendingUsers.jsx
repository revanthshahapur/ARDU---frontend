import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../Auth/useAuth';

const PendingUsers = () => {
    const { user, isAuthenticated, token } = useAuth();
    const [users, setUsers] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    const fetchPendingUsers = useCallback(async () => {
        try {
            const response = await fetch('https://ardu-backend.onrender.com/api/admin/users/pending', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch pending users');
            }

            const data = await response.json();
            setUsers(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching users:', err);
            setError('Failed to load pending users');
        } finally {
            setLoading(false);
        }
    }, [token]);

    const handleUserAction = async (userId, action) => {
        setActionLoading(userId);
        try {
            const endpoint = `https://ardu-backend.onrender.com/api/admin/users/${userId}/${action}`;

            const response = await fetch(endpoint, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to ${action} user: ${errorText || response.statusText}`);
            }

            // Remove the user from the list after successful action
            setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
            setError(null);
            
        } catch (err) {
            console.error(`Error ${action}ing user:`, err);
            setError(`Failed to ${action} user. Please try again.`);
        } finally {
            setActionLoading(null);
        }
    };

    useEffect(() => {
        if (isAuthenticated && token) {
            fetchPendingUsers();
        }
    }, [isAuthenticated, token, fetchPendingUsers]);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Loading pending users...</span>
            </div>
        );
    }

    return (
        <div className="bg-white">
            <div className="max-w-md mx-auto bg-white">
                {/* Simple Header */}
                <div className="p-4 border-b border-gray-200">
                    <h1 className="text-xl font-semibold text-gray-900">Pending Users ({users.length})</h1>
                </div>
            
                {error && (
                    <div className="p-4 bg-red-50 border-b border-red-200">
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                )}

                {users.length === 0 ? (
                    <div className="p-8 text-center">
                        <div className="text-gray-400 text-4xl mb-3">👥</div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No pending users</h3>
                        <p className="text-gray-500 text-sm">All users have been reviewed</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {users.map(user => (
                            <div key={user.id} className="p-4">
                                {/* User Info */}
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                                        {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 truncate">{user.name || 'No Name'}</p>
                                        <p className="text-sm text-gray-500 truncate">{user.email}</p>
                                    </div>
                                </div>

                                {/* User Details */}
                                <div className="mb-3 text-sm text-gray-600 space-y-1">
                                    <p>Registered: {new Date(user.createdAt || user.registeredAt).toLocaleDateString()}</p>
                                    <p>Role: {user.role || 'USER'}</p>
                                    {user.mobileNumber && <p>Phone: {user.mobileNumber}</p>}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => handleUserAction(user.id, 'approve')}
                                        disabled={actionLoading === user.id}
                                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                                            actionLoading === user.id 
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                                        }`}
                                    >
                                        {actionLoading === user.id ? 'Processing...' : 'Approve'}
                                    </button>
                                    <button 
                                        onClick={() => handleUserAction(user.id, 'reject')}
                                        disabled={actionLoading === user.id}
                                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                                            actionLoading === user.id 
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                                        }`}
                                    >
                                        {actionLoading === user.id ? 'Processing...' : 'Reject'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PendingUsers;