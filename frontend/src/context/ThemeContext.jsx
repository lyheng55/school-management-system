import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Get initial theme from localStorage or default to 'light'
  const getInitialTheme = () => {
    try {
      if (typeof Storage !== 'undefined' && localStorage) {
        const stored = localStorage.getItem('theme');
        return stored === 'dark' ? 'dark' : 'light';
      }
    } catch (e) {
      console.warn('localStorage not available:', e);
    }
    return 'light';
  };

  const [mode, setMode] = useState(getInitialTheme);

  useEffect(() => {
    // Save theme preference to localStorage
    try {
      if (typeof Storage !== 'undefined' && localStorage) {
        localStorage.setItem('theme', mode);
      }
    } catch (e) {
      console.warn('Could not save theme to localStorage:', e);
    }
  }, [mode]);

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const setTheme = (newMode) => {
    if (newMode === 'light' || newMode === 'dark') {
      setMode(newMode);
    }
  };

  const value = {
    mode,
    toggleTheme,
    setTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

