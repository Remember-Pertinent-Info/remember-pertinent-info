'use client';

import React, { useState } from 'react';
import { TextField, InputAdornment, Box } from '@mui/material';
import { Search } from '@mui/icons-material';
import { useAppTheme } from '@/providers/ThemeProvider';

interface SearchBarProps {
  onSearch?: (query: string) => void;
}

/**
 * Google-style search bar component
 */
const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { mode } = useAppTheme();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      autoComplete="off"
      sx={{
        width: '100%',
        maxWidth: '584px',
        margin: '0 auto',
      }}
    >
      <TextField
        fullWidth
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search concepts, skills, courses, tracks, majors, or departments..."
        variant="outlined"
        type="search"
        inputMode="search"
        name="search-no-autofill"
        autoComplete="off"
        inputProps={{
          autoComplete: 'off',
          autoCorrect: 'off',
          autoCapitalize: 'none',
          spellCheck: false,
          style: {
            fontSize: '1.35rem', // larger text
            lineHeight: 1.5,
          },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search sx={{ color: mode === 'dark' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.35)', fontSize: 26 }} />
            </InputAdornment>
          ),
          sx: {
            height: '56px',
            borderRadius: '28px',
            backgroundColor: 'transparent',
            border: 'none',
            boxShadow: 'none',
            '& fieldset': {
              border: 'none !important',
            },
            '&:hover': {
              border: 'none',
              boxShadow: 'none',
            },
            '&.Mui-focused': {
              backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)',
              boxShadow: mode === 'dark' ? '0 4px 18px rgba(255,255,255,0.04)' : '0 6px 20px rgba(0,0,0,0.06)',
              border: 'none',
            },
            color: mode === 'dark' ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.9)',
            fontSize: '1.15rem', // slightly smaller text
            transition: 'background-color 160ms ease, box-shadow 180ms ease, border-color 120ms ease',
          },
        }}
        sx={{
          '& .MuiInputBase-input::placeholder': {
            color: mode === 'dark' ? 'rgba(255, 255, 255, 0.36)' : 'rgba(0, 0, 0, 0.36)',
            opacity: 1,
            fontSize: '1.08rem', // slightly smaller placeholder
          },
        }}
      />
    </Box>
  );
};

export default SearchBar;