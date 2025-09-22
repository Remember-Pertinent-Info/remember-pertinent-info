'use client';

import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { ThemeProvider as MUIThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { createAppTheme } from '@/theme/theme';

/**
 * Theme context type definition
 */
interface ThemeContextType {
  toggleColorMode: () => void;
  mode: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * Custom hook to use theme context.
 *
 * We export `useAppTheme` to avoid colliding with MUI's `useTheme` hook.
 */
export const useAppTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * Theme provider component that wraps the app with Material UI theme
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // State to hold the current theme mode
  const [mode, setMode] = useState<'light' | 'dark'>('dark'); // Default to dark for SSR

  // On the client, check for the system's preferred color scheme
  React.useEffect(() => {
    const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    setMode(prefersDarkMode ? 'dark' : 'light');
  }, []);

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
      mode,
    }),
    [mode]
  );

  const theme = useMemo(() => createAppTheme(mode), [mode]);

  // Force body background and text color to match theme
  React.useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.style.backgroundColor = theme.palette.background.default;
      document.body.style.color = theme.palette.text.primary;
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={colorMode}>
      <MUIThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MUIThemeProvider>
    </ThemeContext.Provider>
  );
};
