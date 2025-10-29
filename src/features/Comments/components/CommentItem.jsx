import React from 'react';

const CommentItem = ({ comment, currentUser }) => {
    const formatDate = (date) => {
        try {
            const now = new Date();
            const d = new Date(date);
            if (isNaN(d.getTime())) return 'Recently';
            const diff = Math.floor((now - d) / 1000);
            if (diff < 60) return 'Just now';
            if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
            if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
            return d.toLocaleDateString();
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'Recently';
        }
    };

    return (
        <div className="flex gap-3 py-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                {(comment.user?.name || comment.user?.username || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
                <div className="bg-gray-100 rounded-2xl px-3 py-2 inline-block max-w-full">
                    <div className="text-sm font-semibold text-gray-900 mb-1">
                        {comment.user?.name || comment.user?.username || 'Unknown User'}
                    </div>
                    <div className="text-sm text-gray-800 whitespace-pre-wrap break-words">
                        {comment.text}
                    </div>
                </div>
                <div className="flex items-center gap-4 mt-1 ml-2">
                    <button className="text-xs text-gray-500 hover:text-blue-600 font-semibold">
                        Like
                    </button>
                    <button className="text-xs text-gray-500 hover:text-blue-600 font-semibold">
                        Reply
                    </button>
                    <span className="text-xs text-gray-400">
                        {formatDate(comment.createdAt)}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default CommentItem;
