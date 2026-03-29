import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user,           setUser]           = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [avatarUrl,      setAvatarUrl]      = useState(null);
  const [onboardingDone, setOnboardingDone] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token      = localStorage.getItem('token');

    if (storedUser && token) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);

        const savedAvatar = localStorage.getItem('payease_avatar');
        if (savedAvatar) setAvatarUrl(savedAvatar);

        // ── Read onboarding from cached user data immediately ──
        // This prevents flash of onboarding for returning users
        setOnboardingDone(parsed.onboarding_done !== false);

        setLoading(false); // ← set loading false RIGHT AWAY from cache

        // ── Then refresh from server silently in background ──
        silentRefresh();
      } catch (e) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  // ── Silent background refresh — never blocks UI, never redirects ──
  const silentRefresh = async () => {
    try {
      const { accountService } = await import('../services/api');
      const res  = await accountService.getBalance();
      const data = res.data;

      if (data.avatar_url) {
        setAvatarUrl(data.avatar_url);
        localStorage.setItem('payease_avatar', data.avatar_url);
      }

      setOnboardingDone(data.onboarding_done === true);

      const existing = localStorage.getItem('user');
      const merged   = { ...(existing ? JSON.parse(existing) : {}), ...data };
      localStorage.setItem('user', JSON.stringify(merged));
      setUser(merged);

    } catch (err) {
      // ── Silent fail — don't redirect, don't clear tokens ──
      // The interceptor handles real 401s separately
      console.warn('Background profile refresh failed:', err?.response?.status || err?.message);
    }
  };

  const login = (userData, accessToken, refreshToken) => {
    // ── Store tokens FIRST ──
    localStorage.setItem('token',         accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    localStorage.setItem('user',          JSON.stringify(userData));

    setUser(userData);
    setLoading(false);

    if (userData.avatar_url) {
      setAvatarUrl(userData.avatar_url);
      localStorage.setItem('payease_avatar', userData.avatar_url);
    }

    // ── Set onboarding from login response ──
    setOnboardingDone(userData.onboarding_done !== false);
  };

  const logout = async () => {
    try {
      const { authService } = await import('../services/api');
      await authService.logout();
    } catch (e) {}
    finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      localStorage.removeItem('payease_avatar');
      setUser(null);
      setAvatarUrl(null);
      setOnboardingDone(true);
    }
  };

  const completeOnboarding = async () => {
    // ── Mark done immediately — prevent any re-show ──
    setOnboardingDone(true);

    // ── Update cached user ──
    const existing = localStorage.getItem('user');
    if (existing) {
      try {
        const parsed = JSON.parse(existing);
        parsed.onboarding_done = true;
        localStorage.setItem('user', JSON.stringify(parsed));
      } catch (e) {}
    }

    // ── Persist to DB ──
    try {
      const { preferencesService } = await import('../services/api');
      await preferencesService.completeOnboarding();
    } catch (err) {
      console.error('completeOnboarding error:', err);
    }
  };

  const updateAvatar = (url) => {
    setAvatarUrl(url);
    if (url) localStorage.setItem('payease_avatar', url);
    else     localStorage.removeItem('payease_avatar');
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
      refreshProfile: silentRefresh,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}