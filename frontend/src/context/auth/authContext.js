import React, { createContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { registerUser, loginUser, getCurrentUser } from '../../utils/api';
import { setToken, removeToken, isAuthenticated, getUserInfo } from '../../utils/auth';

// Create context with initial values
export const AuthContext = createContext({
  user: null,
  loading: true,
  error: null,
  isAuthenticated: false,
  register: async () => {},
  login: async () => {},
  logout: () => {},
  clearErrors: () => {},
  loadUser: async () => {}
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user function
  const loadUser = async () => {
    if (isAuthenticated()) {
      try {
        const res = await getCurrentUser();
        if (res && res.data) {
          setUser(res.data);
        }
      } catch (err) {
        console.error('Failed to load user:', err);
        removeToken();
        setError('Session expired. Please login again.');
      }
    }
    setLoading(false);
  };

  // Load user on initial render
  useEffect(() => {
    loadUser();
  }, []);

  // Clear any errors
  const clearErrors = () => {
    setError(null);
  };

  // Register user
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await registerUser(userData);
      
      if (res && res.data && res.data.token) {
        setToken(res.data.token);
        
        // Get user data
        const userRes = await getCurrentUser();
        if (userRes && userRes.data) {
          setUser(userRes.data);
          toast.success('Registration successful!');
          return true;
        }
      }
      throw new Error('Registration failed');
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Registration failed';
      setError(message);
      toast.error(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await loginUser(userData);
      
      if (res && res.data && res.data.token) {
        setToken(res.data.token);
        
        // Get user data
        const userRes = await getCurrentUser();
        if (userRes && userRes.data) {
          setUser(userRes.data);
          toast.success('Login successful!');
          return true;
        }
      }
      throw new Error('Login failed');
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Login failed';
      setError(message);
      toast.error(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    removeToken();
    setUser(null);
    setError(null);
    toast.info('Logged out successfully');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        isAuthenticated: !!user,
        register,
        login,
        logout,
        clearErrors,
        loadUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;