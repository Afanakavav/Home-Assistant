import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useHousehold } from '../contexts/HouseholdContext';
import { createPlant } from '../services/plantService';

interface PlantAddProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const PlantAdd: React.FC<PlantAddProps> = ({ open, onClose, onSuccess }) => {
  const { currentUser } = useAuth();
  const { currentHousehold } = useHousehold();
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [wateringFrequency, setWateringFrequency] = useState(7);
  const [lightNotes, setLightNotes] = useState('');
  const [fertilizerNotes, setFertilizerNotes] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser || !currentHousehold) {
      setError('User or household not found');
      return;
    }

    if (!name.trim()) {
      setError('Please enter a plant name');
      return;
    }

    if (!location.trim()) {
      setError('Please enter a location');
      return;
    }

    if (wateringFrequency < 1) {
      setError('Watering frequency must be at least 1 day');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await createPlant(currentUser.uid, {
        householdId: currentHousehold.id,
        name: name.trim(),
        location: location.trim(),
        wateringFrequency,
        lightNotes: lightNotes.trim() || undefined,
        fertilizerNotes: fertilizerNotes.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      // Reset form
      setName('');
      setLocation('');
      setWateringFrequency(7);
      setLightNotes('');
      setFertilizerNotes('');
      setNotes('');
      
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create plant');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setLocation('');
    setWateringFrequency(7);
    setLightNotes('');
    setFertilizerNotes('');
    setNotes('');
    setError('');
    setLoading(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Plant</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Plant name"
            type="text"
            fullWidth
            variant="outlined"
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{ mb: 2 }}
            required
          />

          <TextField
            margin="dense"
            id="location"
            label="Location in home"
            type="text"
            fullWidth
            variant="outlined"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            sx={{ mb: 2 }}
            required
            placeholder="e.g., Kitchen window, Balcony..."
          />

          <TextField
            margin="dense"
            id="wateringFrequency"
            label="Watering frequency (days)"
            type="number"
            fullWidth
            variant="outlined"
            value={wateringFrequency}
            onChange={(e) => setWateringFrequency(parseInt(e.target.value) || 7)}
            sx={{ mb: 2 }}
            required
            inputProps={{ min: 1 }}
          />

          <TextField
            margin="dense"
            id="lightNotes"
            label="Light notes (optional)"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={2}
            value={lightNotes}
            onChange={(e) => setLightNotes(e.target.value)}
            sx={{ mb: 2 }}
            placeholder="e.g., Direct light, partial shade..."
          />

          <TextField
            margin="dense"
            id="fertilizerNotes"
            label="Fertilizer notes (optional)"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={2}
            value={fertilizerNotes}
            onChange={(e) => setFertilizerNotes(e.target.value)}
            sx={{ mb: 2 }}
            placeholder="e.g., Once a month in spring..."
          />

          <TextField
            margin="dense"
            id="notes"
            label="General notes (optional)"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            sx={{ mb: 2 }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary" disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="primary" disabled={loading} startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}>
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PlantAdd;

