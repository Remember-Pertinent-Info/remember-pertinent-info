import React, { useMemo, useState } from 'react';
import { Box, Chip, List, ListItem, ListItemText, Typography, useTheme } from '@mui/material';

export interface SearchResult {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  type: 'concepts' | 'skills' | 'courses' | 'tracks' | 'departments' | 'majors';
}

interface Props {
  results: SearchResult[];
}

const SearchResults: React.FC<Props> = ({ results }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  type Category = {
    key: SearchResult['type'];
    label: string;
    vibrant: string;
    pastel: string;
  };

  const categories: Category[] = useMemo(
    () => [
      { key: 'concepts', label: 'Concepts', vibrant: '#e53935', pastel: '#ffcdd2' }, // red
      { key: 'skills', label: 'Skills', vibrant: '#ff8c00ff', pastel: '#fde9b3ff' }, // orange
      { key: 'courses', label: 'Courses', vibrant: '#43a047', pastel: '#c8e6c9' }, // green
      { key: 'tracks', label: 'Tracks', vibrant: '#1e88e5', pastel: '#bbdefb' }, // blue
      { key: 'departments', label: 'Departments', vibrant: 'rgba(118, 138, 255, 1)', pastel: '#c5cae9' }, // indigo
      { key: 'majors', label: 'Majors', vibrant: '#b342d3ff', pastel: '#e1bee7' }, // violet/purple
    ],
    []
  );

  const defaultSelected = useMemo(() => {
    const map: Record<SearchResult['type'], boolean> = {
      concepts: true,
      skills: true,
      courses: true,
      tracks: true,
      departments: true,
      majors: true,
    };
    return map;
  }, []);

  const [selected, setSelected] = useState<Record<SearchResult['type'], boolean>>(defaultSelected);

  // Filter results based on selected categories
  const filteredResults = useMemo(() => {
    return results.filter((result: SearchResult) => selected[result.type]);
  }, [results, selected]);

  const toggle = (key: SearchResult['type'], shiftKey = false) => {
    if (shiftKey) {
      // Shift-click: show only this category
      const newSelected: Record<SearchResult['type'], boolean> = {
        concepts: false,
        skills: false,
        courses: false,
        tracks: false,
        departments: false,
        majors: false,
      };
      newSelected[key] = true;
      setSelected(newSelected);
    } else {
      setSelected((prev) => ({ ...prev, [key]: !prev[key] }));
    }
  };

  const showOnlyCategory = (key: SearchResult['type']) => {
    const newSelected: Record<SearchResult['type'], boolean> = {
      concepts: false,
      skills: false,
      courses: false,
      tracks: false,
      departments: false,
      majors: false,
    };
    newSelected[key] = true;
    setSelected(newSelected);
  };

  // Helper function to get category info for a result type
  const getCategoryInfo = (type: SearchResult['type']) => {
    return categories.find((c) => c.key === type);
  };

  // Helper function to get singular form of category type
  const getSingularType = (type: SearchResult['type']) => {
    const singularMap: Record<SearchResult['type'], string> = {
      concepts: 'Concept',
      skills: 'Skill',
      courses: 'Course',
      tracks: 'Track',
      departments: 'Department',
      majors: 'Major',
    };
    return singularMap[type];
  };

  const Dot: React.FC<{ color: string; onClick?: (e: React.MouseEvent) => void }> = ({ color, onClick }) => (
    <Box
      component="span"
      onClick={onClick}
      sx={{
        display: 'inline-block',
        width: '0.6em',
        height: '0.6em',
        borderRadius: '50%',
        bgcolor: color,
        cursor: onClick ? 'pointer' : 'default',
      }}
    />
  );

  if (!results || results.length === 0) {
    return null;
  }

  return (
    <Box component="section" sx={{ maxWidth: 960, mx: 'auto', mt: 2, px: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 1 }}>
        <Typography variant="h6" sx={{ mr: 0.5 }}>
          Search results for matching
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          {categories.map((c) => {
            const isSel = !!selected[c.key];
            const baseBg = isDark ? 'transparent' : '#f0f0f0';
            const baseText = isDark ? '#ffffff' : '#333333';
            const baseOutline = isDark ? '1px solid rgba(255,255,255,0.5)' : 'none';

            const bg = isSel ? (isDark ? 'transparent' : c.pastel) : baseBg;
            const color = isSel ? c.vibrant : baseText;
            const outline = isSel ? (isDark ? `1px solid ${c.vibrant}` : 'none') : baseOutline;
            const dotColor = isSel
              ? (isDark ? c.pastel : c.vibrant)
              : (isDark ? '#ffffff' : '#9e9e9e');

            return (
              <Chip
                key={c.key}
                clickable
                onClick={(e) => toggle(c.key, e.shiftKey)}
                icon={<Dot color={dotColor} onClick={(e) => { e.stopPropagation(); showOnlyCategory(c.key); }} />}
                label={c.label}
                sx={{
                  borderRadius: '7px',
                  px: 1,
                  height: 28,
                  bgcolor: bg,
                  color,
                  border: outline,
                  '& .MuiChip-icon': {
                    color: 'inherit',
                    ml: 0.5,
                  },
                  '& .MuiChip-label': {
                    pl: 0.75,
                    pr: 0.75,
                    fontSize: 13,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontWeight: isSel && !isDark ? 700 : 400,
                  },
                  '&:hover': {
                    filter: 'brightness(1.05)',
                  },
                  // Hide MUI ripple (touch wave) for a crisp click
                  '& .MuiTouchRipple-root': {
                    display: 'none !important',
                  },
                }}
              />
            );
          })}
        </Box>
      </Box>
      <Typography 
        variant="body2" 
        sx={{ 
          textAlign: 'center', 
          color: 'text.secondary', 
          fontSize: '0.85rem', 
          mb: 2,
          opacity: 0.7
        }}
      >
        Shift-click a chip or click the dot to show only results from that category
      </Typography>
      <List>
        {filteredResults.map((r) => {
          const categoryInfo = getCategoryInfo(r.type);
          const singularType = getSingularType(r.type);
          const glowColor = categoryInfo?.vibrant ?? (isDark ? '#ffffff' : '#000000');
          const rowBg = isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)';
          return (
            <ListItem
              key={r.id}
              divider
              sx={{
                position: 'relative',
                overflow: 'hidden',
                backgroundColor: rowBg,
                pl: 2,
                '&:hover': {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.035)' : 'rgba(0,0,0,0.035)',
                },
              }}
            >
              {/* Left-side glow wash */}
              {categoryInfo && (
                <Box
                  aria-hidden
                  sx={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    // Expand across the whole row so the glow can fade left->right
                    right: 0,
                    width: '150%',
                    // Use a left-to-right gradient from vibrant color to transparent
                    background: `linear-gradient(90deg, ${glowColor} 0%, rgba(0,0,0,0) 60%)`,
                    // Make the glow brighter and softer
                    opacity: isDark ? 0.45 : 0.37,
                    filter: 'blur(28px)',
                    transform: 'translateZ(0)',
                    pointerEvents: 'none',
                    transition: 'opacity 180ms ease, transform 180ms ease',
                    // ensure the gradient blends nicely over background
                    mixBlendMode: isDark ? 'screen' : 'normal',
                  }}
                />
              )}

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%', position: 'relative', zIndex: 1 }}>
                <ListItemText
                  primary={r.name}
                  secondary={r.description ?? ''}
                  sx={{ flex: 1 }}
                />
                {categoryInfo && (
                  <Typography
                    sx={{
                      fontSize: 15,
                      fontWeight: 500,
                      color: categoryInfo.vibrant,
                    }}
                  >
                    {singularType}
                  </Typography>
                )}
              </Box>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
};

export default SearchResults;
