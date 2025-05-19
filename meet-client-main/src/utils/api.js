import axios from 'axios';

// Prefer runtime config from vite envs and fall back to local dev URL
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8002/api';

// Function to fetch user data
export const fetchUsers = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users`);
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

// Function to fetch user details by ID
export const fetchUserDetails = async (userId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user details:', error);
    throw error;
  }
};

// Function to fetch posts for moderation
export const fetchPostsForModeration = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/posts/moderation`);
    return response.data;
  } catch (error) {
    console.error('Error fetching posts for moderation:', error);
    throw error;
  }
};

// Function to approve or reject a post
export const moderatePost = async (postId, action) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/posts/${postId}/moderate`, { action });
    return response.data;
  } catch (error) {
    console.error('Error moderating post:', error);
    throw error;
  }
};

// Function to fetch analytics data
export const fetchAnalytics = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/analytics`);
    return response.data;
  } catch (error) {
    console.error('Error fetching analytics:', error);
    throw error;
  }
};