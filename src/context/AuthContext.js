import React, { createContext, useContext, useState, useEffect } from 'react';
import { accountService, preferencesService } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user,          setUser]          = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [avatarUrl,     setAvatarUrl]     = useState(null);
  const [onboardingDone, setOnboardingDone] = useState(true);  // default true to avoid flash

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token      = localStorage.getItem('token');
    if (storedUser && token) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      // Load fresh data from server
      loadUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const loadUserProfile = async () => {
    try {
      const res = await accountService.getBalance();
      const data = res.data;

      // ── Avatar from DB/Cloudinary ──
      if (data.avatar_url) {
        setAvatarUrl(data.avatar_url);
        localStorage.setItem('payease_avatar', data.avatar_url);
      }

      // ── Onboarding from DB ──
      setOnboardingDone(data.onboarding_done === true);

      // ── Update stored user ──
      const updatedUser = { ...JSON.parse(localStorage.getItem('user') || '{}'), ...data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

    } catch (err) {
      console.error('Profile load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const login = (userData, accessToken, refreshToken) => {
    localStorage.setItem('token',         accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    localStorage.setItem('user',          JSON.stringify(userData));
    setUser(userData);
    // Load full profile after login
    loadUserProfile();
  };

  const logout = async () => {
    try {
      const { authService } = await import('../services/api');
      await authService.logout();
    } catch (e) {}
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('payease_avatar');
    setUser(null);
    setAvatarUrl(null);
    setOnboardingDone(true);
  };

  const completeOnboarding = async () => {
    try {
      await preferencesService.completeOnboarding();
      setOnboardingDone(true);
    } catch (err) {
      console.error('Onboarding complete error:', err);
      setOnboardingDone(true); // optimistic
    }
  };

  const updateAvatar = (url) => {
    setAvatarUrl(url);
    localStorage.setItem('payease_avatar', url);
  };

  const removeAvatar = () => {
    setAvatarUrl(null);
    localStorage.removeItem('payease_avatar');
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      avatarUrl,
      onboardingDone,
      login,
      logout,
      completeOnboarding,
      updateAvatar,
      removeAvatar,
      refreshProfile: loadUserProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}