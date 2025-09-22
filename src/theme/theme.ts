import { createTheme, ThemeOptions } from '@mui/material/styles';

export const getThemeOptions = (mode: 'light' | 'dark'): ThemeOptions => ({
  palette: {
    mode,
    ...(mode === 'dark'
      ? {
          background: {
            default: '#000000', // Jet black background
            paper: '#0a0a0a',
          },
          primary: {
            main: '#ffffff',
          },
          text: {
            primary: '#ffffff',
            secondary: 'rgba(255, 255, 255, 0.7)',
          },
        }
      : {
          background: {
            default: '#ffffff',
            paper: '#f5f5f5',
          },
          primary: {
            main: '#000000',
          },
          text: {
            primary: '#000000',
            secondary: 'rgba(0, 0, 0, 0.54)',
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
