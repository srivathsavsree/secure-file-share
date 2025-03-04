import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
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
  (response) => {
    return response;
  },
  (error) => {
    // Handle token expiration or other auth errors
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const registerUser = (userData) => {
  return api.post('/users/register', userData);
};

export const loginUser = (userData) => {
  return api.post('/users/login', userData);
};

export const getCurrentUser = () => {
  return api.get('/users/me');
};

// File API calls
export const uploadFile = (fileData) => {
  const formData = new FormData();
  formData.append('file', fileData);
  
  return api.post('/files/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const getUserFiles = () => {
  return api.get('/files');
};

export const deleteFile = (fileId) => {
  return api.delete(`/files/${fileId}`);
};

export const getDownloadUrl = (downloadLink) => {
  return `http://localhost:5000/api/files/download/${downloadLink}`;
};

export default api;