import { jwtDecode } from "jwt-decode";
import axios from 'axios';

// Set auth token in axios headers
const setAuthHeader = (token) => {
  if (token) {
    axios.defaults.headers.common['x-auth-token'] = token;
  } else {
    delete axios.defaults.headers.common['x-auth-token'];
  }
};

// Save token to localStorage and set axios header
export const setToken = (token) => {
  localStorage.setItem('token', token);
  setAuthHeader(token);
};

// Remove token from localStorage and axios header
export const removeToken = () => {
  localStorage.removeItem('token');
  setAuthHeader(null);
};

// Get token from localStorage
export const getToken = () => {
  return localStorage.getItem('token');
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = getToken();
  if (!token) return false;
  
  try {
    const decoded = jwtDecode(token);
    // Check if token is expired
    if (decoded.exp * 1000 < Date.now()) {
      removeToken();
      return false;
    }
    return true;
  } catch (error) {
    removeToken();
    return false;
  }
};

// Get user info from token
export const getUserInfo = () => {
  const token = getToken();
  if (!token) return null;
  
  try {
    const decoded = jwtDecode(token);
    return decoded.user;
  } catch (error) {
    return null;
  }
};

// Initialize auth state
export const initializeAuth = () => {
  const token = getToken();
  if (token) {
    setAuthHeader(token);
  }
};