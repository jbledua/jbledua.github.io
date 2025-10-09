import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ThemeProvider, useMediaQuery } from '@mui/material';
import themeFactory from './theme.js';

const ColorModeContext = createContext({ mode: 'light', toggleColorMode: () => {} });

export function ColorModeProvider({ children }) {
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  const [mode, setMode] = useState('light');

  useEffect(() => {
    const saved = localStorage.getItem('color-mode');
    if (saved === 'light' || saved === 'dark') {
      setMode(saved);
    } else {
      setMode(prefersDark ? 'dark' : 'light');
    }
  }, [prefersDark]);

  const toggleColorMode = useCallback(() => {
    setMode((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('color-mode', next);
      return next;
    });
  }, []);

  const theme = useMemo(() => themeFactory(mode), [mode]);

  const value = useMemo(() => ({ mode, toggleColorMode }), [mode, toggleColorMode]);

  return (
    <ColorModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export function useColorMode() {
  return useContext(ColorModeContext);
}
