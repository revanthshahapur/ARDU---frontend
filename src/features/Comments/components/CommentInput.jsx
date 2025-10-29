import React, { useState } from 'react';
import { addComment } from '../../../services/postService';

const CommentInput = ({ postId, currentUser, onCommentAdded, token }) => {
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleComment = async () => {
        if (!newComment.trim() || isSubmitting) return;
        
        setIsSubmitting(true);
        try {
            await addComment(
                postId, 
                currentUser?.username || currentUser?.name, 
                newComment, 
                token
            );
            
            setNewComment('');
            onCommentAdded && onCommentAdded();
        } catch (error) {
            console.error('Error adding comment:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleComment();
        }
    };

    return (
        <div className="flex gap-3 py-3 border-t border-gray-200">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                {(currentUser?.name || currentUser?.username || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 flex gap-2">
                <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Write a comment..."
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isSubmitting}
                />
                <button 
                    onClick={handleComment} 
                    disabled={!newComment.trim() || isSubmitting} 
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-full disabled:opacity-50 hover:bg-blue-700 transition-colors font-semibold"
                >
                    {isSubmitting ? '...' : 'Post'}
                </button>
            </div>
        </div>
    );
};

export default CommentInput;
