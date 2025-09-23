'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import { SearchResult } from '../SearchResults/SearchResults';

interface MajorDetailProps {
  major: SearchResult;
}

/**
 * Detail component specifically for Major entities
 */
const MajorDetail: React.FC<MajorDetailProps> = ({ major }) => {
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Major Details
      </Typography>
      
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
        Code: {major.code}
      </Typography>
      
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