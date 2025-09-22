'use client';

import React, { useState } from 'react';
import { TextField, InputAdornment, Box } from '@mui/material';
import { Search } from '@mui/icons-material';
import { useAppTheme } from '@/contexts/ThemeContext';

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
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search sx={{ color: mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)' }} />
            </InputAdornment>
          ),
          sx: {
            height: '48px',
            borderRadius: '24px',
            backgroundColor: mode === 'dark' ? 'transparent' : 'white',
            border: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)'}`,
            '& fieldset': {
              border: 'none',
            },
            '&:hover': {
              backgroundColor: mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.05)' 
                : 'rgba(0, 0, 0, 0.02)',
              boxShadow: mode === 'dark'
                ? '0 1px 6px rgba(255, 255, 255, 0.1)'
                : '0 1px 6px rgba(0, 0, 0, 0.1)',
            },
            '&.Mui-focused': {
              backgroundColor: mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.05)' 
                : 'white',
              boxShadow: mode === 'dark'
                ? '0 1px 6px rgba(255, 255, 255, 0.2)'
                : '0 1px 6px rgba(0, 0, 0, 0.2)',
            },
            color: mode === 'dark' ? 'white' : 'black',
          },
        }}
        sx={{
          '& .MuiInputBase-input::placeholder': {
            color: mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
            opacity: 1,
          },
        }}
      />
    </Box>
  );
};

export default SearchBar;
