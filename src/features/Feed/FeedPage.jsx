import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../Auth/useAuth';
import { Link, useLocation } from 'react-router-dom';
import PostCard from './PostCard';
import { getAuthHeaders } from '../Auth/services/authHeaderService';

const FeedPage = () => {
    const { user, isAuthenticated, token } = useAuth();
    const location = useLocation();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    const navigationTabs = [
        { path: '/', label: 'Feed', icon: '📱' },
        ...(user?.role === 'MAIN_ADMIN' ? [
            { path: '/admin/pending', label: 'Review Posts', icon: '⚡' }
        ] : [
            { path: '/my-pending-posts', label: 'My Posts', icon: '📤' }
        ])
    ];

    // Fetch posts from the API - wrapped in useCallback for stability
    const fetchPosts = useCallback(async () => {
        try {
            setError(null);
            const authHeaders = getAuthHeaders();
            
            const response = await fetch('http://https://ardu-backend.onrender.com/api/posts', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    ...authHeaders
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Authentication required. Please log in again.');
                } else if (response.status === 403) {
                    throw new Error('Access denied. You don\'t have permission to view posts.');
                } else {
                    const errorText = await response.text().catch(() => '');
                    throw new Error(`Failed to fetch posts: ${response.status}${errorText ? ` - ${errorText.substring(0, 180)}...` : ''}`);
                }
            }

            let rawBody;
            try {
                rawBody = await response.text();
                
                let postsData;
                try {
                    postsData = JSON.parse(rawBody);
                } catch {
                    const decodedBody = rawBody.replace(/&quot;/g, '"');
                    postsData = JSON.parse(decodedBody);
                }

                const formattedPosts = await Promise.all(postsData.map(async (post) => {
                    const postUser = post.user || {};

                    // Fetch reaction summary for each post
                    let reactionData = {
                        likes: 0,
                        userReaction: null,
                        recentReactors: []
                    };

                    try {
                        const reactionResponse = await fetch(`http://https://ardu-backend.onrender.com/api/posts/${post.id}/reactions/summary`, {
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json',
                                ...authHeaders
                            }
                        });
                        
                        if (reactionResponse.ok) {
                            const reactionSummary = await reactionResponse.json();
                            reactionData = {
                                likes: reactionSummary.total || 0,
                                userReaction: reactionSummary.userReaction || null,
                                recentReactors: reactionSummary.recentReactors || []
                            };
                        }
                    } catch (error) {
                        console.error(`Error fetching reactions for post ${post.id}:`, error);
                    }

                    return {
                        id: post.id,
                        content: post.caption || post.content || post.description || '',
                        
                        // Preserve the entire user object (from the new DTO structure)
                        user: postUser,
                        
                        // Extract userName from the nested structure, falling back to old fields
                        userName: postUser.name || postUser.username || post.userName || post.author || 'Unknown User',
                        createdAt: new Date(post.createdAt || post.created_at || Date.now()),
                        
                        imageUrl: post.imageUrl || post.image_url || post.contentUrl || null,
                        
                        // NEW FIX: Map the profile photo URL from the nested user object
                        // It checks for profilePhotoUrl (ideal) and imageUrl (used in your backend upload)
                        userProfilePhotoUrl: postUser.profilePhotoUrl || postUser.imageUrl || null,
                        
                        // Default to empty array to prevent map() errors in PostCard
                        recentReactions: post.recentReactions || [],
                        recentComments: post.recentComments || [],
                        
                        // Use fetched reaction data
                        likes: reactionData.likes,
                        comments: post.comments || post.commentCount || 0,
                        shares: post.shares || post.shareCount || 0,
                        reactors: post.reactors || [],
                        userReaction: reactionData.userReaction,
                        recentReactors: reactionData.recentReactors,
                        
                        userLiked: reactionData.userReaction != null,
                        userCommented: post.userCommented || false,
                        userShared: post.userShared || false
                    };
                }));

                setPosts(formattedPosts);
            } catch (parseErr) {
                console.error('Raw response from /api/posts (first 500 chars):', (rawBody || '').substring(0, 500));
                throw new Error(`${parseErr?.message || 'Failed to parse response'} - Response is not valid JSON.`);
            }
        } catch (err) {
            console.error('Error fetching posts:', err);
            setError(err.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [isAuthenticated, token, user]); // Include user in dependency array for accurate context

    // Initial load
    useEffect(() => {
        if (isAuthenticated) {
            fetchPosts();
        } else {
            setLoading(false);
            setError('Please log in to view posts.');
        }
    }, [isAuthenticated, fetchPosts]);

    // Auto-refresh posts every 30 seconds
    useEffect(() => {
        if (!isAuthenticated) return;

        const interval = setInterval(() => {
            setRefreshing(true);
            fetchPosts();
        }, 30000); // 30 seconds

        return () => clearInterval(interval);
    }, [isAuthenticated, fetchPosts]);

    // Manual refresh function
    const handleRefresh = () => {
        setRefreshing(true);
        fetchPosts();
    };

    // Handle post updates (when user interacts with posts)
    const handlePostUpdate = (postId, updatedData) => {
        setPosts(prevPosts =>
            prevPosts.map(post =>
                post.id === postId
                    ? { ...post, ...updatedData }
                    : post
            )
        );
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading posts...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-6">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                        <div className="text-red-600 text-6xl mb-4">⚠️</div>
                        <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Posts</h2>
                        <p className="text-red-600 mb-4">{error}</p>
                        <button
                            onClick={handleRefresh}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Not authenticated state
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <div className="text-blue-600 text-6xl mb-4">🔒</div>
                        <h2 className="text-xl font-semibold text-blue-800 mb-2">Authentication Required</h2>
                        <p className="text-blue-600 mb-4">Please log in to view the feed.</p>
                        <a
                            href="/login"
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-block"
                        >
                            Go to Login
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    // Main feed content
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation Tabs */}
            <div className="bg-white shadow-sm border-b sticky top-0 z-50">
                <div className="max-w-2xl mx-auto">
                    <div className="flex">
                        {navigationTabs.map(tab => (
                            <Link
                                key={tab.path}
                                to={tab.path}
                                className={`
                                    flex items-center px-6 py-4 space-x-2
                                    ${location.pathname === tab.path
                                        ? 'border-b-2 border-blue-500 text-blue-600'
                                        : 'text-gray-500 hover:text-gray-700'}
                                    transition-colors duration-200
                                `}
                            >
                                <span className="text-lg">{tab.icon}</span>
                                <span>{tab.label}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="max-w-2xl mx-auto px-4 py-4">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Feed</h1>
                        <p className="text-gray-600">Welcome back, {user?.name || 'User'}!</p>
                    </div>
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        {refreshing ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        )}
                        <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
                    </button>
                </div>

                {/* Posts Container */}
                <div className="space-y-6">
                    {posts.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-gray-400 text-6xl mb-4">📝</div>
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Posts Yet</h3>
                            <p className="text-gray-500 mb-6">Be the first to share something with the community!</p>
                            <a
                                href="/upload"
                                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-block"
                            >
                                Create Your First Post
                            </a>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {posts.map((post) => (
                                <PostCard
                                    key={post.id}
                                    post={post}
                                    currentUser={user}
                                    onPostUpdate={handlePostUpdate}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Refresh indicator */}
            {refreshing && (
                <div className="fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Refreshing posts...</span>
                </div>
            )}
        </div>
    );
};

export default FeedPage;