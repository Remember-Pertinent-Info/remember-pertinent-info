'use client';

import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { useModalStack } from '@/providers/ModalStackProvider';
import type { SearchResult as SR } from '@/components/SearchResults';
import { getCategoryColors } from '@/utils/categoryColors';

type Entity = { id: string; code: string; name: string };

interface DepartmentDetailProps {
  department: SR | { id: string; code: string; name: string; majors?: Entity[] };
}

/**
 * Detail component specifically for Department entities
 * Shows a 4x3 grid of majors offered by the department.
 */
const DepartmentDetail: React.FC<DepartmentDetailProps> = ({ department }) => {
  const theme = useTheme();
  const { openEntity } = useModalStack();
  const [majors, setMajors] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If majors already provided (from admin page), use them
    if ('majors' in department && department.majors) {
      setMajors(department.majors);
      setLoading(false);
      return;
    }

    // Otherwise fetch from API
    fetch(`/api/admin/detail?type=department&id=${department.id}`)
      .then(res => res.json())
      .then(data => {
        setMajors(data.majors || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch department details:', err);
        setLoading(false);
      });
  }, [department]);

  const outlineColor = getCategoryColors('majors').vibrant;
  const bgColor = theme.palette.mode === 'dark' ? alpha(theme.palette.background.paper, 0.12) : alpha('#ffffff', 0.55);

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Department Details
      </Typography>

      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
        Code: {department.code}
      </Typography>

      {/* Majors grid */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
          Majors
        </Typography>

        {loading ? (
          <Box sx={{ mt: 1, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Loading majors...
            </Typography>
          </Box>
        ) : majors.length > 0 ? (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, maxWidth: '800px' }}>
            {majors.slice(0, 12).map((m) => (
              <Box
                key={m.id}
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
                  openEntity({ id: m.id, code: m.code, name: m.name, type: 'majors' as SR['type'] })
                }
              >
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {m.code}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {m.name}
                </Typography>
              </Box>
            ))}
          </Box>
        ) : (
          <Box sx={{ mt: 1, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              No majors listed for this department.
            </Typography>
          </Box>
        )}
      </Box>

      {/* Placeholder for future department-specific features */}
      <Box sx={{ mt: 3, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
        <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
          Future features for departments:
        </Typography>
        <Typography variant="body2" component="ul" sx={{ mt: 1, pl: 2 }}>
          <li>Majors offered</li>
          <li>Faculty members</li>
          <li>Department facilities</li>
          <li>Research areas</li>
          <li>Contact information</li>
          <li>Departmental news and events</li>
        </Typography>
      </Box>
    </Box>
  );
};

export default DepartmentDetail;