// --- Post Service API ---
// This file centralizes all logic for communicating with the Spring Boot backend
// specifically for Post-related operations.

// The base URL for your Spring Boot application
const API_BASE_URL = 'https://ardu-backend.onrender.com/api';
const POSTS_URL = `${API_BASE_URL}/posts`;

// Helper function to handle fetching with error logging
async function fetchApi(url, options = {}) {
    try {
        const response = await fetch(url, options);

        if (!response.ok) {
            // Attempt to get error details from the backend response
            const errorBody = await response.text().then(text => {
                try { return JSON.parse(text); } catch { return { message: text || 'Unknown error' }; }
            }).catch(() => ({ message: 'No response body or non-JSON error' }));
            
            console.error(`API Error: ${response.status} on ${url}`, errorBody);
            throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorBody.message || 'Unknown error'}`);
        }
        
        // Handle 204 No Content for POST/DELETE operations
        if (response.status === 204 || response.headers.get('content-length') === '0') {
            return null; 
        }

        return response.json();
    } catch (error) {
        console.error('Fetch operation failed:', error);
        throw error;
    }
}

// ----------------------------------------------------
// CORE POST OPERATIONS (3, 1, 4)
// ----------------------------------------------------

/**
 * [Endpoint 3] Fetches all visible (approved) posts from the backend.
 * @returns {Promise<Array<object>>} A promise that resolves to an array of post objects.
 */
export async function getVisiblePosts() {
    console.log('Fetching all visible posts...');
    return fetchApi(POSTS_URL, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
}

/**
 * [Endpoint 1] Creates a new post on the backend.
 * @param {object} postData - The data for the new post (userId, userName, content, etc.).
 * @returns {Promise<object>} The newly created post object from the backend.
 */
export async function createPost(postData) {
    console.log('Posting new content to backend:', postData);
    return fetchApi(`${POSTS_URL}/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // Add Authorization header here if required for authenticated users
        },
        body: JSON.stringify(postData),
    });
}

/**
 * [Endpoint 4] Deletes a specific post.
 * @param {number} postId - The ID of the post to delete.
 * @returns {Promise<null>} Resolves upon successful deletion.
 */
export async function deletePost(postId) {
    console.log(`Deleting post ID: ${postId}`);
    return fetchApi(`${POSTS_URL}/${postId}`, {
        method: 'DELETE',
        // Add Authorization header for owner/admin check
    });
}

// ----------------------------------------------------
// ADMIN OPERATIONS (2)
// ----------------------------------------------------

/**
 * [Endpoint 2] Approves a specific post (Admin function).
 * @param {number} postId - The ID of the post to approve.
 * @returns {Promise<object>} The updated post object.
 */
export async function approvePost(postId) {
    console.log(`Approving post ID: ${postId}`);
    return fetchApi(`${POSTS_URL}/${postId}/approve`, {
        method: 'PUT', // Assuming PUT for updating status
        // MUST include Admin Authorization header
    });
}

// ----------------------------------------------------
// REACTION & COMMENT OPERATIONS (5, 6, 7, 8)
// ----------------------------------------------------

/**
 * [Endpoint 5] Adds a reaction to a post.
 * @param {number} postId - The ID of the post.
 * @param {string} username - The username performing the reaction.
 * @param {string} reactionType - The type of reaction ('like', 'heart', etc.).
 * @returns {Promise<object>} The updated reactions list or success message.
 */
export async function addReaction(postId, username, reactionType) {
    const url = `${POSTS_URL}/${postId}/reaction?username=${encodeURIComponent(username)}&reactionType=${encodeURIComponent(reactionType)}`;
    console.log(`Adding reaction to post ${postId}: ${reactionType} by ${username}`);
    return fetchApi(url, {
        method: 'POST', // Assuming POST/PUT is used for adding reaction
    });
}

/**
 * [Endpoint 6] Adds a comment to a post.
 * @param {number} postId - The ID of the post.
 * @param {string} username - The username posting the comment.
 * @param {string} text - The comment text.
 * @returns {Promise<object>} The new comment object or success message.
 */
export async function addComment(postId, username, text) {
    const url = `${POSTS_URL}/${postId}/comment?username=${encodeURIComponent(username)}&text=${encodeURIComponent(text)}`;
    console.log(`Adding comment to post ${postId}: ${text}`);
    return fetchApi(url, {
        method: 'POST',
    });
}

/**
 * [Endpoint 7] Gets all comments for a post.
 * @param {number} postId - The ID of the post.
 * @returns {Promise<Array<object>>} An array of comment objects.
 */
export async function getComments(postId) {
    console.log(`Fetching comments for post ${postId}`);
    return fetchApi(`${POSTS_URL}/${postId}/comments`, {
        method: 'GET',
    });
}

/**
 * [Endpoint 8] Gets all reactions for a post.
 * @param {number} postId - The ID of the post.
 * @returns {Promise<Array<object>>} An array of reaction objects.
 */
export async function getReactions(postId) {
    console.log(`Fetching reactions for post ${postId}`);
    return fetchApi(`${POSTS_URL}/${postId}/reactions`, {
        method: 'GET',
    });
}

// ----------------------------------------------------
// POLLING (For Real-Time Feed Simulation)
// ----------------------------------------------------

/**
 * Simulates subscribing to posts using long polling (repeated GET requests).
 * NOTE: This relies on the getVisiblePosts function.
 * @param {function} callback - Function to call with the new posts when they are fetched.
 * @param {number} interval - Polling interval in milliseconds.
 * @returns {object} An object with a cleanup function to stop polling.
 */
export function subscribeToPosts(callback, interval = 5000) {
    let timeoutId;
    let lastFetchedPostsLength = 0; // Use length to track basic change detection

    const poll = async () => {
        try {
            const newPosts = await getVisiblePosts();
            
            if (newPosts && newPosts.length !== lastFetchedPostsLength) {
                 console.log(`New posts detected. Updating feed from ${lastFetchedPostsLength} to ${newPosts.length}.`);
                 callback(newPosts);
                 lastFetchedPostsLength = newPosts.length;
            } else if (newPosts && newPosts.length > 0) {
                // Also call the callback even if length hasn't changed to catch updates like reactions/comments
                callback(newPosts);
            }
        } catch (error) {
            // Error is already logged in fetchApi, just retry
        } finally {
            // Set the timeout for the next poll
            timeoutId = setTimeout(poll, interval);
        }
    };

    // Start the initial poll immediately
    poll();

    // Cleanup function to stop polling when the component unmounts
    return {
        unsubscribe: () => {
            clearTimeout(timeoutId);
            console.log('Stopped post polling.');
        }
    };
}
