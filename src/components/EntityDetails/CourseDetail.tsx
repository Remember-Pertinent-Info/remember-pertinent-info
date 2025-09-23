'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import { SearchResult } from '../SearchResults/SearchResults';

interface CourseDetailProps {
  course: SearchResult;
}

/**
 * Detail component specifically for Course entities
 */
const CourseDetail: React.FC<CourseDetailProps> = ({ course }) => {
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Course Details
      </Typography>
      
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
        Code: {course.code}
      </Typography>
      
      {/* Placeholder for future course-specific features */}
      <Box sx={{ mt: 3, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
        <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
          Future features for courses:
        </Typography>
        <Typography variant="body2" component="ul" sx={{ mt: 1, pl: 2 }}>
          <li>Prerequisites</li>
          <li>Skills developed</li>
          <li>Concepts taught</li>
          <li>Associated majors and tracks</li>
          <li>Course schedule and availability</li>
          <li>Professor information</li>
          <li>Student reviews</li>
        </Typography>
      </Box>
    </Box>
  );
};

export default CourseDetail;