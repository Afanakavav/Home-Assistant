import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  Chip,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  Fab,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  LinearProgress,
  IconButton,
  Menu,
} from '@mui/material';
import { Add as AddIcon, TrendingUp, AccountBalance, Category as CategoryIcon, Download as DownloadIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useHousehold } from '../contexts/HouseholdContext';
import { useNotification } from '../contexts/NotificationContext';
import { useAppShortcuts } from '../hooks/useKeyboardShortcuts';
import {
  getExpenses,
  getMonthExpenses,
  calculateTotalExpenses,
  calculateExpensesByCategory,
  deleteExpense,
} from '../services/expenseService';
import ExpenseQuickAdd from '../components/ExpenseQuickAdd';
import BottomNavigation from '../components/BottomNavigation';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { exportExpensesToCSV, exportExpensesToPDF } from '../utils/exportService';
import { logger } from '../utils/logger';
import type { Expense, ExpenseCategory } from '../types';
import { format } from 'date-fns';

const categoryLabels: Record<ExpenseCategory, string> = {
  groceries: 'Groceries',
  bills: 'Bills',
  transport: 'Transport',
  home: 'Home',
  extra: 'Extra',
};

const categoryColors: Record<ExpenseCategory, string> = {
  groceries: '#6A994E',
  bills: '#E76F51',
  transport: '#FFB86C',
  home: '#85C88A',
  extra: '#A3B18A',
};

const ExpensesPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { currentHousehold } = useHousehold();
  const { showSuccess } = useNotification();
  
  // Enable keyboard shortcuts
  useAppShortcuts();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [filterCategory, setFilterCategory] = useState<ExpenseCategory | 'all'>('all');
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);

  useEffect(() => {
    loadExpenses();
  }, [currentHousehold, tabValue, filterCategory]);

  const loadExpenses = async () => {
    if (!currentHousehold) return;

    try {
      setLoading(true);
      let loadedExpenses: Expense[];

      if (tabValue === 0) {
        // This month
        loadedExpenses = await getMonthExpenses(currentHousehold.id);
      } else {
        // All time
        loadedExpenses = await getExpenses(currentHousehold.id);
      }

      // Apply category filter
      if (filterCategory !== 'all') {
        loadedExpenses = loadedExpenses.filter((e) => e.category === filterCategory);
      }

      setExpenses(loadedExpenses);
    } catch (error) {
      logger.error('Error loading expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExpenseAdded = useCallback(() => {
    loadExpenses();
    showSuccess('Expense added! 💸', '💸');
  }, []);

  const handleDeleteExpense = async (expenseId: string) => {
    if (!currentHousehold) return;
    
    if (!window.confirm('Are you sure you want to delete this expense?')) {
      return;
    }

    try {
      await deleteExpense(expenseId, currentHousehold.id);
      loadExpenses();
      showSuccess('Expense deleted! 🗑️', '🗑️');
    } catch (error) {
      logger.error('Error deleting expense:', error);
      showSuccess('Error deleting expense', '❌');
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCategoryFilterChange = (category: ExpenseCategory | 'all') => {
    setFilterCategory(category);
    // loadExpenses will be called by useEffect when filterCategory changes
  };

  if (!currentHousehold) {
    return null;
  }

  // Memoize month expenses calculation
  const monthExpenses = useMemo(() => {
    const now = new Date();
    return expenses.filter((e) => {
      const expenseDate = new Date(e.date);
      return (
        expenseDate.getMonth() === now.getMonth() &&
        expenseDate.getFullYear() === now.getFullYear()
      );
    });
  }, [expenses]);

  // Memoize total and breakdown
  const totalMonth = useMemo(() => calculateTotalExpenses(monthExpenses), [monthExpenses]);
  const categoryBreakdown = useMemo(() => calculateExpensesByCategory(monthExpenses), [monthExpenses]);

  // Memoize user balances calculation
  const userBalances = useMemo(() => {
    const balances: { [userId: string]: number } = {};
    monthExpenses.forEach((expense: Expense) => {
      // User paid this amount
      if (!balances[expense.paidBy]) {
        balances[expense.paidBy] = 0;
      }
      balances[expense.paidBy] += expense.amount;

      // Subtract what each user owes
      Object.entries(expense.splitBetween).forEach((entry: [string, unknown]) => {
        const [userId, amount] = entry;
        if (!balances[userId]) {
          balances[userId] = 0;
        }
        balances[userId] -= amount as number;
      });
    });
    return balances;
  }, [monthExpenses]);

  // Get household members info
  const members = currentHousehold.members;
  const currentUserBalance = useMemo(() => userBalances[currentUser?.uid || ''] || 0, [userBalances, currentUser]);

  // Memoize category percentages
  const categoryPercentages = useMemo(() => 
    Object.entries(categoryBreakdown).map((entry: [string, unknown]) => {
      const [category, amount] = entry;
      return {
        category: category as ExpenseCategory,
        amount: amount as number,
        percentage: totalMonth > 0 ? ((amount as number) / totalMonth) * 100 : 0,
      };
    }), [categoryBreakdown, totalMonth]);

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
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h2" sx={{ fontWeight: 600 }}>
              Expenses 💸
            </Typography>
            <IconButton
              onClick={(e) => setExportMenuAnchor(e.currentTarget)}
              sx={{ color: '#FFB86C' }}
            >
              <DownloadIcon />
            </IconButton>
          </Box>

          {/* Export Menu */}
          <Menu
            anchorEl={exportMenuAnchor}
            open={Boolean(exportMenuAnchor)}
            onClose={() => setExportMenuAnchor(null)}
          >
            <MenuItem
              onClick={() => {
                exportExpensesToCSV(expenses);
                setExportMenuAnchor(null);
                showSuccess('Expenses exported to CSV! 📊', '📊');
              }}
            >
              Export CSV
            </MenuItem>
            <MenuItem
              onClick={async () => {
                await exportExpensesToPDF(expenses);
                setExportMenuAnchor(null);
                showSuccess('Expenses exported to PDF! 📄', '📄');
              }}
            >
              Export PDF
            </MenuItem>
          </Menu>

          {/* Tabs: This Month / All Time */}
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
                <Tab label="This Month" />
                <Tab label="All" />
              </Tabs>

              {/* Total and Balance Summary */}
              <Box sx={{ mb: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Box>
                    <Typography variant="body2" sx={{ color: '#7A7A7A', mb: 0.5 }}>
                      Total {tabValue === 0 ? 'month' : 'all time'}
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 600, color: '#2C2C2C' }}>
                      €{totalMonth.toFixed(2)}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" sx={{ color: '#7A7A7A', mb: 0.5 }}>
                      Your balance
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 600,
                        color: currentUserBalance >= 0 ? '#6A994E' : '#E76F51',
                      }}
                    >
                      {currentUserBalance >= 0 ? '+' : ''}€{Math.abs(currentUserBalance).toFixed(2)}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#7A7A7A' }}>
                      {currentUserBalance >= 0 ? 'owed to you' : 'you owe'}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Category Filter */}
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel id="category-filter-label">Filter by category</InputLabel>
                <Select
                  labelId="category-filter-label"
                  value={filterCategory}
                  label="Filter by category"
                  onChange={(e) => handleCategoryFilterChange(e.target.value as ExpenseCategory | 'all')}
                  sx={{ textTransform: 'none' }}
                >
                  <MenuItem value="all">All categories</MenuItem>
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <MenuItem key={key} value={key}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          {tabValue === 0 && categoryPercentages.length > 0 && (
            <Card sx={{ mb: 3 }} className="animate-slide-in-up">
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <CategoryIcon sx={{ color: '#FFB86C' }} />
                  <Typography variant="h3" sx={{ fontWeight: 600 }}>
                    By Category
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {categoryPercentages
                    .sort((a: { category: ExpenseCategory; amount: number; percentage: number }, b: { category: ExpenseCategory; amount: number; percentage: number }) => b.amount - a.amount)
                    .map((item: { category: ExpenseCategory; amount: number; percentage: number }) => {
                      const { category, amount, percentage } = item;
                      return (
                        <Box key={category}>
                          <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Box
                                sx={{
                                  width: 12,
                                  height: 12,
                                  borderRadius: '50%',
                                  backgroundColor: categoryColors[category],
                                }}
                              />
                              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                {categoryLabels[category]}
                              </Typography>
                            </Box>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              €{amount.toFixed(2)} ({percentage.toFixed(1)}%)
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={percentage}
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: `${categoryColors[category]}20`,
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: categoryColors[category],
                                borderRadius: 4,
                              },
                            }}
                          />
                        </Box>
                      );
                    })}
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Balance Between Users */}
          {tabValue === 0 && members.length > 1 && (
            <Card sx={{ mb: 3 }} className="animate-slide-in-up" style={{ animationDelay: '0.1s' }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <AccountBalance sx={{ color: '#6A994E' }} />
                  <Typography variant="h3" sx={{ fontWeight: 600 }}>
                    Balance Between Users
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {members.map((memberId) => {
                    const balance = userBalances[memberId] || 0;
                    const isCurrentUser = memberId === currentUser?.uid;
                    const memberName = isCurrentUser
                      ? currentUser?.displayName?.split(' ')[0] || currentUser?.email?.split('@')[0] || 'You'
                      : 'Other user';

                    return (
                      <Box
                        key={memberId}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          backgroundColor: isCurrentUser ? '#FFB86C15' : '#F5F5F5',
                          border: isCurrentUser ? '1px solid #FFB86C40' : '1px solid transparent',
                        }}
                      >
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {memberName}
                          </Typography>
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 600,
                              color: balance >= 0 ? '#6A994E' : '#E76F51',
                            }}
                          >
                            {balance >= 0 ? '+' : ''}€{Math.abs(balance).toFixed(2)}
                          </Typography>
                        </Box>
                        {balance < 0 && (
                          <Typography variant="caption" sx={{ color: '#7A7A7A', mt: 0.5, display: 'block' }}>
                            Owes €{Math.abs(balance).toFixed(2)}
                          </Typography>
                        )}
                        {balance > 0 && (
                          <Typography variant="caption" sx={{ color: '#7A7A7A', mt: 0.5, display: 'block' }}>
                            Paid €{balance.toFixed(2)} more
                          </Typography>
                        )}
                        {balance === 0 && (
                          <Typography variant="caption" sx={{ color: '#7A7A7A', mt: 0.5, display: 'block' }}>
                            Balanced
                          </Typography>
                        )}
                      </Box>
                    );
                  })}
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Expenses List */}
          <Card className="animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <TrendingUp sx={{ color: '#FFB86C' }} />
                <Typography variant="h3" sx={{ fontWeight: 600 }}>
                  Expense List
                </Typography>
              </Box>
              {loading ? (
                <LoadingSkeleton variant="expense" count={5} />
              ) : expenses.length > 0 ? (
                <List sx={{ p: 0 }}>
                  {expenses.map((expense, index) => (
                    <React.Fragment key={expense.id}>
                      <ListItem
                        sx={{
                          py: 2,
                          transition: 'all 0.2s ease-out',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 184, 108, 0.05)',
                            transform: 'translateX(4px)',
                          },
                        }}
                      >
                        <ListItemText
                          primary={
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                {expense.description}
                              </Typography>
                              <Box display="flex" alignItems="center" gap={1}>
                                <Typography variant="h6" sx={{ fontWeight: 600, color: '#FFB86C' }}>
                                  €{expense.amount.toFixed(2)}
                                </Typography>
                                <IconButton
                                  size="small"
                                  onClick={() => handleDeleteExpense(expense.id)}
                                  sx={{
                                    color: '#E76F51',
                                    '&:hover': {
                                      backgroundColor: '#E76F5120',
                                    },
                                  }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            </Box>
                          }
                          secondary={
                            <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                              <Box display="flex" gap={1} alignItems="center">
                                <Chip
                                  label={categoryLabels[expense.category]}
                                  size="small"
                                  sx={{
                                    backgroundColor: `${categoryColors[expense.category]}20`,
                                    color: categoryColors[expense.category],
                                    fontWeight: 500,
                                    height: 24,
                                  }}
                                />
                                <Typography variant="caption" sx={{ color: '#7A7A7A' }}>
                                  {format(expense.date, 'PPP')}
                                </Typography>
                              </Box>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < expenses.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" sx={{ color: '#7A7A7A', mb: 2 }}>
                    No expenses yet. Add your first one! 💸
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Container>

        {/* Floating Action Button */}
        <Fab
          color="primary"
          aria-label="add expense"
          title="Add expense (Ctrl+N)"
          sx={{
            position: 'fixed',
            bottom: 88, // Above bottom navigation
            right: 16,
            zIndex: 999,
          }}
          onClick={() => setExpenseDialogOpen(true)}
        >
          <AddIcon />
        </Fab>

        {/* Expense Dialog */}
        <ExpenseQuickAdd
          open={expenseDialogOpen}
          onClose={() => setExpenseDialogOpen(false)}
          onSuccess={handleExpenseAdded}
        />
      </Box>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </>
  );
};

export default ExpensesPage;
