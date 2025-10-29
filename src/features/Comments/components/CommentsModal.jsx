import React, { useState, useEffect, useRef } from 'react';
import CommentsList from './CommentsList';
import CommentInput from './CommentInput';

const CommentsModal = ({ post, postId, currentUser, token, isOpen, onClose, onCommentCountChange }) => {
    const [commentCount, setCommentCount] = useState(0);
    const commentsListRef = useRef(null);
    
    // Use postId if provided, otherwise use post.id
    const actualPostId = postId || post?.id;

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleCommentAdded = () => {
        // Refresh the comments list
        if (commentsListRef.current && commentsListRef.current.refreshComments) {
            commentsListRef.current.refreshComments();
        }
        setCommentCount(prev => prev + 1);
        onCommentCountChange && onCommentCountChange(commentCount + 1);
    };

    const handleCommentCountChange = (count) => {
        setCommentCount(count);
        onCommentCountChange && onCommentCountChange(count);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Comments ({commentCount})
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Comments List */}
                <div className="flex-1 overflow-hidden">
                    <CommentsList
                        ref={commentsListRef}
                        postId={actualPostId}
                        currentUser={currentUser}
                        token={token}
                        onCommentCountChange={handleCommentCountChange}
                    />
                </div>

                {/* Comment Input */}
                <CommentInput
                    postId={actualPostId}
                    currentUser={currentUser}
                    token={token}
                    onCommentAdded={handleCommentAdded}
                />
            </div>
        </div>
    );
};

export default CommentsModal;
