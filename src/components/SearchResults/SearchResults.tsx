import React from 'react';
import { Box, List, ListItem, ListItemText, Typography } from '@mui/material';

export interface SearchResult {
  id: string;
  code: string;
  name: string;
  description?: string | null;
}

interface Props {
  results: SearchResult[];
}

const SearchResults: React.FC<Props> = ({ results }) => {
  if (!results || results.length === 0) {
    return null;
  }

  return (
    <Box component="section" sx={{ maxWidth: 960, mx: 'auto', mt: 2, px: 2 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Search results
      </Typography>
      <List>
        {results.map((r) => (
          <ListItem key={r.id} divider>
            <ListItemText primary={`${r.name}`} secondary={r.description ?? ''} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default SearchResults;
