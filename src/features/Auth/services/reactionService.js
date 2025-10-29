// src/features/Auth/services/reactionService.js
import axios from 'axios';
import { BASE_URL } from '../../../core/config/api';
import { getAuthHeaders } from './authHeaderService';

const api = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' }
});

const withAuth = () => ({ headers: { ...getAuthHeaders() } });

export const likePost = async (postId, username, reactionType = 'like') => {
    const config = {
        ...withAuth(),
        params: { username, reactionType }
    };
    const res = await api.post(`/api/posts/${postId}/reaction`, null, config);
    return res.data;
};

export const unlikePost = async (postId, username, reactionType = 'like') => {
    const config = {
        ...withAuth(),
        params: { username, reactionType }
    };
    const res = await api.delete(`/api/posts/${postId}/reaction`, config);
    return res.data;
};

export const addComment = async (postId, comment, username) => {
    const config = {
        ...withAuth(),
        params: { reactionType: 'comment' }
    };
    const body = { comment, username };
    const res = await api.post(`/api/posts/${postId}/reaction`, body, config);
    return res.data;
};

export const sharePost = async (postId, username) => {
    const config = {
        ...withAuth(),
        params: { username, reactionType: 'share' }
    };
    const res = await api.post(`/api/posts/${postId}/reaction`, null, config);
    return res.data;
};


