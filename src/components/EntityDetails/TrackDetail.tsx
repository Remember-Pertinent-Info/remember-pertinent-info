'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import { SearchResult } from '../SearchResults/SearchResults';

interface TrackDetailProps {
  track: SearchResult;
}

/**
 * Detail component specifically for Track entities
 */
const TrackDetail: React.FC<TrackDetailProps> = ({ track }) => {
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Track Details
      </Typography>
      
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
        Code: {track.code}
      </Typography>
      
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