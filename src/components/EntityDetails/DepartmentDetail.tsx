'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import { SearchResult } from '../SearchResults/SearchResults';

interface DepartmentDetailProps {
  department: SearchResult;
}

/**
 * Detail component specifically for Department entities
 */
const DepartmentDetail: React.FC<DepartmentDetailProps> = ({ department }) => {
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Department Details
      </Typography>
      
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
        Code: {department.code}
      </Typography>
      
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