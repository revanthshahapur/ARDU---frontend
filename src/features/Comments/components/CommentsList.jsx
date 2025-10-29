import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import CommentItem from './CommentItem';
import { getComments } from '../../../services/postService';

const CommentsList = forwardRef(({ postId, currentUser, token, onCommentCountChange }, ref) => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(0);
    const [error, setError] = useState(null);

    const loadComments = async (pageNum = 0, append = false) => {
        if (loading) return;
        
        setLoading(true);
        setError(null);
        
        try {
            const response = await getComments(postId, pageNum, 10, token);
            const newComments = response.content || response;
            
            if (append) {
                setComments(prev => {
                    const updated = [...prev, ...newComments];
                    // Update comment count in parent
                    if (onCommentCountChange) {
                        onCommentCountChange(updated.length);
                    }
                    return updated;
                });
            } else {
                setComments(newComments);
                // Update comment count in parent
                if (onCommentCountChange) {
                    onCommentCountChange(newComments.length);
                }
            }
            
            setHasMore(newComments.length === 10);
            setPage(pageNum);
        } catch (err) {
            console.error('Error loading comments:', err);
            setError('Failed to load comments');
        } finally {
            setLoading(false);
        }
    };

    const loadMoreComments = () => {
        if (!loading && hasMore) {
            loadComments(page + 1, true);
        }
    };

    const refreshComments = () => {
        loadComments(0, false);
    };

    // Expose refreshComments to parent via ref
    useImperativeHandle(ref, () => ({
        refreshComments
    }));

    useEffect(() => {
        loadComments();
    }, [postId]);

    if (error) {
        return (
            <div className="p-4 text-center">
                <div className="text-red-500 mb-2">{error}</div>
                <button 
                    onClick={refreshComments}
                    className="text-blue-600 hover:text-blue-800 text-sm font-semibold"
                >
                    Try again
                </button>
            </div>
        );
    }

    return (
        <div className="max-h-96 overflow-y-auto">
            {comments.length === 0 && !loading ? (
                <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">💬</div>
                    <p>No comments yet</p>
                    <p className="text-sm">Be the first to comment!</p>
                </div>
            ) : (
                <div className="space-y-1">
                    {comments.map((comment) => (
                        <CommentItem 
                            key={comment.id} 
                            comment={comment} 
                            currentUser={currentUser}
                        />
                    ))}
                    
                    {hasMore && (
                        <div className="text-center py-3">
                            <button
                                onClick={loadMoreComments}
                                disabled={loading}
                                className="text-blue-600 hover:text-blue-800 text-sm font-semibold disabled:opacity-50"
                            >
                                {loading ? 'Loading...' : 'View more comments'}
                            </button>
                        </div>
                    )}
                </div>
            )}
            
            {loading && comments.length === 0 && (
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-500 mt-2">Loading comments...</p>
                </div>
            )}
        </div>
    );
});

CommentsList.displayName = 'CommentsList';

export default CommentsList;
