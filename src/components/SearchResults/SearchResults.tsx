import React, { useMemo, useState } from 'react';
import { Box, Chip, List, ListItem, ListItemText, Typography, useTheme } from '@mui/material';

export interface SearchResult {
  id: string;
  code: string;
  name: string;
  description?: string | null;
}

interface Props {
  results: SearchResult[];
}

const SearchResults: React.FC<Props> = ({ results }) => {
  if (!results || results.length === 0) {
    return null;
  }

  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const categories = useMemo(
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

  // Select all categories by default
  const defaultSelected = useMemo(() => {
    const map: Record<string, boolean> = {};
    categories.forEach((c) => { map[c.key] = true; });
    return map;
  }, [categories]);

  const [selected, setSelected] = useState<Record<string, boolean>>(defaultSelected);

  const toggle = (key: string) => {
    setSelected((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const Dot = ({ color }: { color: string }) => (
    <Box
      component="span"
      sx={{
        display: 'inline-block',
        width: '0.6em',
        height: '0.6em',
        borderRadius: '50%',
        bgcolor: color,
      }}
    />
  );

  return (
    <Box component="section" sx={{ maxWidth: 960, mx: 'auto', mt: 2, px: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 1 }}>
        <Typography variant="h6" sx={{ mr: 0.5 }}>
          Search results for
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
                onClick={() => toggle(c.key)}
                icon={<Dot color={dotColor} />}
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
      <List>
        {results.map((r) => (
          <ListItem key={r.id} divider>
            <ListItemText primary={`${r.name}`} secondary={r.description ?? ''} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default SearchResults;
