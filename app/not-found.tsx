import Link from 'next/link';
import { Box, Container, Typography, Button } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';

/**
 * Global 404 Not Found page
 * Displayed when a route doesn't exist
 */
export default function NotFound() {
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
        <Typography variant="h1" component="h1" sx={{ fontSize: { xs: '4rem', md: '6rem' }, fontWeight: 700 }}>
          404
        </Typography>
        <Typography variant="h4" component="h2" sx={{ mb: 2 }}>
          Page Not Found
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </Typography>
        <Button
          component={Link}
          href="/"
          variant="contained"
          size="large"
          startIcon={<HomeIcon />}
        >
          Back to Home
        </Button>
      </Box>
    </Container>
  );
}
