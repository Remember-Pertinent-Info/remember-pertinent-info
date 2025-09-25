'use client';

import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { useModalStack } from '@/providers/ModalStackProvider';
import type { SearchResult as SR } from '@/components/SearchResults';
import { getCategoryColors } from '@/utils/categoryColors';

type Entity = { id: string; code: string; name: string };

interface TrackDetailProps {
  track: SR | { id: string; code: string; name: string; courses?: Entity[]; majors?: Entity[] };
}

/**
 * Detail component specifically for Track entities
 * Shows a 4x3 grid of related courses when available.
 */
const TrackDetail: React.FC<TrackDetailProps> = ({ track }) => {
  const theme = useTheme();
  const { openEntity } = useModalStack();
  const [courses, setCourses] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If courses already provided (from admin page), use them
    if ('courses' in track && track.courses) {
      setCourses(track.courses);
      setLoading(false);
      return;
    }

    // Otherwise fetch from API
    fetch(`/api/admin/detail?type=track&id=${track.id}`)
      .then(res => res.json())
      .then(data => {
        setCourses(data.courses || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch track details:', err);
        setLoading(false);
      });
  }, [track]);

  const outlineColor = getCategoryColors('courses').vibrant;
  const bgColor = theme.palette.mode === 'dark' ? alpha(theme.palette.background.paper, 0.12) : alpha('#ffffff', 0.55);

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Track Details
      </Typography>

      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
        Code: {track.code}
      </Typography>

      {/* Courses grid */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
          Courses
        </Typography>

        {loading ? (
          <Box sx={{ mt: 1, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Loading courses...
            </Typography>
          </Box>
        ) : courses.length > 0 ? (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, maxWidth: '800px' }}>
            {courses.slice(0, 12).map((c) => (
              <Box
                key={c.id}
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
                  openEntity({ id: c.id, code: c.code, name: c.name, type: 'courses' as SR['type'] })
                }
              >
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {c.code}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {c.name}
                </Typography>
              </Box>
            ))}
          </Box>
        ) : (
          <Box sx={{ mt: 1, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              No courses available for this track.
            </Typography>
          </Box>
        )}
      </Box>

      {/* Placeholder for future track-specific features */}
      <Box sx={{ mt: 3, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
        <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
          Future features for tracks:
        </Typography>
        <Typography variant="body2" component="ul" sx={{ mt: 1, pl: 2 }}>
          <li>Required courses</li>
          <li>Elective options</li>
          <li>Associated majors</li>
          <li>Career pathways</li>
          <li>Learning progression</li>
          <li>Track completion requirements</li>
        </Typography>
      </Box>
    </Box>
  );
};

export default TrackDetail;