'use client';

import React, { useEffect, useState } from 'react';
import { Box, useMediaQuery, useTheme, Typography, Toolbar } from '@mui/material';
import Header from '@/components/Header';
import SearchResults, { SearchResult } from '@/components/SearchResults';
import { useSemester } from '@/providers/SemesterProvider';

/**
 * Main landing page component
 * Features a minimalist design with search in the header
 */
const LandingPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { currentSemester } = useSemester();

  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [lastQuery, setLastQuery] = useState<string>('');

  // Fetch default results on first mount and when semester changes
  // If user had a search query, re-run it with the new semester
  useEffect(() => {
    if (!currentSemester) return; // Wait for semester to load

    let cancelled = false;
    (async () => {
      try {
        const params = new URLSearchParams();
        if (lastQuery) params.set('q', lastQuery);
        params.set('semester', currentSemester);

        const url = `/api/search?${params.toString()}`;
        const res = await fetch(url);
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
  }, [currentSemester]); // Reload when semester changes

  const handleSearch = async (query: string) => {
    const value = (query ?? '').trim();
    setLastQuery(value);
    setSearching(true);
    try {
      const params = new URLSearchParams();
      if (value) params.set('q', value);
      if (currentSemester) params.set('semester', currentSemester);

      const url = `/api/search?${params.toString()}`;
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
