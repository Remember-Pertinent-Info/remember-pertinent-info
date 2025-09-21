'use client';

import React from 'react';
import { Box } from '@mui/material';
import Header from '@/components/Header/Header';

/**
 * Main landing page component
 * Features a minimalist design with search in the header
 */
const LandingPage: React.FC = () => {
  return (
    <>
      {/* Header with navigation and search */}
      <Header />
      
      {/* Main content area */}
      <Box
        sx={{
          minHeight: '100vh',
          pt: '64px', // Account for fixed header
        }}
      >
        {/* Future content will go here */}
      </Box>
    </>
  );
};

export default LandingPage;
