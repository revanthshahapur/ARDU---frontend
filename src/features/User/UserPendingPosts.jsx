import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../features/Auth/AuthContext';

const UserPendingPosts = () => {
    const { user, token } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeMenu, setActiveMenu] = useState(null);
    const [editingPost, setEditingPost] = useState(null);
    const [editCaption, setEditCaption] = useState('');

    const fetchUserPosts = useCallback(async () => {
        try {
            const response = await fetch(`http://https://ardu-backend.onrender.com/api/posts/user/${user.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            setPosts(data);
        } catch (err) {
            setError('Failed to load your posts');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    }, [token, user?.id]);

    const handleEdit = (post) => {
        setEditingPost(post.id);
        setEditCaption(post.caption || '');
        setActiveMenu(null);
    };

    const handleSaveEdit = async (postId) => {
        try {
            console.log('Saving post:', postId, 'with caption:', editCaption);
            const response = await fetch(`http://https://ardu-backend.onrender.com/api/posts/${postId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ caption: editCaption })
            });

            console.log('Response status:', response.status);
            
            if (response.ok) {
                const updatedPost = await response.json();
                console.log('Updated post:', updatedPost);
                setPosts(posts.map(post => 
                    post.id === postId ? { ...post, caption: editCaption } : post
                ));
                setEditingPost(null);
                setEditCaption('');
                setError(null);
            } else {
                const errorData = await response.text();
                console.error('Update failed:', errorData);
                setError(`Failed to update post: ${response.status}`);
            }
        } catch (err) {
            console.error('Error updating post:', err);
            setError('Failed to update post: Network error');
        }
    };

    const handleDelete = async (postId) => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            try {
                console.log('Deleting post:', postId);
                const response = await fetch(`http://https://ardu-backend.onrender.com/api/posts/${postId}/user`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    setPosts(posts.filter(post => post.id !== postId));
                    setError(null);
                } else {
                    const errorData = await response.text();
                    console.error('Delete failed:', errorData);
                    setError(`Failed to delete post: ${response.status}`);
                }
            } catch (err) {
                console.error('Delete error:', err);
                setError(`Failed to delete post: ${err.message}`);
            }
        }
        setActiveMenu(null);
    };

    const toggleMenu = (postId) => {
        setActiveMenu(activeMenu === postId ? null : postId);
    };

    useEffect(() => {
        if (token && user?.id) {
            fetchUserPosts();
        }
    }, [token, user?.id, fetchUserPosts]);

    if (loading) return <div className="p-4">Loading your posts...</div>;

    return (
        <div className="container mx-auto p-4 max-w-[470px]">
            <h1 className="text-2xl font-bold mb-4">My Posts</h1>
            
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {posts.length === 0 ? (
                <div className="text-gray-500 text-center py-8">
                    You don't have any posts yet
                </div>
            ) : (
                <div className="space-y-6">
                    {posts.map(post => (
                        <div key={post.id} className="border rounded-lg bg-white shadow">
                            {post.contentUrl && (
                                <div className="relative w-full">
                                    {post.contentUrl.includes('video') ? (
                                        <div className="w-full" style={{ maxHeight: '587px' }}>
                                            <video 
                                                src={post.contentUrl} 
                                                controls 
                                                className="w-full h-full object-contain"
                                                style={{ maxHeight: '587px' }}
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-full" style={{ maxHeight: '587px' }}>
                                            <img 
                                                src={post.contentUrl} 
                                                alt="Post content" 
                                                className="w-full h-auto object-contain"
                                                style={{ maxHeight: '587px' }}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="p-3 border-t">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        {editingPost === post.id ? (
                                            <div className="mb-3">
                                                <textarea
                                                    value={editCaption}
                                                    onChange={(e) => setEditCaption(e.target.value)}
                                                    className="w-full p-2 border rounded resize-none"
                                                    rows="3"
                                                    placeholder="Write a caption..."
                                                />
                                                <div className="flex gap-2 mt-2">
                                                    <button
                                                        onClick={() => handleSaveEdit(post.id)}
                                                        className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                                                    >
                                                        Save
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setEditingPost(null);
                                                            setEditCaption('');
                                                        }}
                                                        className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            post.caption && (
                                                <div className="mb-3">
                                                    <p className="text-gray-800">{post.caption}</p>
                                                </div>
                                            )
                                        )}
                                        
                                        <div className="text-xs text-gray-500">
                                            Posted: {new Date(post.createdAt).toLocaleString()}
                                        </div>
                                    </div>
                                    
                                    {(post.approved === true || post.approved === null) && (
                                        <div className="relative ml-2">
                                            <button
                                                onClick={() => toggleMenu(post.id)}
                                                className="p-1 hover:bg-gray-100 rounded-full"
                                            >
                                                <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                                </svg>
                                            </button>
                                            
                                            {activeMenu === post.id && (
                                                <div className="absolute right-0 mt-1 w-32 bg-white border rounded-lg shadow-lg z-10">
                                                    <button
                                                        onClick={() => handleEdit(post)}
                                                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(post.id)}
                                                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 text-red-600 flex items-center gap-2"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                
                                <div className={`mt-2 rounded p-2 ${
                                    post.approved === true 
                                        ? 'bg-green-50 border border-green-200' 
                                        : post.approved === false 
                                        ? 'bg-red-50 border border-red-200'
                                        : 'bg-yellow-50 border border-yellow-200'
                                }`}>
                                    <p className={`text-sm ${
                                        post.approved === true 
                                            ? 'text-green-700' 
                                            : post.approved === false 
                                            ? 'text-red-700'
                                            : 'text-yellow-700'
                                    }`}>
                                        Status: {post.approved === true ? 'Approved' : post.approved === false ? 'Rejected' : 'Pending Approval'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default UserPendingPosts;