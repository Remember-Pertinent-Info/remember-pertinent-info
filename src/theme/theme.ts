import { createTheme, ThemeOptions } from '@mui/material/styles';

/**
 * Get theme configuration based on mode
 * @param mode - 'light' or 'dark' theme mode
 * @returns Material UI theme options
 */
export const getThemeOptions = (mode: 'light' | 'dark'): ThemeOptions => ({
  palette: {
    mode,
    ...(mode === 'dark'
      ? {
          // Dark mode colors
          background: {
            default: '#000000', // Jet black background
            paper: '#0a0a0a',
          },
          primary: {
            main: '#ffffff',
          },
        }
      : {
          // Light mode colors
          background: {
            default: '#ffffff',
            paper: '#f5f5f5',
          },
          primary: {
            main: '#000000',
          },
        }),
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
  },
});

/**
 * Create Material UI theme
 * @param mode - Theme mode
 */
export const createAppTheme = (mode: 'light' | 'dark') => {
  return createTheme(getThemeOptions(mode));
};
