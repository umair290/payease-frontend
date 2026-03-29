import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user,           setUser]           = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [avatarUrl,      setAvatarUrl]      = useState(null);
  const [onboardingDone, setOnboardingDone] = useState(true); // true by default — avoid flash

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token      = localStorage.getItem('token');

    if (storedUser && token) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);

        // ── Restore avatar immediately from cache (no flash) ──
        const savedAvatar = localStorage.getItem('payease_avatar');
        if (savedAvatar) setAvatarUrl(savedAvatar);

        // ── Set onboarding from cached user data ──
        setOnboardingDone(parsed.onboarding_done !== false);

        // ── Refresh from server in background ──
        loadUserProfile();
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

  const loadUserProfile = async () => {
    try {
      const { accountService } = await import('../services/api');
      const res  = await accountService.getBalance();
      const data = res.data;

      if (data.avatar_url) {
        setAvatarUrl(data.avatar_url);
        localStorage.setItem('payease_avatar', data.avatar_url);
      }

      // ── onboarding_done comes from DB via /balance ──
      setOnboardingDone(data.onboarding_done === true);

      const existing = localStorage.getItem('user');
      const merged   = { ...(existing ? JSON.parse(existing) : {}), ...data };
      localStorage.setItem('user', JSON.stringify(merged));
      setUser(merged);

    } catch (err) {
      console.error('loadUserProfile error:', err);
      // ── Don't clear tokens here — interceptor handles real 401s ──
    } finally {
      setLoading(false);
    }
  };

  const login = (userData, accessToken, refreshToken) => {
    // ── CRITICAL: store tokens FIRST before ANY API calls ──
    localStorage.setItem('token',         accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    localStorage.setItem('user',          JSON.stringify(userData));

    // ── Set state from login response immediately ──
    setUser(userData);

    if (userData.avatar_url) {
      setAvatarUrl(userData.avatar_url);
      localStorage.setItem('payease_avatar', userData.avatar_url);
    }

    // ── Set onboarding from login response ──
    // login response includes onboarding_done from user.to_dict()
    setOnboardingDone(userData.onboarding_done !== false);

    // ── Do NOT call loadUserProfile() here ──
    // Dashboard calls refreshProfile() after mounting safely
    setLoading(false);
  };

  const logout = async () => {
    try {
      const { authService } = await import('../services/api');
      await authService.logout();
    } catch (e) {
      // Silent — always clear state
    } finally {
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
    setOnboardingDone(true); // optimistic
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
      refreshProfile: loadUserProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}