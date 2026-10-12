import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

const THEMES = [
  { id: 'theme-default', label: 'Emerald', color: '#1a6b60' },
  { id: 'theme-orange',  label: 'Orange',  color: '#c2410c' },
  { id: 'theme-blue',    label: 'Blue',    color: '#1e40af' },
  { id: 'theme-purple',  label: 'Purple',  color: '#6d28d9' },
  { id: 'theme-dark',    label: 'Dark',    color: '#2a9d8f' },
  { id: 'theme-midnight',label: 'Midnight',color: '#5b8dee' },
];

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(
    () => localStorage.getItem('theme') || 'theme-default'
  );

  useEffect(() => {
    // Remove all theme classes, apply current
    document.documentElement.classList.remove(...THEMES.map(t => t.id));
    if (theme !== 'theme-default') {
      document.documentElement.classList.add(theme);
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);