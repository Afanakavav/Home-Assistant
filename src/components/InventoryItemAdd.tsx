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
import { createInventoryItem, criticalItems } from '../services/inventoryService';
import type { InventoryItem } from '../types';

interface InventoryItemAddProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const categoryLabels: Record<InventoryItem['category'], string> = {
  groceries: 'Groceries',
  cleaning: 'Cleaning',
  personal: 'Personal',
  other: 'Other',
};

const InventoryItemAdd: React.FC<InventoryItemAddProps> = ({ open, onClose, onSuccess }) => {
  const { currentUser } = useAuth();
  const { currentHousehold } = useHousehold();
  const [name, setName] = useState('');
  const [category, setCategory] = useState<InventoryItem['category']>('groceries');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [minQuantity, setMinQuantity] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const categories: InventoryItem['category'][] = ['groceries', 'cleaning', 'personal', 'other'];
  const predefinedItems = criticalItems.filter((item) => item.category === category);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser || !currentHousehold) {
      setError('User or household not found');
      return;
    }

    if (!name.trim()) {
      setError('Please enter an item name');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await createInventoryItem(currentUser.uid, {
        householdId: currentHousehold.id,
        name: name.trim(),
        category,
        quantity: quantity ? parseFloat(quantity) : undefined,
        unit: unit.trim() || undefined,
        minQuantity: minQuantity ? parseFloat(minQuantity) : undefined,
        status: quantity && minQuantity && parseFloat(quantity) <= parseFloat(minQuantity) ? 'low' : 'ok',
      });

      // Reset form
      setName('');
      setCategory('groceries');
      setQuantity('');
      setUnit('');
      setMinQuantity('');
      
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create inventory item');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setCategory('groceries');
    setQuantity('');
    setUnit('');
    setMinQuantity('');
    setError('');
    setLoading(false);
    onClose();
  };

  const handlePredefinedSelect = (item: typeof criticalItems[0]) => {
    setName(item.name);
    setUnit(item.unit || '');
    setMinQuantity(item.minQuantity?.toString() || '');
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Product</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
            <InputLabel id="category-label">Category</InputLabel>
            <Select
              labelId="category-label"
              id="category"
              value={category}
              label="Category"
              onChange={(e) => setCategory(e.target.value as InventoryItem['category'])}
            >
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {categoryLabels[cat]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {predefinedItems.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {predefinedItems.map((item, index) => (
                  <Button
                    key={index}
                    variant="outlined"
                    size="small"
                    onClick={() => handlePredefinedSelect(item)}
                    sx={{ textTransform: 'none' }}
                  >
                    {item.name}
                  </Button>
                ))}
              </Box>
            </Box>
          )}

          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Product name"
            type="text"
            fullWidth
            variant="outlined"
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{ mb: 2 }}
            required
          />

          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              margin="dense"
              id="quantity"
              label="Quantity"
              type="number"
              fullWidth
              variant="outlined"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
            <TextField
              margin="dense"
              id="unit"
              label="Unit"
              type="text"
              fullWidth
              variant="outlined"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="pcs, kg, L..."
            />
          </Box>

          <TextField
            margin="dense"
            id="minQuantity"
            label="Minimum quantity (threshold)"
            type="number"
            fullWidth
            variant="outlined"
            value={minQuantity}
            onChange={(e) => setMinQuantity(e.target.value)}
            helperText="When quantity drops below this value, the item will be marked as 'low stock'"
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

export default InventoryItemAdd;

