import axios from 'axios';
import { toast } from 'react-toastify';

// Create an axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    // For file uploads, remove Content-Type header to let browser set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle token expiration or other auth errors
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location = '/login';
      return Promise.reject(new Error('Session expired. Please login again.'));
    }

    // Handle other errors
    const message = error.response?.data?.message || error.message || 'An error occurred';
    toast.error(message);
    return Promise.reject(error);
  }
);

// Auth API calls
export const registerUser = (userData) => {
  return api.post('/auth/register', userData);
};

export const loginUser = (userData) => {
  return api.post('/auth/login', userData);
};

export const getCurrentUser = () => {
  return api.get('/auth/user');
};

// File API calls
export const uploadFile = (formData) => {
  return api.post('/files/upload', formData);
};

export const getUserFiles = () => {
  return api.get('/files');
};

export const deleteFile = (fileId) => {
  return api.delete(`/files/${fileId}`);
};

export const getDownloadUrl = (downloadLink) => {
  return `${api.defaults.baseURL}/files/download/${downloadLink}`;
};

export default api;
