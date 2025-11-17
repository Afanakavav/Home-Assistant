import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  TextField,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Box,
  Typography,
  Chip,
  IconButton,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  AttachMoney as ExpenseIcon,
  CleaningServices as TaskIcon,
  Inventory as InventoryIcon,
  LocalFlorist as PlantIcon,
  Business as VendorIcon,
  ShoppingCart as ShoppingIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useHousehold } from '../contexts/HouseholdContext';
import { searchAll, type SearchResult } from '../services/searchService';
import { logger } from '../utils/logger';

interface GlobalSearchProps {
  open: boolean;
  onClose: () => void;
}

const typeIcons: Record<SearchResult['type'], React.ReactNode> = {
  expense: <ExpenseIcon sx={{ color: '#FFB86C' }} />,
  task: <TaskIcon sx={{ color: '#6A994E' }} />,
  inventory: <InventoryIcon sx={{ color: '#85C88A' }} />,
  plant: <PlantIcon sx={{ color: '#6A994E' }} />,
  vendor: <VendorIcon sx={{ color: '#E76F51' }} />,
  shopping: <ShoppingIcon sx={{ color: '#FFB86C' }} />,
};

const typeLabels: Record<SearchResult['type'], string> = {
  expense: 'Expense',
  task: 'Task',
  inventory: 'Inventory',
  plant: 'Plant',
  vendor: 'Vendor',
  shopping: 'Shopping List',
};

const GlobalSearch: React.FC<GlobalSearchProps> = ({ open, onClose }) => {
  const { currentHousehold } = useHousehold();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      // Focus input when dialog opens
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      // Clear search when dialog closes
      setQuery('');
      setResults([]);
    }
  }, [open]);

  useEffect(() => {
    if (!currentHousehold || !query.trim()) {
      setResults([]);
      return;
    }

    const searchTimeout = setTimeout(async () => {
      setLoading(true);
      try {
        const searchResults = await searchAll(currentHousehold.id, query);
        setResults(searchResults);
      } catch (error) {
        logger.error('Error searching:', error);
      } finally {
        setLoading(false);
      }
    }, 300); // Debounce 300ms

    return () => clearTimeout(searchTimeout);
  }, [query, currentHousehold]);

  const handleResultClick = (result: SearchResult) => {
    navigate(result.url);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter' && results.length > 0) {
      handleResultClick(results[0]);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          mt: 8,
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <TextField
          inputRef={inputRef}
          fullWidth
          placeholder="Search expenses, tasks, products, plants..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#7A7A7A' }} />
              </InputAdornment>
            ),
            endAdornment: query && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setQuery('')}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            },
          }}
          autoFocus
        />

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress size={24} />
          </Box>
        )}

        {!loading && query.trim() && results.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" sx={{ color: '#7A7A7A' }}>
              Nessun risultato trovato per "{query}"
            </Typography>
          </Box>
        )}

        {!loading && results.length > 0 && (
          <List sx={{ mt: 1, maxHeight: 400, overflow: 'auto' }}>
            {results.map((result) => (
              <ListItem
                key={`${result.type}-${result.id}`}
                disablePadding
                sx={{
                  mb: 0.5,
                }}
              >
                <ListItemButton
                  onClick={() => handleResultClick(result)}
                  sx={{
                    borderRadius: 2,
                    transition: 'all 0.2s ease-out',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 184, 108, 0.1)',
                      transform: 'translateX(4px)',
                    },
                  }}
                >
                  <ListItemIcon>{typeIcons[result.type]}</ListItemIcon>
                  <ListItemText
                  primary={result.title}
                  secondary={
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.5 }}>
                      <Chip
                        label={typeLabels[result.type]}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.7rem',
                          backgroundColor: '#FFB86C20',
                          color: '#E89A4A',
                        }}
                      />
                      {result.description && (
                        <Typography variant="caption" sx={{ color: '#7A7A7A' }}>
                          {result.description}
                        </Typography>
                      )}
                    </Box>
                  }
                />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}

        {!loading && !query.trim() && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" sx={{ color: '#7A7A7A', mb: 1 }}>
              Start typing to search...
            </Typography>
            <Typography variant="caption" sx={{ color: '#7A7A7A' }}>
              Search across expenses, tasks, products, plants, vendors, and shopping list
            </Typography>
          </Box>
        )}
      </Box>
    </Dialog>
  );
};

export default GlobalSearch;

