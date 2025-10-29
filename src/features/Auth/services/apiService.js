import { getAuth } from 'firebase/auth'; // Still need getAuth for the current user's UID until proper backend auth is implemented

// We need a unique ID for the user. We will use the Firebase Auth UID if available, 
// or a temporary UUID if Firebase Auth hasn't fully resolved or is not being used.
let currentUserId = null;

// Mock API Base URL (You would replace this with your actual backend URL)
const API_BASE_URL = 'https://ardu-backend.onrender.com/api'; 

// --- Authentication & User ID Setup (Temporary) ---
// Since we are decoupling from Firebase, we simulate user ID fetching.
export const getUserId = () => {
    // If Firebase Auth is still available, use its UID for consistency for now
    // In a pure MySQL setup, this would come from your login response/session
    const auth = getAuth();
    return currentUserId || auth.currentUser?.uid || crypto.randomUUID();
};

/**
 * Updates the local user ID state. 
 * In a real app, this would be called after a successful login to your MySQL backend.
 */
export const setUserId = (userId) => {
    currentUserId = userId;
};


// --- Post API Operations (Simulated REST API Endpoints) ---

/**
 * Creates a new post by calling a POST endpoint on your MySQL backend.
 * @param {string} content - The content of the post.
 * @param {string} userName - The name of the user posting.
 */
export const createPost = async (content, userName) => {
    const userId = getUserId();
    const endpoint = `${API_BASE_URL}/posts`;
    
    // Simulate API call to your backend
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Your backend would check an Auth Token here
                'Authorization': `Bearer ${userId}` 
            },
            body: JSON.stringify({
                userId: userId,
                userName: userName,
                content: content,
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to create post on MySQL backend.");
        }
        
        console.log("Post successfully sent to MySQL API.");
        // Returns the created post data from the API response
        return await response.json(); 

    } catch (e) {
        console.error("Error creating post via API: ", e);
        throw new Error("Failed to create post. Check your MySQL backend server.");
    }
};

/**
 * Subscribes to posts using a simple Polling approach to simulate real-time.
 * NOTE: This is an inefficient workaround for true real-time. 
 * For production, use WebSockets (Socket.IO) with your MySQL backend.
 * * @param {Function} callback - Function to handle the updated posts list.
 * @returns {Function} Unsubscribe/cleanup function.
 */
export const subscribeToPosts = (callback) => {
    const POLL_INTERVAL = 5000; // Poll every 5 seconds (5000ms)
    let isMounted = true;

    const fetchPosts = async () => {
        const endpoint = `${API_BASE_URL}/posts`;
        try {
            const response = await fetch(endpoint, {
                method: 'GET',
                // Your backend would handle authentication and return sorted posts (newest first)
            });

            if (!response.ok) {
                throw new Error("Failed to fetch posts from MySQL backend.");
            }
            
            // Assume the API returns an array of post objects with 'id', 'content', 'userName', 'createdAt' (as a string)
            const posts = await response.json();
            
            // Map/convert the API response data structure if necessary
            const formattedPosts = posts.map(post => ({
                ...post,
                // Ensure createdAt is a Date object for the component
                createdAt: new Date(post.createdAt), 
            }));
            
            if (isMounted) {
                callback(formattedPosts);
            }
        } catch (e) {
            console.error("Error polling posts via API:", e);
        }
    };

    // Initial fetch
    fetchPosts();

    // Set up polling interval
    const intervalId = setInterval(fetchPosts, POLL_INTERVAL);

    // Cleanup function: clear the interval and stop fetching
    return () => {
        isMounted = false;
        clearInterval(intervalId);
        console.log("Stopped post polling.");
    };
};

// Start a minimal auth process to get a temp user ID if needed
setUserId(getUserId());
