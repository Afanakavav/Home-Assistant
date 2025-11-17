import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { createHousehold, joinHousehold } from '../services/householdService';
import { useHousehold } from '../contexts/HouseholdContext';

const HouseholdSetup: React.FC = () => {
  const { currentUser } = useAuth();
  const { currentHousehold, loading: householdLoading, refreshHousehold } = useHousehold();
  const navigate = useNavigate();
  const [inviteCode, setInviteCode] = useState('');
  const [householdName, setHouseholdName] = useState('');
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!householdLoading && currentHousehold) {
      navigate('/');
    }
  }, [currentHousehold, householdLoading, navigate]);

  const handleCreateHousehold = async () => {
    if (!currentUser || !householdName.trim()) {
      setError('Please enter a household name');
      return;
    }

    setError('');
    setActionLoading(true);

    try {
      await createHousehold(currentUser.uid, householdName);
      await refreshHousehold();
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to create household');
    } finally {
      setActionLoading(false);
    }
  };

  const handleJoinHousehold = async () => {
    if (!currentUser || !inviteCode.trim()) {
      setError('Please enter an invite code');
      return;
    }

    setError('');
    setActionLoading(true);

    try {
      await joinHousehold(currentUser.uid, inviteCode.trim());
      await refreshHousehold();
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to join household');
    } finally {
      setActionLoading(false);
    }
  };

  if (householdLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Paper sx={{ p: 4, width: '100%' }}>
          <Typography variant="h5" gutterBottom align="center">
            Set Up Your Home
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
            Create a new household or join an existing one
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Create New Household
            </Typography>
            <TextField
              fullWidth
              label="Household Name"
              value={householdName}
              onChange={(e) => setHouseholdName(e.target.value)}
              placeholder="e.g., Our Home"
              margin="normal"
            />
            <Button
              fullWidth
              variant="contained"
              onClick={handleCreateHousehold}
              disabled={actionLoading}
              sx={{ mt: 2 }}
            >
              Create Household
            </Button>
          </Box>

          <Box>
            <Typography variant="h6" gutterBottom>
              Join Existing Household
            </Typography>
            <TextField
              fullWidth
              label="Invite Code"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="HOME-ABC123"
              margin="normal"
            />
            <Button
              fullWidth
              variant="outlined"
              onClick={handleJoinHousehold}
              disabled={actionLoading}
              sx={{ mt: 2 }}
            >
              Join Household
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default HouseholdSetup;

