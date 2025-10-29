import api from '../core/config/api';

export const addComment = async (postId, username, text, token) => {
    const response = await api.post(`/api/posts/${postId}/comment`, null, {
        params: { username, text },
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const getComments = async (postId, page = 0, size = 10, token) => {
    const response = await api.get(`/api/posts/${postId}/comments`, {
        params: { page, size },
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};