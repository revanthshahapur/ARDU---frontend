import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../Auth/useAuth';
import { addComment } from '../../services/postService';
import { likePost, unlikePost } from '../Auth/services/reactionService';

// CORRECTED MERGE: Combine the imports
import { CommentsSection, CommentsModal } from '../Comments'; // From HEAD
import ReactionDetails from '../../components/ReactionDetails'; // From bc92a68...

const PostCard = ({ post, currentUser, onPostUpdate }) => {
    const { token } = useAuth();
    
    // 💡 FIX 1: Initial state derived directly from props
    const initialUserReaction = (post.reactors || []).find(
        r => r.username === (currentUser?.username || currentUser?.name)
    )?.reactionType || post.userReaction || null;

    const [userReaction, setUserReaction] = useState(initialUserReaction);
    const [likeCount, setLikeCount] = useState(post.likes || post.likeCount || 0);
    const [reactors, setReactors] = useState(post.reactors || []);
    
    // State to manage showing the comments section
    const [showComments, setShowComments] = useState(false); // Added for comment toggling
    const [showCommentsModal, setShowCommentsModal] = useState(false); // For modal view
    
    const [commentCount, setCommentCount] = useState(
        Array.isArray(post.comments) ? post.comments.length : (post.comments || 0)
    );
    const [shareCount, setShareCount] = useState(post.shares || 0);
    const [showReactions, setShowReactions] = useState(false);
    const [showShareOptions, setShowShareOptions] = useState(false);
    
    // CORRECTED MERGE: Combine all necessary state variables
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLiking, setIsLiking] = useState(false); // Used to block sync during optimistic update
    const [showReactionDetails, setShowReactionDetails] = useState(false);
    const [reactionDetails, setReactionDetails] = useState([]);
    const [recentReactors, setRecentReactors] = useState(post.recentReactors || []);

    const shareRef = useRef(null);
    
    // 💡 FIX 2: Synchronize state with incoming props on every prop change (e.g., fetchPosts completes)
    useEffect(() => {
        // Only update from props if we are not in the middle of an action
        // This ensures the local optimistic state isn't immediately overwritten by the server's data during a reaction flow.
        if (!isLiking) {
            const latestUserReaction = (post.reactors || []).find(r =>
                r.username === (currentUser?.username || currentUser?.name)
            )?.reactionType || post.userReaction || null;
            
            setUserReaction(latestUserReaction);
            setLikeCount(post.likes || post.likeCount || 0);
            setCommentCount(Array.isArray(post.comments) ? post.comments.length : (post.comments || 0));
            setReactors(post.reactors || []);
            setShareCount(post.shares || 0);
            setRecentReactors(post.recentReactors || []);
        }
    // Dependency array watches the post object for changes
    }, [post, currentUser, isLiking]);


    // 🛑 REMOVED: The old useEffect (lines 14-22) for initial reaction calculation is replaced by the above.
    
    const postUser = post.user || {};
    const postUserName = post.userName || postUser.name || 'Unknown User';
    const postUserImageUrl = post.userProfilePhotoUrl || postUser.imageUrl; // Use userProfilePhotoUrl from formatted prop

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (shareRef.current && !shareRef.current.contains(event.target)) {
                setShowShareOptions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const reactions = [
        { type: 'like', emoji: '👍', label: 'Like' },
        // ... (rest of reactions)
        { type: 'love', emoji: '❤️', label: 'Love' },
        { type: 'haha', emoji: '😂', label: 'Haha' },
        { type: 'wow', emoji: '😮', label: 'Wow' },
        { type: 'sad', emoji: '😢', label: 'Sad' },
        { type: 'angry', emoji: '😡', label: 'Angry' }
    ];

    const contentUrl = post.imageUrl || post.contentUrl || post.videoUrl;

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


    // CORRECTED MERGE: Keep the logic from both sides, rename old toggle to match new state
    const handleCommentCountChange = (newCount) => {
        setCommentCount(newCount);
        onPostUpdate && onPostUpdate(post.id, { comments: newCount });
    };

    const handleComment = async () => {
        if (!newComment.trim()) return;
        setIsSubmitting(true);
        try {
            await addComment(post.id, currentUser?.username || currentUser?.name, newComment, token);
            setNewComment(''); // Clear input on success
            setCommentCount((v) => v + 1);
            onPostUpdate(post.id, { userCommented: true, comments: commentCount + 1 });
        } catch (error) {
            console.error('Error adding comment:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleComments = () => {
        setShowComments(!showComments); // Use the new state variable
    };

    const handleCommentClick = () => {
        // Open the comments modal directly
        setShowCommentsModal(true);
    };


    const handleReaction = async (reactionType) => {
        if (isLiking || !currentUser?.name) return;
        
        const username = currentUser.username || currentUser.name;
        const wasReacted = userReaction !== null;
        const isRemoving = userReaction === reactionType;
        
        // Optimistic UI update (based on current state)
        setIsLiking(true);
        setShowReactions(false);
        
        const optimisticNewReaction = isRemoving ? null : reactionType;
        const optimisticNewLikeCount = isRemoving ? Math.max(0, likeCount - 1) : (wasReacted ? likeCount : likeCount + 1);

        setUserReaction(optimisticNewReaction);
        setLikeCount(optimisticNewLikeCount);
        
        try {
            if (isRemoving) {
                await unlikePost(post.id, username, reactionType);
            } else {
                await likePost(post.id, username, reactionType);
            }
            
            // Update parent component with optimistic state
            onPostUpdate(post.id, {
                userReaction: optimisticNewReaction,
                likes: optimisticNewLikeCount
            });
            
            // Fetch updated reaction summary to get recent reactors
            fetchReactionSummary();
        } catch (error) {
            console.error('Reaction failed:', error);
            // Revert optimistic update on error (re-read from prop or last known good state)
            setUserReaction(initialUserReaction);
            setLikeCount(post.likes || post.likeCount || 0);
        } finally {
            setIsLiking(false);
            // The useEffect will now re-run and sync to server data if refresh interval fires soon
        }
    };

    const fetchReactionSummary = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/posts/${post.id}/reactions/summary`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setRecentReactors(data.recentReactors || []);
                
                // Update reaction data from server if not in the middle of an action
                if (!isLiking) {
                    setLikeCount(data.total || 0);
                    setUserReaction(data.userReaction || null);
                }
            }
        } catch (error) {
            console.error('Error fetching reaction summary:', error);
        }
    };

    // Fetch reaction data on mount and when post changes
    useEffect(() => {
        if (post.id && token) {
            fetchReactionSummary(); 
        }
    }, [post.id, token]);

    // Also fetch when component first mounts to ensure we have latest data
    useEffect(() => {
        if (post.id && token && !isLiking) {
            const timer = setTimeout(() => {
                fetchReactionSummary();
            }, 100); // Small delay to ensure component is fully mounted
            return () => clearTimeout(timer);
        }
    }, []);

    const shareOptions = [
        // ... (shareOptions array is unchanged)
        {
            name: 'WhatsApp',
            icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/></svg>,
            color: 'text-green-500',
            action: (url) => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(url)}`)
        },
        // ... (remaining share options)
        {
            name: 'Instagram',
            icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM12 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>,
            color: 'text-pink-500',
            action: (url) => { navigator.clipboard.writeText(url); alert('Link copied for Instagram!'); }
        },
        {
            name: 'LinkedIn',
            icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>,
            color: 'text-blue-600',
            action: (url) => window.open(`https://linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`)
        },
        {
            name: 'Twitter',
            icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>,
            color: 'text-blue-400',
            action: (url) => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`)
        },
        {
            name: 'Facebook',
            icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
            color: 'text-blue-600',
            action: (url) => window.open(`https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`)
        },
        {
            name: 'Copy Link',
            icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>,
            color: 'text-gray-600',
            action: (url) => { navigator.clipboard.writeText(url); alert('Link copied!'); }
        }
    ];

    const handleShare = (platform = null) => {
        if (platform) {
            const shareUrl = contentUrl || `${window.location.origin}/post/${post.id}`;
            platform.action(shareUrl);
            setShareCount((v) => v + 1);
            onPostUpdate(post.id, { userShared: true, shares: shareCount + 1 });
        } else {
            setShowShareOptions(!showShareOptions);
        }
    };

    const renderMedia = () => {
        if (!contentUrl) return null;

        // simple video detection by extension or contentUrl include
        const isVideo = /\.(mp4|webm|ogg)(\?.*)?$/.test(contentUrl) || contentUrl.includes('video') || contentUrl.includes('mp4');

        if (isVideo) {
            return (
                <div className="relative w-full" style={{ maxHeight: '600px' }}>
                    <video
                        src={contentUrl}
                        controls
                        muted
                        playsInline
                        preload="metadata"
                        className="w-full h-auto max-h-[600px] object-cover"
                    />
                </div>
            );
        }

        return (
            <div className="relative w-full">
                <img
                    src={contentUrl}
                    alt={post.content || 'post media'}
                    className="w-full h-auto max-h-[600px] object-cover"
                />
            </div>
        );
    };



    return (
        <div className="bg-white rounded-none md:rounded-lg shadow-none md:shadow-sm border-0 md:border border-gray-200 overflow-hidden w-full max-w-none md:max-w-lg mx-auto mb-2 md:mb-4">
            <div className="p-3 md:p-4 pb-3 flex items-center gap-3">
                
                {/* 🛑 CORE FIX BLOCK */}
                {postUserImageUrl ? (
                    <img
                        src={postUserImageUrl}
                        alt={`${postUserName}'s profile`}
                        className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover border border-gray-200"
                    />
                ) : (
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xs md:text-sm">
                        {(postUserName || 'U').charAt(0).toUpperCase()}
                    </div>
                )}
                {/* 🛑 END CORE FIX BLOCK */}

                <div className="flex-1 min-w-0">
                    <div className="text-sm md:text-base font-semibold text-gray-900 truncate">{postUserName}</div>
                    <div className="text-xs md:text-sm text-gray-500">{formatDate(post.createdAt)}</div>
                </div>
            </div>

            <div className="px-3 md:px-4 pb-3 text-sm md:text-base text-gray-900 whitespace-pre-wrap">{String(post.content || post.caption || '')}</div>

            <div className="px-0 md:px-4 pb-3">
                {renderMedia()}
            </div>

            {/* Reaction Display */}
            {likeCount > 0 && (
                <div className="px-3 md:px-4 py-2 border-b border-gray-100">
                    <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
                        <div className="flex -space-x-1">
                            <div className="w-4 h-4 md:w-5 md:h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">👍</div>
                            {userReaction && userReaction !== 'like' && (
                                <div className="w-4 h-4 md:w-5 md:h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">
                                    {userReaction === 'love' ? '❤️' : userReaction === 'haha' ? '😂' : userReaction === 'wow' ? '😮' : userReaction === 'sad' ? '😢' : '😡'}
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {recentReactors.length > 0 && (
                                <div className="flex -space-x-2">
                                    {recentReactors.slice(0, 3).map((reactor, index) => (
                                        reactor.imageUrl ? (
                                            <img
                                                key={index}
                                                src={reactor.imageUrl}
                                                alt={reactor.name}
                                                className="w-5 h-5 rounded-full border border-white object-cover"
                                                title={`${reactor.name} reacted with ${reactor.type}`}
                                            />
                                        ) : (
                                            <div
                                                key={index}
                                                className="w-5 h-5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full border border-white flex items-center justify-center text-white text-xs font-semibold"
                                                title={`${reactor.name} reacted with ${reactor.type}`}
                                            >
                                                {reactor.name?.charAt(0).toUpperCase() || 'U'}
                                            </div>
                                        )
                                    ))}
                                </div>
                            )}
                            <span
                                className="hover:underline cursor-pointer"
                                onClick={() => setShowReactionDetails(true)}
                            >
                                {recentReactors.length > 0 ? (
                                    recentReactors.length === 1 ?
                                        recentReactors[0].name :
                                        recentReactors.length === 2 ?
                                            `${recentReactors[0].name} and ${recentReactors[1].name}` :
                                            `${recentReactors[0].name}, ${recentReactors[1].name} and ${likeCount - 2} others`
                                ) : (
                                    userReaction ? (
                                        likeCount === 1 ? 'You' : `You and ${likeCount - 1} other${likeCount > 2 ? 's' : ''}`
                                    ) : (
                                        `${likeCount} ${likeCount === 1 ? 'person' : 'people'}`
                                    )
                                )}
                            </span>
                        </div>
                        {commentCount > 0 && (
                            <>
                                <span className="text-gray-400">•</span>
                                <span className="hover:underline cursor-pointer" onClick={toggleComments}>
                                    {commentCount} comment{commentCount !== 1 ? 's' : ''}
                                </span>
                            </>
                        )}
                    </div>
                </div>
            )}
            
            {/* Reaction Details Modal (Component from collaborator's changes) */}
            {showReactionDetails && (
                <ReactionDetails
                    postId={post.id}
                    token={token}
                    onClose={() => setShowReactionDetails(false)}
                />
            )}

            {/* Action buttons */}
            <div className="px-2 md:px-4 py-2">
                <div className="flex items-center justify-around">
                    <div className="relative flex-1">
                        <button
                            onClick={() => {
                                console.log('MAIN BUTTON CLICKED!');
                                handleReaction('like');
                            }}
                            onMouseEnter={() => {
                                console.log('HOVER STARTED!');
                                setShowReactions(true);
                            }}
                            onMouseLeave={() => {
                                console.log('HOVER ENDED!');
                                setTimeout(() => setShowReactions(false), 300);
                            }}
                            disabled={isLiking}
                            className={`w-full flex items-center justify-center gap-1 md:gap-2 py-2 px-1 md:px-3 rounded-lg text-xs md:text-sm font-medium transition-colors ${
                                userReaction ? 'text-blue-600 hover:bg-blue-50' : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            <svg className="w-4 h-4 md:w-5 md:h-5" fill={userReaction ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                            </svg>
                            <span className="hidden sm:inline">
                                {userReaction === 'like' ? 'Like' :
                                   userReaction === 'love' ? 'Love' :
                                   userReaction === 'haha' ? 'Haha' :
                                   userReaction === 'wow' ? 'Wow' :
                                   userReaction === 'sad' ? 'Sad' :
                                   userReaction === 'angry' ? 'Angry' : 'Like'}
                            </span>
                        </button>

                        {showReactions && (
                            <div
                                className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-white rounded-full shadow-lg border p-1 md:p-2 flex gap-1 z-10"
                                onMouseEnter={() => setShowReactions(true)}
                                onMouseLeave={() => setShowReactions(false)}
                            >
                                {reactions.map((reaction) => (
                                    <button
                                        key={reaction.type}
                                        onClick={() => {
                                            console.log('EMOJI CLICKED:', reaction.type, reaction.emoji);
                                            handleReaction(reaction.type);
                                        }}
                                        className="w-8 h-8 md:w-10 md:h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-base md:text-lg transition-transform hover:scale-125"
                                        title={reaction.label}
                                    >
                                        {reaction.emoji}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    {/* Comment button - opens modal */}
                    <button
                        onClick={handleCommentClick}
                        className="flex-1 flex items-center justify-center gap-1 md:gap-2 py-2 px-1 md:px-3 rounded-lg text-xs md:text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                        <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span className="hidden sm:inline">Comment</span>
                    </button>
                    
                    <div className="relative flex-1" ref={shareRef}>
                        <button
                            onClick={() => handleShare()}
                            className="w-full flex items-center justify-center gap-1 md:gap-2 py-2 px-1 md:px-3 rounded-lg text-xs md:text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                            </svg>
                            <span className="hidden sm:inline">Share</span>
                        </button>
                    

                        {showShareOptions && (
                            <>
                                {/* Mobile Bottom Sheet */}
                                <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setShowShareOptions(false)}>
                                    <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-4 transform transition-transform duration-300 ease-out">
                                        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Share</h3>
                                        
                                        <div className="grid grid-cols-3 gap-4 mb-6">
                                            {shareOptions.map((option) => (
                                                <button
                                                    key={option.name}
                                                    onClick={() => {
                                                        handleShare(option);
                                                        setShowShareOptions(false);
                                                    }}
                                                    className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                                                >
                                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${option.color} bg-gray-100`}>
                                                        {option.icon}
                                                    </div>
                                                    <span className="text-xs text-gray-700 text-center">{option.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                        
                                        <button
                                            onClick={() => setShowShareOptions(false)}
                                            className="w-full py-3 text-center text-gray-600 border-t border-gray-200"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Desktop Dropdown */}
                                <div className="hidden md:block absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-lg border p-3 min-w-48 z-20">
                                    <div className="text-xs font-semibold text-gray-500 mb-3 px-1">Share to:</div>
                                    
                                    {shareOptions.map((option) => (
                                        <button
                                            key={option.name}
                                            onClick={() => {
                                                handleShare(option);
                                                setShowShareOptions(false);
                                            }}
                                            className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-100 rounded-lg transition-colors"
                                        >
                                            <span className={option.color}>{option.icon}</span>
                                            <span className="flex-1 text-left">{option.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Comments Section (Controlled by the showComments state) */}
            {showComments && (
                <div className="px-3 md:px-4 pt-2 pb-4 border-t border-gray-100">
                    <CommentsSection
                        postId={post.id}
                        currentUser={currentUser}
                        token={token}
                        initialCommentCount={commentCount}
                        onCommentCountChange={handleCommentCountChange}
                    />
                </div>
            )}

            {/* Comments Modal */}
            <CommentsModal
                postId={post.id}
                currentUser={currentUser}
                token={token}
                isOpen={showCommentsModal}
                onClose={() => setShowCommentsModal(false)}
                onCommentCountChange={handleCommentCountChange}
            />
        </div>
    );
};

export default PostCard;