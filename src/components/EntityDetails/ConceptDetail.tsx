'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import { SearchResult } from '../SearchResults/SearchResults';

interface ConceptDetailProps {
  concept: SearchResult;
}

/**
 * Detail component specifically for Concept entities
 */
const ConceptDetail: React.FC<ConceptDetailProps> = ({ concept }) => {
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Concept Details
      </Typography>
      
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
        Code: {concept.code}
      </Typography>
      
      {/* Placeholder for future concept-specific features */}
      <Box sx={{ mt: 3, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
        <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
          Future features for concepts:
        </Typography>
        <Typography variant="body2" component="ul" sx={{ mt: 1, pl: 2 }}>
          <li>Related concepts</li>
          <li>Skills that use this concept</li>
          <li>Courses that teach this concept</li>
          <li>Learning resources</li>
        </Typography>
      </Box>
    </Box>
  );
};

export default ConceptDetail;