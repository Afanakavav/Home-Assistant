import { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import { HouseholdProvider } from './contexts/HouseholdContext';
import { NotificationProvider } from './contexts/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load pages for code splitting
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ShoppingListPage = lazy(() => import('./pages/ShoppingListPage'));
const ExpensesPage = lazy(() => import('./pages/ExpensesPage'));
const TasksPage = lazy(() => import('./pages/TasksPage'));
const InventoryPage = lazy(() => import('./pages/InventoryPage'));
const PlantsPage = lazy(() => import('./pages/PlantsPage'));
const VendorsPage = lazy(() => import('./pages/VendorsPage'));

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#FFB86C', // Terracotta chiara - accento primario
      light: '#FFD4A3',
      dark: '#E89A4A',
      contrastText: '#2C2C2C',
    },
    secondary: {
      main: '#6A994E', // Verde oliva - accento secondario
      light: '#8FC26F',
      dark: '#4F7A38',
      contrastText: '#FFF9F3',
    },
    background: {
      default: '#FFF9F3', // Avorio caldo
      paper: '#FFFFFF',
    },
    text: {
      primary: '#2C2C2C', // Testo principale
      secondary: '#7A7A7A', // Testo secondario
    },
    success: {
      main: '#85C88A', // Verde salvia - feedback positivi
      light: '#A8D9AC',
      dark: '#5FA066',
    },
    error: {
      main: '#E76F51', // Corallo tenue - errori/attenzione
      light: '#F08F77',
      dark: '#C85A3D',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Nunito", "Quicksand", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
    h1: {
      fontSize: '28px',
      fontWeight: 600,
      color: '#2C2C2C',
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '22px',
      fontWeight: 600,
      color: '#2C2C2C',
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '20px',
      fontWeight: 500,
      color: '#2C2C2C',
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '18px',
      fontWeight: 500,
      color: '#2C2C2C',
    },
    h5: {
      fontSize: '16px',
      fontWeight: 500,
      color: '#2C2C2C',
    },
    h6: {
      fontSize: '14px',
      fontWeight: 500,
      color: '#2C2C2C',
    },
    body1: {
      fontSize: '16px',
      fontWeight: 400,
      color: '#2C2C2C',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '14px',
      fontWeight: 400,
      color: '#7A7A7A',
      lineHeight: 1.5,
    },
    button: {
      fontSize: '14px',
      fontWeight: 500,
      textTransform: 'none', // No uppercase by default
    },
  },
  shape: {
    borderRadius: 16, // Angoli arrotondati "2xl"
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          border: 'none',
          transition: 'all 0.2s ease-out',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '10px 24px',
          fontWeight: 500,
          textTransform: 'none',
          transition: 'all 0.2s ease-out',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
          },
        },
        contained: {
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 12px rgba(255, 184, 108, 0.4)',
          transition: 'all 0.3s ease-out',
          '&:hover': {
            transform: 'scale(1.05)',
            boxShadow: '0 6px 16px rgba(255, 184, 108, 0.5)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
  },
});

// Component to ensure correct URL path
const PathGuard = () => {
  const location = useLocation();
  const basePath = '/home-assistant';

  useEffect(() => {
    const currentPath = window.location.pathname;
    const expectedPath = basePath + location.pathname;
    
    // If URL doesn't match expected path, update it
    if (currentPath !== expectedPath) {
      window.history.replaceState(null, '', expectedPath);
    }
  }, [location.pathname]);

  return null;
};

function App() {
  const basePath = '/home-assistant';

  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <HouseholdProvider>
            <NotificationProvider>
              <Router basename={basePath}>
              <PathGuard />
              <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route 
                  path="/login" 
                  element={
                    <Suspense fallback={<LoadingSpinner message="Loading login..." />}>
                      <Login />
                    </Suspense>
                  } 
                />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Suspense fallback={<LoadingSpinner message="Loading dashboard..." />}>
                        <Dashboard />
                      </Suspense>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/shopping-list"
                  element={
                    <ProtectedRoute>
                      <Suspense fallback={<LoadingSpinner message="Loading shopping list..." />}>
                        <ShoppingListPage />
                      </Suspense>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/expenses"
                  element={
                    <ProtectedRoute>
                      <Suspense fallback={<LoadingSpinner message="Loading expenses..." />}>
                        <ExpensesPage />
                      </Suspense>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tasks"
                  element={
                    <ProtectedRoute>
                      <Suspense fallback={<LoadingSpinner message="Loading tasks..." />}>
                        <TasksPage />
                      </Suspense>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/inventory"
                  element={
                    <ProtectedRoute>
                      <Suspense fallback={<LoadingSpinner message="Loading inventory..." />}>
                        <InventoryPage />
                      </Suspense>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/plants"
                  element={
                    <ProtectedRoute>
                      <Suspense fallback={<LoadingSpinner message="Loading plants..." />}>
                        <PlantsPage />
                      </Suspense>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/vendors"
                  element={
                    <ProtectedRoute>
                      <Suspense fallback={<LoadingSpinner message="Loading vendors..." />}>
                        <VendorsPage />
                      </Suspense>
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </Router>
          </NotificationProvider>
        </HouseholdProvider>
      </AuthProvider>
    </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

