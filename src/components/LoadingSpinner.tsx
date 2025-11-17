import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = 'Loading...' }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#FFF9F3',
        gap: 2,
      }}
    >
      <CircularProgress
        size={48}
        sx={{
          color: '#FFB86C',
        }}
      />
      <Typography variant="body1" sx={{ color: '#7A7A7A' }}>
        {message}
      </Typography>
    </Box>
  );
};

export default LoadingSpinner;

