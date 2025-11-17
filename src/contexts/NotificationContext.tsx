import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Snackbar, Alert, AlertColor, Slide, SlideProps } from '@mui/material';

interface Notification {
  id: string;
  message: string;
  type: AlertColor;
  emoji?: string;
  duration?: number;
}

interface NotificationContextType {
  showNotification: (message: string, type?: AlertColor, emoji?: string, duration?: number) => void;
  showSuccess: (message: string, emoji?: string) => void;
  showError: (message: string, emoji?: string) => void;
  showInfo: (message: string, emoji?: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction="up" />;
}

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [currentNotification, setCurrentNotification] = useState<Notification | null>(null);

  const showNotification = useCallback((
    message: string,
    type: AlertColor = 'success',
    emoji?: string,
    duration: number = 3000
  ) => {
    const id = Date.now().toString();
    const notification: Notification = { id, message, type, emoji, duration };
    
    setCurrentNotification(notification);
    setOpen(true);

    setTimeout(() => {
      setOpen(false);
      setTimeout(() => {
        setCurrentNotification(null);
      }, 300); // Wait for animation to complete
    }, duration);
  }, []);

  const showSuccess = useCallback((message: string, emoji: string = '✨') => {
    showNotification(message, 'success', emoji, 3000);
  }, [showNotification]);

  const showError = useCallback((message: string, emoji: string = '⚠️') => {
    showNotification(message, 'error', emoji, 4000);
  }, [showNotification]);

  const showInfo = useCallback((message: string, emoji: string = 'ℹ️') => {
    showNotification(message, 'info', emoji, 3000);
  }, [showNotification]);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <NotificationContext.Provider value={{ showNotification, showSuccess, showError, showInfo }}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={currentNotification?.duration || 3000}
        onClose={handleClose}
        TransitionComponent={SlideTransition}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{
          '& .MuiSnackbarContent-root': {
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          },
        }}
      >
        <Alert
          onClose={handleClose}
          severity={currentNotification?.type || 'success'}
          variant="filled"
          sx={{
            borderRadius: '16px',
            fontWeight: 500,
            fontSize: '15px',
            alignItems: 'center',
            '& .MuiAlert-icon': {
              fontSize: '24px',
            },
            backgroundColor: currentNotification?.type === 'success' 
              ? '#85C88A' 
              : currentNotification?.type === 'error'
              ? '#E76F51'
              : '#FFB86C',
            color: '#2C2C2C',
          }}
        >
          {currentNotification?.emoji && (
            <span style={{ marginRight: '8px', fontSize: '20px' }}>
              {currentNotification.emoji}
            </span>
          )}
          {currentNotification?.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

