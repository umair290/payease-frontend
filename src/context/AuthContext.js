import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Restore session on app load ──
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('token');
      const savedUser  = localStorage.getItem('user');
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
    } catch (e) {
      // Corrupted localStorage — clear it
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Login — store both tokens ──
  const login = useCallback((userData, accessToken, refreshToken = null) => {
    setUser(userData);
    setToken(accessToken);
    localStorage.setItem('token',        accessToken);
    localStorage.setItem('user',         JSON.stringify(userData));
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken);
    }
  }, []);

  // ── Logout — call API to blacklist token, then clear local state ──
  const logout = useCallback(async () => {
    try {
      // Import here to avoid circular dependency
      const { authService } = await import('../services/api');
      await authService.logout();
    } catch (e) {
      // Even if API call fails, clear local state
      console.log('Logout API error (continuing):', e);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  }, []);

  // ── Update user in context (used after profile edits) ──
  const updateUser = useCallback((updatedData) => {
    setUser(prev => {
      const merged = { ...prev, ...updatedData };
      localStorage.setItem('user', JSON.stringify(merged));
      return merged;
    });
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      logout,
      updateUser,
      isAuthenticated: !!token,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);