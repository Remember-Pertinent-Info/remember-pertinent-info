'use client';

import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Box, Typography, Chip, useTheme, useMediaQuery, IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';
import { SearchResult } from '../SearchResults/SearchResults';
import { 
  ConceptDetail, 
  SkillDetail, 
  CourseDetail, 
  TrackDetail, 
  DepartmentDetail, 
  MajorDetail 
} from '../EntityDetails';

export interface EntityModalProps {
  entity: SearchResult | null;
  isOpen: boolean;
  onClose: () => void;
  borderColor: string;
}

/**
 * Reusable modal component for displaying entity details
 * Features:
 * - Portal rendering for proper overlay
 * - Backdrop blur matching header
 * - Dynamic border colors based on entity type
 * - Centered positioning with 5% horizontal, 4% vertical margins
 * - Scrollable content area
 * - ESC key support
 */
const EntityModal: React.FC<EntityModalProps> = ({ entity, isOpen, onClose, borderColor }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const modalRef = useRef<HTMLDivElement>(null);

  // ESC key handler
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Focus trap - focus the modal when it opens
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen || !entity) return null;

  const headerHeight = isMobile ? 112 : 64; // Account for mobile dual toolbar
  
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

  const modalContent = (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Backdrop - fully transparent (no tint, no blur), just a click catcher */}
      <Box
        onClick={onClose}
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'transparent',
          backdropFilter: 'none',
          WebkitBackdropFilter: 'none',
          cursor: 'pointer',
        }}
      />

      {/* Modal Container - Opaque interior */}
      <Box
        ref={modalRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        sx={{
          position: 'relative',
          width: '90vw', // 5% margins on each side
          height: `calc(100vh - ${headerHeight}px - 8vh)`, // 4% top/bottom margins + header
          maxHeight: `calc(100vh - ${headerHeight}px - 8vh)`,
          marginTop: `calc(${headerHeight}px + 4vh)`,
          // Interior: transparent with background blur (glass effect)
          backgroundColor: 'transparent',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderRadius: '12px',
          border: `1px solid ${borderColor}`, // Thinner border
          boxShadow: theme.palette.mode === 'dark' 
            ? '0 20px 50px rgba(0, 0, 0, 0.8)' 
            : '0 20px 50px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          outline: 'none',
        }}
      >
        {/* Modal Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 3,
            borderBottom: `1px solid ${theme.palette.divider}`,
            flexShrink: 0,
          }}
        >
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: theme.palette.text.primary,
                fontSize: { xs: '1.5rem', md: '2rem' },
              }}
            >
              {entity.name}
            </Typography>
            
            <Chip
              label={getSingularType(entity.type)}
              sx={{
                backgroundColor: borderColor,
                color: theme.palette.mode === 'dark' ? '#000' : '#fff',
                fontWeight: 600,
                fontSize: '0.9rem',
                ml: 2,
              }}
            />
          </Box>

          <IconButton
            onClick={onClose}
            sx={{
              ml: 2,
              color: theme.palette.text.secondary,
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            <Close />
          </IconButton>
        </Box>

        {/* Modal Content - Scrollable */}
        <Box
          sx={{
            flex: 1,
            padding: 3,
            overflowY: 'auto',
            overflowX: 'hidden',
          }}
        >
          {/* Description */}
          {entity.description && (
            <Typography
              variant="body1"
              sx={{
                color: theme.palette.text.secondary,
                fontSize: '1.1rem',
                lineHeight: 1.6,
                mb: 3,
              }}
            >
              {entity.description}
            </Typography>
          )}

          {/* Placeholder for type-specific content */}
          <Box sx={{ mt: 3 }}>
            {entity.type === 'concepts' && <ConceptDetail concept={entity} />}
            {entity.type === 'skills' && <SkillDetail skill={entity} />}
            {entity.type === 'courses' && <CourseDetail course={entity} />}
            {entity.type === 'tracks' && <TrackDetail track={entity} />}
            {entity.type === 'departments' && <DepartmentDetail department={entity} />}
            {entity.type === 'majors' && <MajorDetail major={entity} />}
          </Box>
        </Box>
      </Box>
    </Box>
  );

  // Render via portal
  return typeof window !== 'undefined' 
    ? createPortal(modalContent, document.body)
    : null;
};

export default EntityModal;