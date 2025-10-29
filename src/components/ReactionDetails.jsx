import React, { useState, useEffect } from 'react';
import { useAuth } from '../features/Auth/useAuth';

const ReactionDetails = ({ postId, onClose }) => {
    const { token } = useAuth();
    const [reactions, setReactions] = useState([]);
    const [loading, setLoading] = useState(true);

    const reactionEmojis = {
        'like': '👍',
        'love': '❤️',
        'haha': '😂',
        'wow': '😮',
        'sad': '😢',
        'angry': '😡'
    };

    useEffect(() => {
        fetchReactionDetails();
    }, [postId]);

    const fetchReactionDetails = async () => {
        try {
            const response = await fetch(`https://ardu-backend.onrender.com/api/posts/${postId}/reactions/details`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setReactions(data);
            }
        } catch (error) {
            console.error('Error fetching reaction details:', error);
        } finally {
            setLoading(false);
        }
    };

    const groupedReactions = reactions.reduce((acc, reaction) => {
        const type = reaction.type.toLowerCase();
        if (!acc[type]) acc[type] = [];
        acc[type].push(reaction);
        return acc;
    }, {});

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full max-h-96 overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="text-lg font-semibold">Reactions</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                <div className="overflow-y-auto max-h-80">
                    {loading ? (
                        <div className="p-4 text-center text-gray-500">Loading...</div>
                    ) : reactions.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">No reactions yet</div>
                    ) : (
                        <div className="p-4 space-y-3">
                            {Object.entries(groupedReactions).map(([type, typeReactions]) => (
                                <div key={type}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-lg">{reactionEmojis[type]}</span>
                                        <span className="text-sm font-medium text-gray-600 capitalize">{type}</span>
                                        <span className="text-sm text-gray-400">({typeReactions.length})</span>
                                    </div>
                                    <div className="space-y-2 ml-6">
                                        {typeReactions.map((reaction) => (
                                            <div key={reaction.id} className="flex items-center gap-3">
                                                {reaction.user.imageUrl ? (
                                                    <img 
                                                        src={reaction.user.imageUrl}
                                                        alt={reaction.user.name}
                                                        className="w-8 h-8 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                                        {reaction.user.name?.charAt(0).toUpperCase() || 'U'}
                                                    </div>
                                                )}
                                                <div className="flex-1">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {reaction.user.name || 'Unknown User'}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {new Date(reaction.createdAt).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReactionDetails;