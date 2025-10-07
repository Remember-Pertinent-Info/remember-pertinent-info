'use client';

import { useEffect } from 'react';
import { Box, Container, Typography, Button } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

/**
 * Global error boundary
 * Catches errors in the app and displays a fallback UI
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <Container>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh',
          textAlign: 'center',
          gap: 3,
        }}
      >
        <Typography variant="h1" component="h1" sx={{ fontSize: { xs: '3rem', md: '4rem' }, fontWeight: 700 }}>
          Oops!
        </Typography>
        <Typography variant="h4" component="h2" sx={{ mb: 2 }}>
          Something went wrong
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 600 }}>
          We encountered an unexpected error. Please try again or contact support if the problem persists.
        </Typography>
        {error.digest && (
          <Typography variant="caption" color="text.disabled" sx={{ fontFamily: 'monospace', mb: 2 }}>
            Error ID: {error.digest}
          </Typography>
        )}
        <Button
          onClick={reset}
          variant="contained"
          size="large"
          startIcon={<RefreshIcon />}
        >
          Try Again
        </Button>
      </Box>
    </Container>
  );
}
