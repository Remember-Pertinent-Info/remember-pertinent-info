'use client';

import React, { useEffect, useState } from 'react';
import { Box, useMediaQuery, useTheme, Typography, Toolbar } from '@mui/material';
import Header from '@/components/Header/Header';
import SearchResults, { SearchResult } from '@/components/SearchResults/SearchResults';

/**
 * Main landing page component
 * Features a minimalist design with search in the header
 */
const LandingPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Fetch default results on first mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/search');
        if (!res.ok) return;
        const json = await res.json();
        if (!cancelled) {
          setResults(json.results ?? []);
          setMessage(json.message ?? null);
        }
      } catch {
        // ignore initial load errors for now
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleSearch = async (query: string) => {
    const value = (query ?? '').trim();
    setSearching(true);
    try {
      const url = value ? `/api/search?q=${encodeURIComponent(value)}` : '/api/search';
      const res = await fetch(url);
      if (!res.ok) {
        console.error('Search API error', await res.text());
        setResults([]);
        setMessage('Search failed');
        setSearching(false);
        return;
      }
      const json = await res.json();
      setResults(json.results ?? []);
      if (json.warning) {
        // surface server-side warnings in dev console for now
        console.warn('Search API warning:', json.warning);
      }
      setMessage(json.message ?? null);
      setSearching(false);
    } catch (err) {
      console.error('Search request failed', err);
      setResults([]);
      setSearching(false);
    }
  };

  return (
    <>
      {/* Header with navigation and search */}
  <Header onSearch={handleSearch} searching={searching} />
      
      {/* Main content area */}
      <Box sx={{ minHeight: '100vh' }}>
        {/* Reliable offset for fixed AppBar: mirror the Header's toolbars */}
        {isMobile ? (
          <>
            <Toolbar sx={{ minHeight: '48px' }} />
            <Toolbar />
          </>
        ) : (
          <Toolbar />
        )}
        {/* Render search results (unstyled for now) */}
        <SearchResults results={results} />
        {message && (
          <Box sx={{ maxWidth: 960, mx: 'auto', mt: 2, px: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
              {message}
            </Typography>
          </Box>
        )}
      </Box>
    </>
  );
};

export default LandingPage;
