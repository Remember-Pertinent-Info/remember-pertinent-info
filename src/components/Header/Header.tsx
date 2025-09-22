'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Box, TextField, InputAdornment, useMediaQuery, useTheme } from '@mui/material';
import { GitHub, LightMode, DarkMode, Search } from '@mui/icons-material';
import { useAppTheme as useCustomTheme } from '@/contexts/ThemeContext';

/**
 * Header component with navigation and theme controls
 */
interface Props {
  onSearch?: (query: string) => void | Promise<void>;
  searching?: boolean;
}

const Header: React.FC<Props> = ({ onSearch, searching = false }) => {
  const { mode, toggleColorMode } = useCustomTheme();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const [searchQuery, setSearchQuery] = useState('');
  // Local animation control: keep bar visible while finishing
  const [active, setActive] = useState<boolean>(false);
  const [completing, setCompleting] = useState<boolean>(false);
  const progressRef = useRef<HTMLDivElement | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const typingRef = useRef<NodeJS.Timeout | null>(null);
  const [typing, setTyping] = useState<boolean>(false);

  useEffect(() => {
    if (searching) {
      // start/keep the animated bar running
      setCompleting(false);
      setActive(true);
    } else if (active) {
      // search ended while animation active -> finish faster
      setCompleting(true);
    }
  }, [searching]);

  const debouncedSearch = (query: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const value = query.trim();
      if (onSearch) {
        void onSearch(value);
      }
    }, 50); // 50ms debounce
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setTyping(true);
    if (typingRef.current) clearTimeout(typingRef.current);
    typingRef.current = setTimeout(() => setTyping(false), 1000); // 1s
    debouncedSearch(e.target.value);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    if (onSearch) {
      void onSearch(searchQuery.trim());
    } else {
      // Fallback: log when no handler supplied
      // eslint-disable-next-line no-console
      console.log('Searching for:', searchQuery);
    }
  };

  return (
    <AppBar position="fixed" color="transparent" sx={{ boxShadow: 'none', height: isMobile ? 'auto' : '64px', backdropFilter: 'blur(10px)', borderBottom: theme => `1px solid ${theme.palette.divider}` }}>
      {isMobile && (
        <Toolbar sx={{ justifyContent: 'center', minHeight: '48px' }}>
          <Typography
            variant="subtitle1"
            component="div"
            sx={{ fontWeight: 'bold', color: theme => theme.palette.text.primary, textTransform: 'capitalize', whiteSpace: 'nowrap' }}
          >
            CourseSource
          </Typography>
        </Toolbar>
      )}
      <Toolbar sx={{ height: '100%', gap: isMobile ? 1 : 2, alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Left side - Title (Desktop) */}
        <Typography
          variant={isMobile ? "subtitle1" : "h6"}
          component="div"
          sx={{ fontWeight: 'bold', color: theme => theme.palette.text.primary, textTransform: 'capitalize', whiteSpace: 'nowrap', display: isMobile ? 'none' : 'block' }}
        >
          CourseSource
        </Typography>

        {/* Center - Search Bar */}
        <Box
          sx={{
            flex: isMobile ? 1 : 'none',
            position: isMobile ? 'static' : 'absolute',
            left: isMobile ? 'auto' : '50%',
            transform: isMobile ? 'none' : 'translateX(-50%)',
            width: isMobile ? '100%' : 'clamp(320px, 50vw, 640px)',
            mx: isMobile ? 0 : 2,
          }}
        >
          <TextField
            fullWidth
            size="small"
            value={searchQuery}
            onChange={handleInputChange}
            placeholder={isMobile ? "Search..." : "Search concepts, skills, courses, tracks, majors, or departments..."}
            variant="outlined"
            type="search"
            inputMode="search"
            name="search-no-autofill"
            autoComplete="off"
            autoFocus={!isMobile}
            inputProps={{
              autoComplete: 'off',
              autoCorrect: 'off',
              autoCapitalize: 'none',
              spellCheck: false,
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ fontSize: isMobile ? '18px' : '20px' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                height: isMobile ? '36px' : '40px',
                borderRadius: isMobile ? '8px' : '12px',
                backgroundColor: 'transparent',
                color: theme => theme.palette.text.primary,
                transition: 'box-shadow 120ms ease, border-color 120ms ease',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme => theme.palette.action.disabled,
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme => theme.palette.primary.main,
                },
                '&.Mui-focused': {
                  boxShadow: theme => `0 0 0 4px ${theme.palette.primary.main}26`,
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme => theme.palette.primary.main,
                  borderWidth: '1px',
                },
                '& .MuiSvgIcon-root': {
                  color: theme => theme.palette.text.secondary,
                },
                '&.Mui-focused .MuiSvgIcon-root': {
                  color: theme => theme.palette.primary.main,
                },
              },
                '& .MuiInputBase-input::placeholder': {
                  color: theme => theme.palette.text.secondary,
                  opacity: 1,
                  fontSize: isMobile ? '12px' : '14px',
                },
            }}
          />
        </Box>

        {/* Right side - Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: isMobile ? 0.5 : 1, flexShrink: 0 }}>
          {/* Theme Switcher */}
          <IconButton onClick={toggleColorMode} sx={{ color: theme => theme.palette.text.primary }} aria-label="toggle theme">
            {mode === 'dark' ? <LightMode fontSize={isMobile ? 'small' : 'medium'} /> : <DarkMode fontSize={isMobile ? 'small' : 'medium'} />}
          </IconButton>

          {/* GitHub Link */}
          <IconButton component="a" href="https://github.com/Remember-Pertinent-Info/remember-pertinent-info" target="_blank" rel="noopener noreferrer" sx={{ color: theme => theme.palette.text.primary }} aria-label="GitHub repository">
            <GitHub fontSize={isMobile ? 'small' : 'medium'} />
          </IconButton>
        </Box>
      </Toolbar>
      {/* Animated bottom progress bar for search activity */}
      <Box
        component="div"
        sx={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: active || completing ? 4 : 1,
          pointerEvents: 'none',
          overflow: 'hidden',
          bgcolor: 'transparent',
        }}
      >
        <Box
          ref={progressRef}
          className="search-progress"
          onAnimationEnd={() => {
            // When completing animation finishes, hide the bar
            if (completing) {
              setCompleting(false);
              setActive(false);
            }
          }}
          sx={{
            height: '100%',
            width: active || completing ? (completing ? '90%' : '30%') : '100%',
            borderRadius: 1,
            boxShadow: active ? (mode === 'dark' ? '0 0 12px rgba(255,255,255,0.08)' : '0 0 12px rgba(0,0,0,0.06)') : 'none',
            background: active || completing
              ? (mode === 'dark'
                  ? 'linear-gradient(90deg, rgba(255,255,255,0.06), rgba(255,255,255,0.9), rgba(255,255,255,0.06))'
                  : 'linear-gradient(90deg, rgba(0,0,0,0.06), rgba(0,0,0,0.9), rgba(0,0,0,0.06))')
              : (mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'),
            transform: 'translateX(-120%)',
            // If typing, static glow; else animate
            animation: (active && !typing) ? 'searchWave 600ms linear infinite' : (completing ? 'searchWave 240ms linear 1' : 'none'),
            '@keyframes searchWave': {
              '0%': { transform: 'translateX(-120%)' },
              '60%': { transform: 'translateX(30%)' },
              '100%': { transform: 'translateX(120%)' },
            },
          }}
        />
      </Box>
    </AppBar>
  );
};

export default Header;
