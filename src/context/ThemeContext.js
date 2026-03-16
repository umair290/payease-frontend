import React, { createContext, useState, useContext } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  const toggleTheme = () => setIsDark(!isDark);

  const theme = {
    isDark,
    toggleTheme,
    colors: isDark ? {
      bg: '#0A0F1E',
      card: '#141B2D',
      cardSecondary: '#1E2640',
      text: '#FFFFFF',
      textSecondary: '#AAB0C0',
      border: '#2A2F45',
      inputBg: '#0A0F1E',
      navBg: '#141B2D',
      actionBg: '#1E2640',
    } : {
      bg: '#F0F4FF',
      card: '#FFFFFF',
      cardSecondary: '#F8FAFF',
      text: '#1A1A2E',
      textSecondary: '#888',
      border: '#E0E6F0',
      inputBg: '#F8FAFF',
      navBg: '#FFFFFF',
      actionBg: '#EEF3FF',
    }
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);