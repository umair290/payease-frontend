import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('payease_theme') === 'dark';
  });

  const toggleTheme = () => {
    setIsDark(prev => {
      localStorage.setItem('payease_theme', !prev ? 'dark' : 'light');
      return !prev;
    });
  };

  const theme = {
    isDark,
    toggleTheme,
    colors: isDark ? {
      // ── DARK THEME ──
      bg: '#0D1117',
      card: '#161B22',
      cardSecondary: '#1C2333',
      text: '#F0F6FC',
      textSecondary: '#8B949E',
      border: '#21262D',
      inputBg: '#0D1117',
      navBg: '#161B22',
      actionBg: '#1C2333',
      success: '#238636',
      successText: '#3FB950',
      error: '#DA3633',
      errorText: '#F85149',
      warning: '#9E6A03',
      warningText: '#D29922',
      accent: '#1F6FEB',
      accentHover: '#388BFD',
      shadow: 'rgba(0,0,0,0.4)',
      overlay: 'rgba(0,0,0,0.75)',
      // Gradients
      primaryGrad: 'linear-gradient(135deg, #1F6FEB, #0052CC)',
      successGrad: 'linear-gradient(135deg, #238636, #196C2E)',
      cardGrad: 'linear-gradient(135deg, #161B22, #1C2333)',
      balanceGrad: 'linear-gradient(135deg, #1F6FEB 0%, #0052CC 100%)',
    } : {
      // ── LIGHT THEME (Wise-style) ──
      bg: '#F6F8FA',
      card: '#FFFFFF',
      cardSecondary: '#F6F8FA',
      text: '#1A1F2E',
      textSecondary: '#6B7280',
      border: '#E5E7EB',
      inputBg: '#FFFFFF',
      navBg: '#FFFFFF',
      actionBg: '#F6F8FA',
      success: '#DCFCE7',
      successText: '#16A34A',
      error: '#FEE2E2',
      errorText: '#DC2626',
      warning: '#FEF9C3',
      warningText: '#CA8A04',
      accent: '#1A73E8',
      accentHover: '#1557B0',
      shadow: 'rgba(0,0,0,0.06)',
      overlay: 'rgba(0,0,0,0.5)',
      // Gradients
      primaryGrad: 'linear-gradient(135deg, #1A73E8, #0052CC)',
      successGrad: 'linear-gradient(135deg, #16A34A, #15803D)',
      cardGrad: 'linear-gradient(135deg, #FFFFFF, #F6F8FA)',
      balanceGrad: 'linear-gradient(135deg, #1A73E8 0%, #0052CC 100%)',
    }
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
