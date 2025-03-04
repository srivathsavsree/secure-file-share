import React, { createContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { registerUser, loginUser, getCurrentUser } from '../utils/api';
import { setToken, removeToken, isAuthenticated, getUserInfo } from '../utils/auth';

// Create context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user from token on initial render
  useEffect(() => {
    const loadUser = async () => {
      if (isAuthenticated()) {
        try {
          const res = await getCurrentUser();
          setUser(res.data);
        } catch (err) {
          console.error('Failed to load user:', err);
          removeToken();
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  // Register user
  const register = async (userData) => {
    try {
      setLoading(true);
      const res = await registerUser(userData);
      setToken(res.data.token);
      
      // Get user data
      const userRes = await getCurrentUser();
      setUser(userRes.data);
      
      toast.success('Registration successful!');
      return true;
    } catch (err) {
      const message = err.response?.data?.msg || 'Registration failed';
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
      const res = await loginUser(userData);
      setToken(res.data.token);
      
      // Get user data
      const userRes = await getCurrentUser();
      setUser(userRes.data);
      
      toast.success('Login successful!');
      return true;
    } catch (err) {
      const message = err.response?.data?.msg || 'Login failed';
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
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};