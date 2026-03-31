import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user,           setUser]           = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [avatarUrl,      setAvatarUrl]      = useState(null);
  const [onboardingDone, setOnboardingDone] = useState(true);

  // ── Once onboarding marked done, never let background refresh undo it ──
  const onboardingLocked = useRef(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token      = localStorage.getItem('token');

    if (storedUser && token) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);

        const savedAvatar = localStorage.getItem('payease_avatar');
        if (savedAvatar) setAvatarUrl(savedAvatar);

        if (parsed.onboarding_done === true) {
          onboardingLocked.current = true;
          setOnboardingDone(true);
        } else {
          setOnboardingDone(false);
        }

        setLoading(false);
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

  const silentRefresh = async () => {
    try {
      const { accountService } = await import('../services/api');
      const res  = await accountService.getBalance();
      const data = res.data;

      if (data.avatar_url) {
        setAvatarUrl(data.avatar_url);
        localStorage.setItem('payease_avatar', data.avatar_url);
      }

      // ── Only update onboarding if not already locked ──
      if (!onboardingLocked.current) {
        setOnboardingDone(data.onboarding_done === true);
        if (data.onboarding_done === true) {
          onboardingLocked.current = true;
        }
      }

      const existing = localStorage.getItem('user');
      const merged   = { ...(existing ? JSON.parse(existing) : {}), ...data };
      localStorage.setItem('user', JSON.stringify(merged));
      setUser(merged);

    } catch (err) {
      console.warn('Background refresh failed:', err?.response?.status || err?.message);
    }
  };

  const login = (userData, accessToken, refreshToken) => {
    // ── Store tokens FIRST before anything else ──
    localStorage.setItem('token',         accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    localStorage.setItem('user',          JSON.stringify(userData));

    setUser(userData);
    setLoading(false);

    if (userData.avatar_url) {
      setAvatarUrl(userData.avatar_url);
      localStorage.setItem('payease_avatar', userData.avatar_url);
    }

    if (userData.onboarding_done === true) {
      onboardingLocked.current = true;
      setOnboardingDone(true);
    } else {
      setOnboardingDone(false);
    }
  };

  const logout = async () => {
    try {
      const { authService } = await import('../services/api');
      await authService.logout();
    } catch (e) {}
    finally {
      onboardingLocked.current = false;
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
    // ── Lock immediately — prevent any background refresh undoing it ──
    onboardingLocked.current = true;
    setOnboardingDone(true);

    try {
      const existing = localStorage.getItem('user');
      if (existing) {
        const parsed = JSON.parse(existing);
        parsed.onboarding_done = true;
        localStorage.setItem('user', JSON.stringify(parsed));
      }
    } catch (e) {}

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