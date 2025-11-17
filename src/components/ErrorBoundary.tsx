import { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Card, CardContent } from '@mui/material';
import { ErrorOutline, Refresh } from '@mui/icons-material';
import { logger } from '../utils/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error using logger
    logger.error('ErrorBoundary caught an error:', error, errorInfo);
    // In production, send to error tracking service
    // Example: Sentry.captureException(error, { extra: errorInfo });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
    // Reload page to ensure clean state
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#FFF9F3',
            p: 3,
          }}
        >
          <Card sx={{ maxWidth: 500, width: '100%' }}>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <ErrorOutline sx={{ fontSize: 64, color: '#E76F51', mb: 2 }} />
              <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>
                Oops! Something went wrong
              </Typography>
              <Typography variant="body1" sx={{ color: '#7A7A7A', mb: 3 }}>
                An unexpected error occurred. Try reloading the page.
              </Typography>
              {import.meta.env.DEV && this.state.error && (
                <Box
                  sx={{
                    backgroundColor: '#F5F5F5',
                    p: 2,
                    borderRadius: 2,
                    mb: 3,
                    textAlign: 'left',
                  }}
                >
                  <Typography variant="caption" sx={{ color: '#E76F51', fontWeight: 600 }}>
                    Error (development only):
                  </Typography>
                  <Typography
                    variant="caption"
                    component="pre"
                    sx={{
                      display: 'block',
                      mt: 1,
                      color: '#7A7A7A',
                      fontSize: '0.75rem',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  >
                    {this.state.error.toString()}
                    {this.state.error.stack}
                  </Typography>
                </Box>
              )}
              <Button
                variant="contained"
                startIcon={<Refresh />}
                onClick={this.handleReset}
                sx={{
                  backgroundColor: '#FFB86C',
                  '&:hover': {
                    backgroundColor: '#E89A4A',
                  },
                }}
              >
                Reload Page
              </Button>
            </CardContent>
          </Card>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

