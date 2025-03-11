import axios from 'axios';
import { toast } from 'react-toastify';

// Create an axios instance with default config
const api = axios.create({
  baseURL: '/api',  // Use relative URL to work with proxy
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 5000, // 5 seconds timeout
  withCredentials: false
});

// Debug log for development
const logRequest = (config) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`🚀 Making request to ${config.url}`, {
      method: config.method.toUpperCase(),
      headers: config.headers,
      data: config.data
    });
  }
  return config;
};

// Add a request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    // For file uploads, remove Content-Type header to let browser set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    logRequest(config);
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ Response from ${response.config.url}:`, response.data);
    }
    return response;
  },
  (error) => {
    // Network error
    if (!error.response) {
      console.error('Network error details:', {
        message: error.message,
        config: error.config
      });
      toast.error('Network error. Please check if the backend server is running.');
      return Promise.reject(new Error('Network error. Please check if the backend server is running.'));
    }

    // Handle token expiration or other auth errors
    if (error.response.status === 401) {
      localStorage.removeItem('token');
      window.location = '/login';
      return Promise.reject(new Error('Session expired. Please login again.'));
    }

    // Handle other errors
    const message = error.response.data?.message || error.message || 'An error occurred';
    console.error('API error:', {
      status: error.response?.status,
      message,
      data: error.response?.data
    });
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
  return api.post('/files/upload', formData, {
    timeout: 60000, // 60 seconds timeout for file uploads
    maxContentLength: Infinity, // Allow large files
    maxBodyLength: Infinity
  });
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