'use client';

import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Box, TextField, InputAdornment } from '@mui/material';
import { GitHub, LightMode, DarkMode, Search } from '@mui/icons-material';
import { useTheme } from '@/contexts/ThemeContext';

/**
 * Header component with navigation and theme controls
 */
const Header: React.FC = () => {
  const { mode, toggleColorMode } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // TODO: Implement search functionality
      console.log('Searching for:', searchQuery);
    }
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        backgroundColor: 'transparent',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid',
        borderColor: mode === 'dark' 
          ? 'rgba(255, 255, 255, 0.1)' 
          : 'rgba(0, 0, 0, 0.1)',
        boxShadow: 'none',
        height: '64px',
      }}
    >
      <Toolbar sx={{ height: '100%', gap: 2, alignItems: 'center', position: 'relative' }}>
        {/* Left side - Title */}
        <Typography
          variant="h6"
          component="div"
          sx={{
            fontWeight: 'bold',
            color: mode === 'dark' ? 'white' : 'black',
            textTransform: 'capitalize',
            whiteSpace: 'nowrap',
          }}
        >
          Remember Pertinent Info
        </Typography>

        {/* Center - Search Bar */}
        <Box
          component="form"
          onSubmit={handleSearch}
          autoComplete="off"
          sx={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'clamp(320px, 50vw, 640px)',
            mx: 2,
          }}
        >
          <TextField
            fullWidth
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search concepts, skills, courses, tracks, majors, or departments..."
            variant="outlined"
            type="search"
            inputMode="search"
            name="search-no-autofill"
            autoComplete="off"
            autoFocus
            inputProps={{
              autoComplete: 'off',
              autoCorrect: 'off',
              autoCapitalize: 'none',
              spellCheck: false,
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ fontSize: '20px' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                height: '40px',
                borderRadius: '12px',
                backgroundColor: 'transparent',
                color: mode === 'dark' ? 'white' : 'black',
                transition: 'box-shadow 120ms ease, border-color 120ms ease',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.3)'
                    : 'rgba(0, 0, 0, 0.3)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#1e88e5',
                },
                '&.Mui-focused': {
                  boxShadow: '0 0 0 4px rgba(30, 136, 229, 0.15)',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#1e88e5',
                  borderWidth: '2px',
                },
                '& .MuiSvgIcon-root': {
                  color: mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.6)'
                    : 'rgba(0, 0, 0, 0.6)',
                },
                '&.Mui-focused .MuiSvgIcon-root': {
                  color: '#1e88e5',
                },
              },
              '& .MuiInputBase-input::placeholder': {
                color: mode === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.5)',
                opacity: 1,
                fontSize: '14px',
              },
            }}
          />
        </Box>

        {/* Right side - Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0, ml: 'auto' }}>
          {/* Theme Switcher */}
          <IconButton
            onClick={toggleColorMode}
            sx={{ color: mode === 'dark' ? 'white' : 'black' }}
            aria-label="toggle theme"
          >
            {mode === 'dark' ? <LightMode /> : <DarkMode />}
          </IconButton>

          {/* GitHub Link */}
          <IconButton
            component="a"
            href="https://github.com/Remember-Pertinent-Info/remember-pertinent-info"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ color: mode === 'dark' ? 'white' : 'black' }}
            aria-label="GitHub repository"
          >
            <GitHub />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
