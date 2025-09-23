'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import { SearchResult } from '../SearchResults/SearchResults';

interface SkillDetailProps {
  skill: SearchResult;
}

/**
 * Detail component specifically for Skill entities
 */
const SkillDetail: React.FC<SkillDetailProps> = ({ skill }) => {
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Skill Details
      </Typography>
      
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
        Code: {skill.code}
      </Typography>
      
      {/* Placeholder for future skill-specific features */}
      <Box sx={{ mt: 3, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
        <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
          Future features for skills:
        </Typography>
        <Typography variant="body2" component="ul" sx={{ mt: 1, pl: 2 }}>
          <li>Prerequisite skills</li>
          <li>Courses that develop this skill</li>
          <li>Assessment quizzes</li>
          <li>Practice exercises</li>
          <li>Proficiency levels</li>
        </Typography>
      </Box>
    </Box>
  );
};

export default SkillDetail;