import React, { useState } from 'react';
import { useAuth } from '../Auth/useAuth';

const UploadPage = () => {
    const { user } = useAuth();
    // State to hold form data: file and a description/caption
    const [file, setFile] = useState(null);
    const [description, setDescription] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    // Modified to hold a detailed status object/string
    const [uploadStatus, setUploadStatus] = useState({ message: '', type: '' });
    
    // New state to hold the created post's initial status
    const [postStatus, setPostStatus] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Clear previous post status
        setPostStatus(''); 

        if (!file || !description.trim()) {
            setUploadStatus({ message: 'Please select a file and provide a description.', type: 'error' });
            return;
        }

        setIsUploading(true);
        setUploadStatus({ message: 'Uploading...', type: 'info' });

        // Create FormData object to send multipart/form-data
        const formData = new FormData();
        formData.append('file', file);
        formData.append('userId', user?.id);
        formData.append('caption', description);

        try {
            // Get auth headers
            const token = localStorage.getItem('user_jwt_token');
            // Headers for a fetch request with FormData **should NOT** include 'Content-Type': 'multipart/form-data'.
            // The browser sets the correct Content-Type header, including the necessary boundary, automatically.
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
            
            const response = await fetch('http://https://ardu-backend.onrender.com/api/posts/create', {
                method: 'POST',
                headers,
                body: formData,
            });

            if (!response.ok) {
                // Attempt to read the server's error message, if available
                const errorData = await response.json().catch(() => ({ message: `Upload failed with status: ${response.status}` }));
                throw new Error(errorData.message || `Upload failed with status: ${response.status}`);
            }

            // **ASSUMPTION:** The server returns the newly created post object.
            const newPost = await response.json(); 
            
            // Check the status from the server response
            const initialStatus = newPost.status ? newPost.status.toUpperCase() : 'PENDING';
            setPostStatus(initialStatus);

            let successMessage = 'Upload successful! 🎉';
            if (initialStatus === 'PENDING') {
                successMessage = 'Upload successful! Post is **Pending** admin review. ⏳';
            } else if (initialStatus === 'APPROVED') {
                successMessage = 'Upload successful! Post is **Approved** and live! ✅';
            } else {
                successMessage = `Upload successful! Post status: ${initialStatus}`;
            }

            setUploadStatus({ message: successMessage, type: 'success' });
            setFile(null); // Clear file input
            setDescription(''); // Clear description
            // You might want to navigate the user or show the new post here
        } catch (error) {
            console.error('Upload Error:', error);
            setUploadStatus({ message: `Upload failed: ${error.message}. Please try again.`, type: 'error' });
        } finally {
            setIsUploading(false);
        }
    };

    const getStatusClassName = (type) => {
        switch (type) {
            case 'success':
                return 'text-green-600';
            case 'error':
                return 'text-red-600';
            case 'info':
            default:
                return 'text-gray-600';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">
                    Create New Post
                </h1>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* File Input */}
                    <div>
                        <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2">
                            Select File (Image/Video)
                        </label>
                        <input
                            id="file-upload"
                            type="file"
                            // To clear the file input after successful upload, the `value` property 
                            // needs to be controlled, but setting `value` for type="file" is tricky/bad practice.
                            // A better way is to use a `ref` or to reset the parent form, but for this simple case,
                            // clearing the state (`setFile(null)`) is often sufficient to show "no file selected" 
                            // in a new form submission, but the input element itself might not visually clear on all browsers.
                            // For a visual clear, you typically key the component or use a ref. We'll stick to clearing state.
                            accept="image/*,video/*"
                            onChange={(e) => setFile(e.target.files[0])}
                            className="w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 p-3
                                     file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0
                                     file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600
                                     hover:file:bg-indigo-100"
                            disabled={isUploading}
                        />
                        {file && (
                            <p className="mt-2 text-sm text-gray-500">
                                Selected: **{file.name}** ({Math.round(file.size / 1024)} KB)
                            </p>
                        )}
                    </div>

                    {/* Description/Caption Input */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                            Description/Caption
                        </label>
                        <textarea
                            id="description"
                            rows="4"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="What's this post about?"
                            className="block w-full rounded-md border-gray-300 shadow-sm p-3 border focus:border-indigo-500 focus:ring-indigo-500"
                            required
                            disabled={isUploading}
                        ></textarea>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                            isUploading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                        }`}
                        disabled={isUploading || !file || !description.trim()}
                    >
                        {isUploading ? 'Uploading...' : 'Upload Post'}
                    </button>
                </form>

                {/* Upload Status Message */}
                {uploadStatus.message && (
                    <p 
                        className={`mt-4 text-center font-semibold ${getStatusClassName(uploadStatus.type)}`}
                        dangerouslySetInnerHTML={{ __html: uploadStatus.message }} // Use dangerouslySetInnerHTML to allow for the **bold** styling
                    >
                        {/* Status message is injected via dangerouslySetInnerHTML */}
                    </p>
                )}
                
                {/* Specific Post Status Display (Optional, can be merged into the main status) */}
                {/* {postStatus && (
                    <p className={`mt-2 text-center text-sm font-medium ${postStatus === 'APPROVED' ? 'text-green-500' : 'text-orange-500'}`}>
                        Initial Post Status: **{postStatus}**
                    </p>
                )} */}
            </div>
        </div>
    );
};

export default UploadPage;