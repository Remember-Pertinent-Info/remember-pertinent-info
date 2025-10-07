import { Box, CircularProgress } from '@mui/material';

/**
 * Global loading UI
 * Displayed while the app is loading
 */
export default function Loading() {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
      }}
    >
      <CircularProgress size={60} />
    </Box>
  );
}
