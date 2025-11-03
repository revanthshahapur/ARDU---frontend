import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../Auth/useAuth';
import PostCard from '../Feed/PostCard';

const SharePage = () => {
    const { shareId } = useParams();
    const { token } = useAuth();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPostByShareId();
    }, [shareId]);

    const fetchPostByShareId = async () => {
        try {
            // For now, use the existing posts endpoint and find by ID
            // In a real app, you'd store share ID -> post ID mapping in backend
            const response = await fetch('https://ardu-backend.onrender.com/api/posts', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const posts = await response.json();
                // For demo, just show the first post
                // In production, you'd map shareId to actual postId
                const foundPost = posts[0];
                if (foundPost) {
                    setPost(foundPost);
                } else {
                    setError('Post not found');
                }
            } else {
                setError('Post not found');
            }
        } catch (err) {
            setError('Failed to load post');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p>Loading post...</p>
                </div>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Post Not Found</h1>
                    <p className="text-gray-600">This post may have been removed or the link is invalid.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-2xl mx-auto px-4">
                <PostCard 
                    post={post} 
                    currentUser={null} 
                    onPostUpdate={() => {}} 
                />
            </div>
        </div>
    );
};

export default SharePage;