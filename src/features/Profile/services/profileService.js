// src/features/Profile/services/profileService.js (UPDATED)
import axios from "axios";
import { getAuthHeader } from "../../Auth/services/authHeaderService";

// Base URLs for the two separate backend entities
const USER_API_URL = "https://ardu-backend.onrender.com/api/users";
const ADMIN_API_URL = "https://ardu-backend.onrender.com/api/admins"; 

// ------------------------------------------------------------------
// USER Service Functions (Existing)
// ------------------------------------------------------------------

export const getUserById = async (id) => {
  const res = await axios.get(`${USER_API_URL}/${id}`, {
    headers: getAuthHeader(),
  });
  return res.data;
};

export const updateUser = async (id, userData) => {
  const res = await axios.put(`${USER_API_URL}/${id}`, userData, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
  });
  return res.data;
};

export const uploadUserImage = async (id, file) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await axios.post(`${USER_API_URL}/${id}/image`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      ...getAuthHeader(),
    },
  });
  return res.data;
};

// ------------------------------------------------------------------
// ADMIN Service Functions (NEW)
// ------------------------------------------------------------------

export const getAdminById = async (id) => {
    const res = await axios.get(`${ADMIN_API_URL}/${id}`, {
        headers: getAuthHeader(),
    });
    return res.data;
};

export const updateAdmin = async (id, adminData) => {
  try {
    const res = await axios.put(`${ADMIN_API_URL}/${id}`, adminData, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    });
    return res.data;
  } catch (err) {
    // If admin endpoint doesn't exist for this id, fall back to user update endpoint
    if (err?.response?.status === 404) {
      const fallback = await axios.put(`${USER_API_URL}/${id}`, adminData, {
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
      });
      return fallback.data;
    }
    throw err;
  }
};

export const uploadAdminImage = async (id, file) => {
    const formData = new FormData();
    formData.append("file", file);

  try {
    const res = await axios.post(`${ADMIN_API_URL}/${id}/image`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        ...getAuthHeader(),
      },
    });
    return res.data;
  } catch (err) {
    // If admin image endpoint doesn't exist for this id, try user image endpoint as fallback
    if (err?.response?.status === 404) {
      const fallback = await axios.post(`${USER_API_URL}/${id}/image`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          ...getAuthHeader(),
        },
      });
      return fallback.data;
    }
    throw err;
  }
};