import React, { useState, useEffect } from 'react';
import ReactionDetails from './ReactionDetails';

const EmojiReactions = ({ postId, currentUser, token, onReaction }) => {
    const [showReactions, setShowReactions] = useState(false);
    const [userReaction, setUserReaction] = useState(null);
    const [reactionCounts, setReactionCounts] = useState({});
    const [totalReactions, setTotalReactions] = useState(0);
    const [showReactionDetails, setShowReactionDetails] = useState(false);

    const reactionTypes = [
        { type: 'LIKE', emoji: '👍', color: 'text-blue-500' },
        { type: 'LOVE', emoji: '❤️', color: 'text-red-500' },
        { type: 'HAHA', emoji: '😂', color: 'text-yellow-500' },
        { type: 'WOW', emoji: '😮', color: 'text-orange-500' },
        { type: 'SAD', emoji: '😢', color: 'text-blue-400' },
        { type: 'ANGRY', emoji: '😡', color: 'text-red-600' }
    ];

    const fetchReactionSummary = async () => {
        if (!token) {
            console.error('No token available for reaction summary');
            return;
        }
        
        try {
            const response = await fetch(`https://ardu-backend.onrender.com/api/posts/${postId}/reactions/summary`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setReactionCounts(data.counts || {});
                setUserReaction(data.userReaction);
                setTotalReactions(data.total || 0);
            } else if (response.status === 403) {
                console.error('Access denied for reaction summary. Token may be invalid.');
            } else {
                console.error('Failed to fetch reaction summary:', response.status);
            }
        } catch (error) {
            console.error('Error fetching reactions:', error);
        }
    };

    useEffect(() => {
        if (postId && token) {
            fetchReactionSummary();
        }
    }, [postId, token]);

    const handleReaction = async (reactionType) => {
        try {
            const username = currentUser?.username || currentUser?.email || currentUser?.name;
            
            if (!username) {
                console.error('No username found for user:', currentUser);
                return;
            }

            // If clicking same reaction, remove it
            if (reactionType === userReaction) {
                reactionType = null;
            }

            const response = await fetch(`https://ardu-backend.onrender.com/api/posts/${postId}/reaction`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `username=${username}&reactionType=${reactionType || 'LIKE'}`
            });
            
            if (response.ok) {
                await fetchReactionSummary();
                onReaction && onReaction(postId, reactionType);
            } else {
                const errorText = await response.text();
                console.error('Reaction failed:', errorText);
            }
        } catch (error) {
            console.error('Error adding reaction:', error);
        }
        setShowReactions(false);
    };

    return (
        <div className="flex items-center gap-2">
            <div 
                className="relative inline-block"
                onMouseEnter={() => setShowReactions(true)}
                onMouseLeave={() => setShowReactions(false)}
            >
                <button
                    onClick={() => handleReaction(userReaction ? null : 'LIKE')}
                    className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                        userReaction 
                            ? `${reactionTypes.find(r => r.type === userReaction)?.color} bg-blue-50` 
                            : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                    {userReaction ? (
                        <>
                            <span className="text-base">{reactionTypes.find(r => r.type === userReaction)?.emoji}</span>
                            <span>{userReaction.charAt(0) + userReaction.slice(1).toLowerCase()}</span>
                        </>
                    ) : (
                        <>
                            <span className="text-base">👍</span>
                            <span>Like</span>
                        </>
                    )}
                </button>

                {showReactions && (
                    <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-full shadow-xl p-2 flex gap-1 z-50 animate-in slide-in-from-bottom-2 duration-200">
                        {reactionTypes.map(({ type, emoji, color }) => (
                            <button
                                key={type}
                                onClick={() => handleReaction(type)}
                                className="w-12 h-12 rounded-full hover:bg-gray-50 flex items-center justify-center text-2xl transition-all duration-150 hover:scale-125 hover:-translate-y-1"
                                title={type.charAt(0) + type.slice(1).toLowerCase()}
                            >
                                <span className="drop-shadow-sm">{emoji}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
            
            {totalReactions > 0 && (
                <div 
                    className="flex items-center gap-1 text-sm text-gray-600 cursor-pointer hover:underline"
                    onClick={() => setShowReactionDetails(true)}
                >
                    <div className="flex -space-x-1">
                        {Object.entries(reactionCounts)
                            .filter(([_, count]) => count > 0)
                            .sort(([,a], [,b]) => b - a)
                            .slice(0, 3)
                            .map(([type]) => reactionTypes.find(r => r.type === type))
                            .filter(Boolean)
                            .map(({ emoji }, index) => (
                                <span key={index} className="text-sm bg-white rounded-full border border-gray-200 w-5 h-5 flex items-center justify-center">{emoji}</span>
                            ))}
                    </div>
                    <span className="ml-1">{totalReactions}</span>
                </div>
            )}

            {/* Reaction Details Modal */}
            {showReactionDetails && (
                <ReactionDetails 
                    postId={postId} 
                    onClose={() => setShowReactionDetails(false)} 
                />
            )}
        </div>
    );
};

export default EmojiReactions;