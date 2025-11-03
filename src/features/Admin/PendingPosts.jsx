import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../Auth/useAuth';

const PendingPosts = () => {
    const { token } = useAuth();
    const [posts, setPosts] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    const fetchPendingPosts = useCallback(async () => {
        try {
            // Try different possible endpoints
            let response;
            const endpoints = [
                'https://ardu-backend.onrender.com/api/posts/pending',
                'https://ardu-backend.onrender.com/api/admin/posts/pending',
                'https://ardu-backend.onrender.com/api/posts/admin/pending'
            ];

            for (const endpoint of endpoints) {
                try {
                    response = await fetch(endpoint, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    if (response.ok) break;
                } catch (e) {
                    continue;
                }
            }

            if (!response || !response.ok) {
                throw new Error('No valid endpoint found for pending posts');
            }

            const data = await response.json();
            setPosts(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching posts:', err);
            setError('Backend endpoint for pending posts not available yet');
        } finally {
            setLoading(false);
        }
    }, [token]);

    const handlePostAction = async (postId, action) => {
        setActionLoading(postId);
        try {
            const endpoint = `https://ardu-backend.onrender.com/api/posts/${postId}/${action}`;

            const response = await fetch(endpoint, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to ${action} post: ${errorText || response.statusText}`);
            }

            // Remove the post from the list after successful action
            setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
            setError(null);
            
        } catch (err) {
            console.error(`Error ${action}ing post:`, err);
            setError(`Failed to ${action} post. Please try again.`);
        } finally {
            setActionLoading(null);
        }
    };

    useEffect(() => {
        if (token) {
            fetchPendingPosts();
        }
    }, [token, fetchPendingPosts]);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Loading pending posts...</span>
            </div>
        );
    }

    return (
        <div className="bg-white">
            <div className="max-w-2xl mx-auto bg-white">
                <div className="p-4 border-b border-gray-200">
                    <h1 className="text-xl font-semibold text-gray-900">Pending Posts ({posts.length})</h1>
                </div>
            
                {error && (
                    <div className="p-4 bg-red-50 border-b border-red-200">
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                )}

                {posts.length === 0 ? (
                    <div className="p-8 text-center">
                        <div className="text-gray-400 text-4xl mb-3">📝</div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No pending posts</h3>
                        <p className="text-gray-500 text-sm">All posts have been reviewed</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {posts.map(post => (
                            <div key={post.id} className="p-4">
                                {/* Post Content */}
                                {post.contentUrl && (
                                    <div className="mb-3">
                                        {post.contentUrl.includes('video') ? (
                                            <video 
                                                src={post.contentUrl} 
                                                controls 
                                                className="w-full max-h-64 object-contain rounded"
                                            />
                                        ) : (
                                            <img 
                                                src={post.contentUrl} 
                                                alt="Post content" 
                                                className="w-full max-h-64 object-contain rounded"
                                            />
                                        )}
                                    </div>
                                )}

                                {/* Post Caption */}
                                {post.caption && (
                                    <div className="mb-3">
                                        <p className="text-gray-800">{post.caption}</p>
                                    </div>
                                )}

                                {/* Post Details */}
                                <div className="mb-3 text-sm text-gray-600 space-y-1">
                                    <p>Posted by: {post.user?.name || post.user?.email || 'Unknown User'}</p>
                                    <p>Created: {new Date(post.createdAt).toLocaleDateString()}</p>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => handlePostAction(post.id, 'approve')}
                                        disabled={actionLoading === post.id}
                                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                                            actionLoading === post.id 
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                : 'bg-green-600 hover:bg-green-700 text-white'
                                        }`}
                                    >
                                        {actionLoading === post.id ? 'Processing...' : 'Approve'}
                                    </button>
                                    <button 
                                        onClick={() => handlePostAction(post.id, 'reject')}
                                        disabled={actionLoading === post.id}
                                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                                            actionLoading === post.id 
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                : 'bg-red-600 hover:bg-red-700 text-white'
                                        }`}
                                    >
                                        {actionLoading === post.id ? 'Processing...' : 'Reject'}
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

export default PendingPosts;