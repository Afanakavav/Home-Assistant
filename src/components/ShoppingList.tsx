import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Checkbox,
  Chip,
  Paper,
  Typography,
  InputAdornment,
  Autocomplete,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { useHousehold } from '../contexts/HouseholdContext';
import { useNotification } from '../contexts/NotificationContext';
import { logger } from '../utils/logger';
import {
  getShoppingList,
  addShoppingItem,
  toggleShoppingItem,
  removeShoppingItem,
  clearCheckedItems,
  getFrequentItems,
} from '../services/shoppingListService';
import type { ShoppingList as ShoppingListType } from '../types';

interface ShoppingListProps {
  maxItems?: number; // For dashboard preview
  showSuggestions?: boolean;
}

const ShoppingList: React.FC<ShoppingListProps> = ({
  maxItems,
  showSuggestions = true,
}) => {
  const { currentUser } = useAuth();
  const { currentHousehold } = useHousehold();
  const { showSuccess } = useNotification();
  const [list, setList] = useState<ShoppingListType | null>(null);
  const [newItem, setNewItem] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [frequentItems, setFrequentItems] = useState<{ name: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentHousehold) {
      loadShoppingList();
      if (showSuggestions) {
        loadSuggestions();
      }
    }
  }, [currentHousehold]);

  const loadShoppingList = async () => {
    if (!currentHousehold) return;

    try {
      setLoading(true);
      const shoppingList = await getShoppingList(currentHousehold.id);
      setList(shoppingList);
    } catch (err: any) {
      setError(err.message || 'Failed to load shopping list');
    } finally {
      setLoading(false);
    }
  };

  const loadSuggestions = async () => {
    if (!currentHousehold) return;

    try {
      const frequent = await getFrequentItems(currentHousehold.id);
      setFrequentItems(frequent);
      setSuggestions(frequent.map((item) => item.name));
    } catch (err) {
      logger.error('Error loading suggestions:', err);
    }
  };

  const handleAddItem = async () => {
    if (!currentHousehold || !currentUser || !newItem.trim()) return;

    try {
      setError('');
      await addShoppingItem(currentHousehold.id, newItem, currentUser.uid);
      showSuccess(`${newItem} added to list! 🛒`, '🛒');
      setNewItem('');
      await loadShoppingList();
    } catch (err: any) {
      setError(err.message || 'Failed to add item');
    }
  };

  const handleToggleItem = async (itemId: string) => {
    if (!currentHousehold || !currentUser) return;

    try {
      const item = list?.items.find(i => i.id === itemId);
      await toggleShoppingItem(currentHousehold.id, itemId, currentUser.uid);
      await loadShoppingList();
      
      // Show feedback based on action
      if (item && !item.checked) {
        showSuccess(`${item.name} completed! All clean for today 🧹✨`, '✅');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update item');
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    if (!currentHousehold) return;

    try {
      await removeShoppingItem(currentHousehold.id, itemId);
      await loadShoppingList();
    } catch (err: any) {
      setError(err.message || 'Failed to remove item');
    }
  };

  const handleClearChecked = async () => {
    if (!currentHousehold) return;

    try {
      const clearedCount = checkedItems.length;
      await clearCheckedItems(currentHousehold.id);
      await loadShoppingList();
      showSuccess(`${clearedCount} item${clearedCount !== 1 ? 's' : ''} removed! 🧹`, '✨');
    } catch (err: any) {
      setError(err.message || 'Failed to clear checked items');
    }
  };

  if (!currentHousehold) {
    return null;
  }

  const uncheckedItems = list?.items.filter((item) => !item.checked) || [];
  const checkedItems = list?.items.filter((item) => item.checked) || [];
  const displayItems = maxItems ? uncheckedItems.slice(0, maxItems) : uncheckedItems;
  const hasCheckedItems = checkedItems.length > 0;

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Shopping List
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Add Item Input */}
      <Box sx={{ mb: 2 }}>
        {showSuggestions && suggestions.length > 0 ? (
          <Autocomplete
            freeSolo
            options={suggestions}
            value={newItem}
            onInputChange={(_, value) => setNewItem(value)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Add item"
                placeholder="Type or select from suggestions"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddItem();
                  }
                }}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {params.InputProps.endAdornment}
                      <InputAdornment position="end">
                        <IconButton onClick={handleAddItem} edge="end">
                          <AddIcon />
                        </IconButton>
                      </InputAdornment>
                    </>
                  ),
                }}
              />
            )}
          />
        ) : (
          <TextField
            fullWidth
            label="Add item"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddItem();
              }
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleAddItem} edge="end">
                    <AddIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        )}

        {/* Frequent Items Suggestions */}
        {showSuggestions && frequentItems.length > 0 && (
          <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            <Typography variant="caption" color="text.secondary" sx={{ width: '100%' }}>
              Frequent items:
            </Typography>
            {frequentItems.slice(0, 8).map((item) => (
              <Chip
                key={item.name}
                label={item.name}
                size="small"
                onClick={() => {
                  setNewItem(item.name);
                  handleAddItem();
                }}
                variant="outlined"
              />
            ))}
          </Box>
        )}
      </Box>

      {/* Items List */}
      {loading ? (
        <Typography variant="body2" color="text.secondary">
          Loading...
        </Typography>
      ) : displayItems.length > 0 ? (
        <List>
          {displayItems.map((item, index) => (
            <ListItem 
              key={item.id} 
              divider
              className="stagger-item"
              sx={{
                animationDelay: `${index * 0.05}s`,
                transition: 'all 0.2s ease-out',
                '&:hover': {
                  backgroundColor: 'rgba(255, 184, 108, 0.05)',
                  transform: 'translateX(4px)',
                },
              }}
            >
              <Checkbox
                checked={item.checked}
                onChange={() => handleToggleItem(item.id)}
              />
              <ListItemText
                primary={item.name}
                secondary={
                  item.quantity
                    ? `Quantity: ${item.quantity}`
                    : (() => {
                        try {
                          const date = item.addedAt instanceof Date 
                            ? item.addedAt 
                            : new Date(item.addedAt);
                          return format(date, 'PPP');
                        } catch {
                          return 'Recently added';
                        }
                      })()
                }
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  onClick={() => handleRemoveItem(item.id)}
                  size="small"
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
          {maxItems && uncheckedItems.length > maxItems && (
            <Typography variant="body2" color="text.secondary" sx={{ p: 1, textAlign: 'center' }}>
              +{uncheckedItems.length - maxItems} more items
            </Typography>
          )}
        </List>
      ) : (
        <Typography variant="body2" color="text.secondary" align="center" sx={{ p: 2 }}>
          {hasCheckedItems ? 'All items checked! 🎉' : 'No items yet. Add your first item!'}
        </Typography>
      )}

      {/* Checked Items List */}
      {hasCheckedItems && !maxItems && (
        <>
          <Box sx={{ mt: 2, mb: 1 }}>
            <Typography variant="body2" sx={{ color: '#7A7A7A', mb: 1, fontWeight: 500 }}>
              Checked Items:
            </Typography>
            <List>
              {checkedItems.map((item) => (
                <ListItem 
                  key={item.id} 
                  divider
                  sx={{
                    textDecoration: 'line-through',
                    opacity: 0.6,
                    transition: 'all 0.2s ease-out',
                    '&:hover': {
                      opacity: 0.8,
                      backgroundColor: 'rgba(255, 184, 108, 0.05)',
                    },
                  }}
                >
                  <Checkbox
                    checked={item.checked}
                    onChange={() => handleToggleItem(item.id)}
                    disabled
                  />
                  <ListItemText
                    primary={item.name}
                    secondary={
                      item.quantity
                        ? `Quantity: ${item.quantity}`
                        : (() => {
                            try {
                              const date = item.addedAt instanceof Date 
                                ? item.addedAt 
                                : new Date(item.addedAt);
                              return format(date, 'PPP');
                            } catch {
                              return 'Recently added';
                            }
                          })()
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => handleRemoveItem(item.id)}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Box>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<ClearIcon />}
            onClick={handleClearChecked}
            sx={{ mt: 1 }}
          >
            Clear Checked Items ({checkedItems.length})
          </Button>
        </>
      )}
    </Paper>
  );
};

export default ShoppingList;

