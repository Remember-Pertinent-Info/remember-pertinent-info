import { Box, CircularProgress, Typography } from '@mui/material';

/**
 * Loading UI for the admin page
 * Displayed while admin data is being fetched
 */
export default function AdminLoading() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
        gap: 2,
      }}
    >
      <CircularProgress size={60} />
      <Typography variant="body1" color="text.secondary">
        Loading admin panel...
      </Typography>
    </Box>
  );
}
