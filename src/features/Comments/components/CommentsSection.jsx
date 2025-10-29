import React, { useState } from 'react';
import CommentsModal from './CommentsModal';

const CommentsSection = ({ post, postId, currentUser, token, onCommentCountChange, initialCommentCount }) => {
    const [showModal, setShowModal] = useState(false);
    const [commentCount, setCommentCount] = useState(
        initialCommentCount !== undefined 
            ? initialCommentCount 
            : (post ? (Array.isArray(post.comments) ? post.comments.length : (post.comments || 0)) : 0)
    );

    const handleCommentClick = () => {
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleCommentCountChange = (count) => {
        setCommentCount(count);
        onCommentCountChange && onCommentCountChange(count);
    };

    // Use postId if provided, otherwise use post.id
    const actualPostId = postId || post?.id;

    return (
        <>
            <div className="flex items-center py-2">
                <button
                    onClick={handleCommentClick}
                    className="flex items-center gap-1 text-gray-600 hover:text-blue-600 text-sm font-semibold"
                >
                    💬 Comment ({commentCount})
                </button>
            </div>

            <CommentsModal
                postId={actualPostId}
                currentUser={currentUser}
                token={token}
                isOpen={showModal}
                onClose={handleCloseModal}
                onCommentCountChange={handleCommentCountChange}
            />
        </>
    );
};

export default CommentsSection;
