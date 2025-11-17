import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useHousehold } from '../contexts/HouseholdContext';
import { createVendor } from '../services/vendorService';
import type { Vendor } from '../types';

interface VendorAddProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const typeLabels: Record<Vendor['type'], string> = {
  utility: 'Utility',
  maintenance: 'Maintenance',
  service: 'Service',
  other: 'Other',
};

const VendorAdd: React.FC<VendorAddProps> = ({ open, onClose, onSuccess }) => {
  const { currentUser } = useAuth();
  const { currentHousehold } = useHousehold();
  const [name, setName] = useState('');
  const [type, setType] = useState<Vendor['type']>('utility');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const types: Vendor['type'][] = ['utility', 'maintenance', 'service', 'other'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser || !currentHousehold) {
      setError('User or household not found');
      return;
    }

    if (!name.trim()) {
      setError('Please enter a vendor name');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await createVendor(currentUser.uid, {
        householdId: currentHousehold.id,
        name: name.trim(),
        type,
        contactInfo: {
          phone: phone.trim() || undefined,
          email: email.trim() || undefined,
          website: website.trim() || undefined,
          address: address.trim() || undefined,
        },
        notes: notes.trim() || undefined,
      });

      // Reset form
      setName('');
      setType('utility');
      setPhone('');
      setEmail('');
      setWebsite('');
      setAddress('');
      setNotes('');
      
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create vendor');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setType('utility');
    setPhone('');
    setEmail('');
    setWebsite('');
    setAddress('');
    setNotes('');
    setError('');
    setLoading(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Vendor</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Vendor name"
            type="text"
            fullWidth
            variant="outlined"
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{ mb: 2 }}
            required
            placeholder="e.g., Enel, Plumber Mario..."
          />

          <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
            <InputLabel id="type-label">Type</InputLabel>
            <Select
              labelId="type-label"
              id="type"
              value={type}
              label="Type"
              onChange={(e) => setType(e.target.value as Vendor['type'])}
            >
              {types.map((t) => (
                <MenuItem key={t} value={t}>
                  {typeLabels[t]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            margin="dense"
            id="phone"
            label="Phone (optional)"
            type="tel"
            fullWidth
            variant="outlined"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            sx={{ mb: 2 }}
          />

          <TextField
            margin="dense"
            id="email"
            label="Email (optional)"
            type="email"
            fullWidth
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 2 }}
          />

          <TextField
            margin="dense"
            id="website"
            label="Website (optional)"
            type="url"
            fullWidth
            variant="outlined"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            sx={{ mb: 2 }}
          />

          <TextField
            margin="dense"
            id="address"
            label="Address (optional)"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={2}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            sx={{ mb: 2 }}
          />

          <TextField
            margin="dense"
            id="notes"
            label="Notes (optional)"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
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

export default VendorAdd;

