'use client';

import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { useModalStack } from '@/contexts/ModalStackContext';
import type { SearchResult as SR } from '@/components/SearchResults/SearchResults';
import { getCategoryColors } from '@/lib/categoryColors';

type Entity = { id: string; code: string; name: string };

interface MajorDetailProps {
  // Accept either a SearchResult (used by search modal) or the admin-detail shape
  major: SR | { id: string; code: string; name: string; department?: Entity | null; courses?: Entity[]; tracks?: Entity[] };
}

/**
 * Detail component specifically for Major entities
 * Shows a 4x3 grid of related tracks when available.
 */
const MajorDetail: React.FC<MajorDetailProps> = ({ major }) => {
  const theme = useTheme();
  const { openEntity } = useModalStack();
  const [tracks, setTracks] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If tracks already provided (from admin page), use them
    if ('tracks' in major && major.tracks) {
      setTracks(major.tracks);
      setLoading(false);
      return;
    }

    // Otherwise fetch from API
    fetch(`/api/admin/detail?type=major&id=${major.id}`)
      .then(res => res.json())
      .then(data => {
        setTracks(data.tracks || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch major details:', err);
        setLoading(false);
      });
  }, [major]);

  const outlineColor = getCategoryColors('tracks').vibrant;
  const bgColor = theme.palette.mode === 'dark' ? alpha(theme.palette.background.paper, 0.12) : alpha('#ffffff', 0.55);

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Major Details
      </Typography>

      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
        Code: {major.code}
      </Typography>

      {/* Tracks grid (4 columns x up to 3 rows) */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
          Tracks
        </Typography>

        {loading ? (
          <Box sx={{ mt: 1, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Loading tracks...
            </Typography>
          </Box>
        ) : tracks.length > 0 ? (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 2,
              maxWidth: '800px',
            }}
          >
            {tracks.slice(0, 12).map((t) => (
              <Box
                key={t.id}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  bgcolor: bgColor,
                  backdropFilter: 'blur(6px)',
                  WebkitBackdropFilter: 'blur(6px)',
                  border: `2px solid ${outlineColor}`,
                  aspectRatio: '4/3',
                  width: '160px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'transform 120ms ease, box-shadow 120ms ease',
                  '&:hover': { transform: 'translateY(-1px)' },
                }}
                onClick={() =>
                  openEntity({ id: t.id, code: t.code, name: t.name, type: 'tracks' as SR['type'] })
                }
              >
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {t.code}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {t.name}
                </Typography>
              </Box>
            ))}
          </Box>
        ) : (
          <Box sx={{ mt: 1, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              No tracks available for this major.
            </Typography>
          </Box>
        )}
      </Box>

      {/* Placeholder for future major-specific features */}
      <Box sx={{ mt: 3, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
        <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
          Future features for majors:
        </Typography>
        <Typography variant="body2" component="ul" sx={{ mt: 1, pl: 2 }}>
          <li>Degree requirements</li>
          <li>Required courses</li>
          <li>Available tracks</li>
          <li>Associated department</li>
          <li>Career outcomes</li>
          <li>Graduation statistics</li>
          <li>Academic advisors</li>
        </Typography>
      </Box>
    </Box>
  );
};

export default MajorDetail;