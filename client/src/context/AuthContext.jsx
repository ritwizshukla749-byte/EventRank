import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { useToast } from '../hooks/useToast';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { error: showError } = useToast();

  const refreshProfile = useCallback(async () => {
    try {
      const data = await authApi.me();
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const login = async (credentials, redirectTo = null) => {
    try {
      const data = await authApi.login(credentials);
      setUser(data.user);
      
      // Navigate to redirect path or default to homepage
      if (redirectTo) {
        navigate(redirectTo);
      } else {
        navigate('/');
      }
      
      return data;
    } catch (error) {
      showError(error.message || 'Login failed');
      throw error;
    }
  };

  const register = async (userData, redirectTo = null) => {
    try {
      const data = await authApi.register(userData);
      setUser(data.user);
      
      // Navigate to redirect path or default to homepage
      if (redirectTo) {
        navigate(redirectTo);
      } else {
        navigate('/');
      }
      
      return data;
    } catch (error) {
      showError(error.message || 'Registration failed');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      showError(error.message || 'Logout failed');
    } finally {
      setUser(null);
      navigate('/');
    }
  };

  const updateProfile = async (updates) => {
    try {
      const data = await authApi.updateProfile(updates);
      setUser(data.user);
      return data;
    } catch (error) {
      showError(error.message || 'Profile update failed');
      throw error;
    }
  };

  const value = {
    user,
    isAuthenticated: Boolean(user),
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
