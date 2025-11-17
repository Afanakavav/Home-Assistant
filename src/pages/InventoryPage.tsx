import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  Chip,
  Fab,
  Tabs,
  Tab,
  IconButton,
  Menu,
  MenuItem,
  Button,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  ShoppingCart as ShoppingCartIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useHousehold } from '../contexts/HouseholdContext';
import { useNotification } from '../contexts/NotificationContext';
import { logger } from '../utils/logger';
import {
  getInventoryItems,
  getLowStockItems,
  updateInventoryStatus,
  deleteInventoryItem,
  addInventoryItemToShoppingList,
} from '../services/inventoryService';
import InventoryItemAdd from '../components/InventoryItemAdd';
import BottomNavigation from '../components/BottomNavigation';
import LoadingSkeleton from '../components/LoadingSkeleton';
import type { InventoryItem, InventoryItemStatus } from '../types';

const statusLabels: Record<InventoryItemStatus, string> = {
  ok: 'OK',
  low: 'Low Stock',
  out: 'Out of Stock',
};

const statusColors: Record<InventoryItemStatus, string> = {
  ok: '#6A994E',
  low: '#FFB86C',
  out: '#E76F51',
};

const categoryLabels: Record<InventoryItem['category'], string> = {
  groceries: 'Groceries',
  cleaning: 'Cleaning',
  personal: 'Personal',
  other: 'Other',
};

const InventoryPage: React.FC = () => {
  const { currentHousehold } = useHousehold();
  const { currentUser } = useAuth();
  const { showSuccess } = useNotification();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  useEffect(() => {
    loadItems();
  }, [currentHousehold, tabValue]);

  const loadItems = async () => {
    if (!currentHousehold) return;

    try {
      setLoading(true);
      let loadedItems: InventoryItem[];

      if (tabValue === 0) {
        // All items
        loadedItems = await getInventoryItems(currentHousehold.id);
      } else if (tabValue === 1) {
        // Low stock
        loadedItems = await getLowStockItems(currentHousehold.id);
      } else {
        // By category
        const category = tabValue === 2 ? 'groceries' : tabValue === 3 ? 'cleaning' : 'personal';
        loadedItems = await getInventoryItems(currentHousehold.id, { category });
      }

      setItems(loadedItems);
    } catch (error) {
      logger.error('Error loading inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleItemAdded = () => {
    loadItems();
    showSuccess('Product added! 📦', '📦');
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, item: InventoryItem) => {
    setAnchorEl(event.currentTarget);
    setSelectedItem(item);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedItem(null);
  };

  const handleUpdateQuantity = async (newQuantity: number) => {
    if (!selectedItem) return;

    try {
      await updateInventoryStatus(selectedItem.id, newQuantity);
      showSuccess('Quantità aggiornata! ✅', '✅');
      handleMenuClose();
      await loadItems();
    } catch (error) {
      logger.error('Error updating quantity:', error);
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;

    try {
      await deleteInventoryItem(selectedItem.id);
      showSuccess('Product deleted! 🗑️', '🗑️');
      handleMenuClose();
      await loadItems();
    } catch (error) {
      logger.error('Error deleting item:', error);
    }
  };

  const handleAddToShoppingList = async (item: InventoryItem) => {
    if (!currentHousehold || !currentUser) return;

    try {
      await addInventoryItemToShoppingList(currentHousehold.id, item.name, currentUser.uid);
      showSuccess(`${item.name} added to shopping list! 🛒`, '🛒');
    } catch (error) {
      logger.error('Error adding to shopping list:', error);
    }
  };

  if (!currentHousehold) {
    return null;
  }

  // Group items by category
  const itemsByCategory: { [category: string]: InventoryItem[] } = {};
  items.forEach((item) => {
    if (!itemsByCategory[item.category]) {
      itemsByCategory[item.category] = [];
    }
    itemsByCategory[item.category].push(item);
  });

  const lowStockCount = items.filter((i) => i.status === 'low' || i.status === 'out').length;

  return (
    <>
      <Box
        sx={{
          minHeight: '100vh',
          backgroundColor: '#FFF9F3',
          pb: '80px', // Space for bottom navigation
        }}
      >
        <Container maxWidth="md" sx={{ py: 3 }}>
          <Typography variant="h2" sx={{ mb: 3, fontWeight: 600 }}>
            Inventory 📦
          </Typography>

          {/* Summary Card */}
          <Card sx={{ mb: 3 }} className="animate-slide-in-up">
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" sx={{ color: '#7A7A7A', mb: 0.5 }}>
                    Total products
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 600, color: '#2C2C2C' }}>
                    {items.length}
                  </Typography>
                </Box>
                {lowStockCount > 0 && (
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" sx={{ color: '#7A7A7A', mb: 0.5 }}>
                      In esaurimento
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 600, color: '#E76F51' }}>
                      {lowStockCount} ⚠️
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                sx={{
                  mb: 2,
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 500,
                  },
                }}
              >
                <Tab label="All" />
                <Tab label="Low Stock" />
                <Tab label="Groceries" />
                <Tab label="Cleaning" />
                <Tab label="Personal" />
              </Tabs>
            </CardContent>
          </Card>

          {/* Items List */}
          {loading ? (
            <LoadingSkeleton variant="list" count={5} />
          ) : items.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {Object.entries(itemsByCategory).map(([category, categoryItems], categoryIndex) => (
                <Card
                  key={category}
                  className="animate-slide-in-up"
                  style={{ animationDelay: `${categoryIndex * 0.1}s` }}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <InventoryIcon sx={{ color: '#FFB86C' }} />
                      <Typography variant="h3" sx={{ fontWeight: 600 }}>
                        {categoryLabels[category as InventoryItem['category']]}
                      </Typography>
                      <Chip
                        label={categoryItems.length}
                        size="small"
                        sx={{
                          backgroundColor: '#FFB86C20',
                          color: '#E89A4A',
                          fontWeight: 500,
                          ml: 'auto',
                        }}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {categoryItems.map((item) => (
                        <Card
                          key={item.id}
                          sx={{
                            p: 2,
                            border: `2px solid ${statusColors[item.status]}40`,
                            backgroundColor: item.status === 'out' ? `${statusColors[item.status]}10` : 'transparent',
                            transition: 'all 0.2s ease-out',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: `0 4px 12px ${statusColors[item.status]}30`,
                            },
                          }}
                        >
                          <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
                            <Box>
                              <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                                {item.name}
                              </Typography>
                              {item.quantity !== undefined && (
                                <Typography variant="body2" sx={{ color: '#7A7A7A' }}>
                                  {item.quantity} {item.unit || 'pcs'}
                                </Typography>
                              )}
                            </Box>
                            <IconButton
                              edge="end"
                              onClick={(e) => handleMenuOpen(e, item)}
                              size="small"
                            >
                              <MoreVertIcon />
                            </IconButton>
                          </Box>
                          <Box display="flex" gap={1} alignItems="center">
                            <Chip
                              label={statusLabels[item.status]}
                              size="small"
                              sx={{
                                backgroundColor: `${statusColors[item.status]}20`,
                                color: statusColors[item.status],
                                fontWeight: 500,
                                height: 24,
                              }}
                            />
                            {item.status === 'low' || item.status === 'out' ? (
                              <WarningIcon sx={{ color: statusColors[item.status], fontSize: 18 }} />
                            ) : null}
                            {(item.status === 'low' || item.status === 'out') && (
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={<ShoppingCartIcon />}
                                onClick={() => handleAddToShoppingList(item)}
                                sx={{
                                  textTransform: 'none',
                                  ml: 'auto',
                                  borderColor: statusColors[item.status],
                                  color: statusColors[item.status],
                                  '&:hover': {
                                    borderColor: statusColors[item.status],
                                    backgroundColor: `${statusColors[item.status]}10`,
                                  },
                                }}
                              >
                                Add to list
                              </Button>
                            )}
                          </Box>
                        </Card>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          ) : (
            <Card className="animate-fade-in">
              <CardContent>
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <InventoryIcon sx={{ fontSize: 64, color: '#7A7A7A', mb: 2, opacity: 0.5 }} />
                  <Typography variant="body1" sx={{ color: '#7A7A7A', mb: 1 }}>
                    No products in inventory.
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#7A7A7A' }}>
                    Add your first product! 📦
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          )}
        </Container>

        {/* Floating Action Button */}
        <Fab
          color="primary"
          aria-label="add item"
          sx={{
            position: 'fixed',
            bottom: 88, // Above bottom navigation
            right: 16,
            zIndex: 999,
          }}
          onClick={() => setItemDialogOpen(true)}
        >
          <AddIcon />
        </Fab>

        {/* Item Dialog */}
        <InventoryItemAdd
          open={itemDialogOpen}
          onClose={() => setItemDialogOpen(false)}
          onSuccess={handleItemAdded}
        />

        {/* Context Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => handleUpdateQuantity((selectedItem?.quantity || 0) + 1)}>
            Add 1
          </MenuItem>
          <MenuItem onClick={() => handleUpdateQuantity((selectedItem?.quantity || 0) - 1)}>
            Remove 1
          </MenuItem>
          <MenuItem onClick={handleDelete} sx={{ color: '#E76F51' }}>
            Delete
          </MenuItem>
        </Menu>
      </Box>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </>
  );
};

export default InventoryPage;

