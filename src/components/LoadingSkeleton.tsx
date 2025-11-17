import React from 'react';
import { Box, Skeleton, Card, CardContent } from '@mui/material';

interface LoadingSkeletonProps {
  variant?: 'list' | 'card' | 'chart' | 'expense';
  count?: number;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ 
  variant = 'list', 
  count = 3 
}) => {
  if (variant === 'list') {
    return (
      <Box>
        {Array.from({ length: count }).map((_, index) => (
          <Box key={index} sx={{ mb: 2 }}>
            <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 2 }} />
          </Box>
        ))}
      </Box>
    );
  }

  if (variant === 'card') {
    return (
      <Card>
        <CardContent>
          <Skeleton variant="text" width="60%" height={32} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
        </CardContent>
      </Card>
    );
  }

  if (variant === 'chart') {
    return (
      <Card>
        <CardContent>
          <Skeleton variant="text" width="40%" height={28} sx={{ mb: 3 }} />
          <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
        </CardContent>
      </Card>
    );
  }

  if (variant === 'expense') {
    return (
      <Box>
        {Array.from({ length: count }).map((_, index) => (
          <Box key={index} sx={{ mb: 1.5, display: 'flex', gap: 2, alignItems: 'center' }}>
            <Skeleton variant="circular" width={40} height={40} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="70%" height={24} />
              <Skeleton variant="text" width="40%" height={20} />
            </Box>
            <Skeleton variant="text" width={80} height={28} />
          </Box>
        ))}
      </Box>
    );
  }

  return null;
};

export default LoadingSkeleton;

