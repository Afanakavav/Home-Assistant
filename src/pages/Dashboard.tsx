import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Container,
  CircularProgress,
  Button,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Chip,
  Fab,
  IconButton,
  Checkbox,
} from '@mui/material';
import { CheckCircle as CheckCircleIcon, RadioButtonUnchecked as RadioButtonUncheckedIcon } from '@mui/icons-material';
import { Add as AddIcon, ShoppingCart as ShoppingCartIcon, EmojiEmotions as EmojiIcon, Search as SearchIcon, ContentCopy as ContentCopyIcon, PersonAdd as PersonAddIcon, Refresh as RefreshIcon, CleaningServices as CleaningServicesIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useHousehold } from '../contexts/HouseholdContext';
import { useAppShortcuts } from '../hooks/useKeyboardShortcuts';
import { useOffline } from '../hooks/useOffline';
import { getMonthExpenses } from '../services/expenseService';
import { regenerateInviteCode } from '../services/householdService';
import { getTodayTasks, completeTask } from '../services/taskService';
import { useNotification } from '../contexts/NotificationContext';
import ExpenseQuickAdd from '../components/ExpenseQuickAdd';
import TaskQuickAdd from '../components/TaskQuickAdd';
import ExpenseChart from '../components/ExpenseChart';
import GlobalSearch from '../components/GlobalSearch';
import ShoppingList from '../components/ShoppingList';
import BottomNavigation from '../components/BottomNavigation';
import BadgeSystem from '../components/BadgeSystem';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { getCurrentSeason, getSeasonalTheme, getSeasonalGreeting } from '../utils/seasonalTheme';
import { logger } from '../utils/logger';
import type { Expense, Task } from '../types';
import { format } from 'date-fns';

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { currentHousehold, loading, refreshHousehold } = useHousehold();
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loadingExpenses, setLoadingExpenses] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [regeneratingCode, setRegeneratingCode] = useState(false);
  
  // Enable keyboard shortcuts with search handler
  useAppShortcuts(() => setSearchDialogOpen(true));
  
  // Monitor offline status
  const { isOnline, wasOffline } = useOffline();

  useEffect(() => {
    if (!loading && !currentHousehold) {
      navigate('/household-setup');
    }
  }, [currentHousehold, loading, navigate]);

  useEffect(() => {
    const loadExpenses = async () => {
      if (!currentHousehold) return;

      try {
        setLoadingExpenses(true);
        // Load last 3 months of expenses for charts
        const monthExpenses = await getMonthExpenses(currentHousehold.id);
        setExpenses(monthExpenses);
      } catch (error) {
        logger.error('Error loading expenses:', error);
      } finally {
        setLoadingExpenses(false);
      }
    };

    const loadTasks = async () => {
      if (!currentHousehold) return;

      try {
        setLoadingTasks(true);
        const todayTasks = await getTodayTasks(currentHousehold.id);
        setTasks(todayTasks.slice(0, 3)); // Show max 3 tasks
      } catch (error) {
        logger.error('Error loading tasks:', error);
      } finally {
        setLoadingTasks(false);
      }
    };

    loadExpenses();
    loadTasks();
  }, [currentHousehold]);

  const handleExpenseAdded = useCallback(() => {
    // Reload expenses
    if (currentHousehold) {
      getMonthExpenses(currentHousehold.id).then(setExpenses);
    }
  }, [currentHousehold]);

  const handleTaskAdded = useCallback(() => {
    // Reload tasks
    if (currentHousehold) {
      getTodayTasks(currentHousehold.id).then((loadedTasks) => {
        setTasks(loadedTasks.slice(0, 3)); // Show max 3 tasks
      }).catch((error) => {
        logger.error('Error reloading tasks:', error);
      });
    }
  }, [currentHousehold]);

  const handleToggleComplete = useCallback(async (task: Task) => {
    if (!currentUser) return;

    try {
      await completeTask(task.id, currentUser.uid);
      showSuccess(`${task.title} completed! 🎉`, '✅');
      // Reload tasks
      if (currentHousehold) {
        const loadedTasks = await getTodayTasks(currentHousehold.id);
        setTasks(loadedTasks.slice(0, 3)); // Show max 3 tasks
      }
    } catch (error) {
      logger.error('Error completing task:', error);
      showError('Failed to complete task');
    }
  }, [currentUser, currentHousehold, showSuccess, showError]);

  const handleCopyInviteCode = useCallback(async () => {
    if (!currentHousehold?.inviteCode) return;
    
    try {
      await navigator.clipboard.writeText(currentHousehold.inviteCode);
      showSuccess('Invite code copied to clipboard! 📋', '✅');
    } catch (error) {
      logger.error('Error copying invite code:', error);
      showError('Failed to copy invite code');
    }
  }, [currentHousehold, showSuccess, showError]);

  const handleRegenerateInviteCode = useCallback(async () => {
    if (!currentHousehold) return;
    
    setRegeneratingCode(true);
    try {
      await regenerateInviteCode(currentHousehold.id);
      await refreshHousehold();
      showSuccess('Invite code regenerated! 🔄', '✅');
    } catch (error) {
      logger.error('Error regenerating invite code:', error);
      showError('Failed to regenerate invite code');
    } finally {
      setRegeneratingCode(false);
    }
  }, [currentHousehold, refreshHousehold, showSuccess, showError]);

  // Memoize calculations BEFORE conditional returns (React hooks rules)
  // Memoize today expenses calculation
  const todayExpenses = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return expenses
      .filter((exp) => {
        const expDate = new Date(exp.date);
        return expDate >= today && expDate < tomorrow;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses]);

  // Memoize emotional temperature (simplified - always show calm message for now)
  const temp = useMemo(() => {
    // Simplified: always show calm message
    // Future: implement real checks for tasks, inventory, bills
    return { text: 'today the house is calm', emoji: '😌' };
  }, []);

  const userName = useMemo(() => {
    return currentUser?.displayName?.split(' ')[0] || currentUser?.email?.split('@')[0] || 'Hello';
  }, [currentUser]);
  
  // Memoize greeting based on time of day
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  // Memoize seasonal theme
  const season = useMemo(() => getCurrentSeason(), []);
  const seasonalTheme = useMemo(() => getSeasonalTheme(season), [season]);
  const seasonalGreeting = useMemo(() => getSeasonalGreeting(season), [season]);

  if (loading || loadingExpenses) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: '#FFF9F3', p: 3 }}>
        <LoadingSkeleton variant="card" count={3} />
      </Box>
    );
  }

  if (!currentHousehold) {
    return null; // Will redirect
  }

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
          {/* Offline indicator */}
          {!isOnline && (
            <Box
              sx={{
                mb: 2,
                p: 1.5,
                backgroundColor: '#FFB86C20',
                border: '1px solid #FFB86C',
                borderRadius: 2,
                textAlign: 'center',
              }}
            >
              <Typography variant="body2" sx={{ color: '#E89A4A', fontWeight: 500 }}>
                📡 Offline mode - Some features may not be available
              </Typography>
            </Box>
          )}
          
          {wasOffline && isOnline && (
            <Box
              sx={{
                mb: 2,
                p: 1.5,
                backgroundColor: '#6A994E20',
                border: '1px solid #6A994E',
                borderRadius: 2,
                textAlign: 'center',
              }}
            >
              <Typography variant="body2" sx={{ color: '#6A994E', fontWeight: 500 }}>
                ✅ Connection restored
              </Typography>
            </Box>
          )}
          
          {/* Header with greeting - Centered */}
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography variant="h2" sx={{ mb: 1, fontWeight: 600 }}>
              {greeting} {userName} {temp.emoji}
            </Typography>
            <Typography variant="body1" sx={{ color: '#7A7A7A', fontSize: '16px', mb: 1 }}>
              {temp.text}
            </Typography>
            <Typography variant="body2" sx={{ color: seasonalTheme.secondary, fontSize: '14px', fontStyle: 'italic' }}>
              {seasonalGreeting} {seasonalTheme.emoji}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* 1. Thought of the Day */}
            <Card
              className="animate-fade-in"
              style={{ animationDelay: '0.1s' }}
              sx={{
                background: seasonalTheme.gradient,
                border: `1px solid ${seasonalTheme.primary}40`,
                transition: 'all 0.3s ease-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 6px 16px ${seasonalTheme.primary}30`,
                },
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <EmojiIcon sx={{ color: seasonalTheme.primary, fontSize: 20 }} />
                  <Typography variant="h6" sx={{ fontWeight: 500, color: '#2C2C2C' }}>
                    Thought of the Day {seasonalTheme.emoji}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: '#7A7A7A', fontStyle: 'italic' }}>
                  "The house thanks you when you manage it together 🏡✨"
                </Typography>
              </CardContent>
            </Card>

            {/* 2. Quick To-do */}
            <Card className="animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h3" sx={{ fontWeight: 600 }}>
                    Quick To-do
                  </Typography>
                  <IconButton
                    onClick={() => navigate('/tasks')}
                    sx={{
                      color: '#FFB86C',
                    }}
                  >
                    <CleaningServicesIcon />
                  </IconButton>
                </Box>
                {loadingTasks ? (
                  <Box display="flex" justifyContent="center" p={2}>
                    <CircularProgress size={20} />
                  </Box>
                ) : tasks.length > 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {Object.entries(
                      tasks.reduce((acc, task) => {
                        if (!acc[task.room]) acc[task.room] = [];
                        acc[task.room].push(task);
                        return acc;
                      }, {} as { [room: string]: typeof tasks })
                    ).map(([room, roomTasks], roomIndex) => (
                      <Card
                        key={room}
                        className="animate-slide-in-up"
                        style={{ animationDelay: `${roomIndex * 0.1}s` }}
                      >
                        <CardContent>
                          <Box display="flex" alignItems="center" gap={1} mb={2}>
                            <Typography variant="h4" sx={{ fontSize: '24px' }}>
                              {room === 'kitchen' ? '🍳' : room === 'bathroom' ? '🚿' : room === 'bedroom' ? '🛏️' : room === 'living' ? '🛋️' : '📦'}
                            </Typography>
                            <Typography variant="h3" sx={{ fontWeight: 600 }}>
                              {room === 'kitchen' ? 'Kitchen' : room === 'bathroom' ? 'Bathroom' : room === 'bedroom' ? 'Bedroom' : room === 'living' ? 'Living Room' : 'Other'}
                            </Typography>
                            <Chip
                              label={roomTasks.length}
                              size="small"
                              sx={{
                                backgroundColor: '#FFB86C20',
                                color: '#E89A4A',
                                fontWeight: 500,
                                ml: 'auto',
                              }}
                            />
                          </Box>
                          <List sx={{ p: 0 }}>
                            {roomTasks.map((task, index) => (
                              <ListItem
                                key={task.id}
                                sx={{
                                  py: 1.5,
                                  borderBottom: index < roomTasks.length - 1 ? '1px solid rgba(0, 0, 0, 0.05)' : 'none',
                                  transition: 'all 0.2s ease-out',
                                  '&:hover': {
                                    backgroundColor: 'rgba(255, 184, 108, 0.05)',
                                    transform: 'translateX(4px)',
                                  },
                                }}
                              >
                                <Checkbox
                                  checked={task.completed}
                                  onChange={() => handleToggleComplete(task)}
                                  icon={<RadioButtonUncheckedIcon sx={{ color: '#7A7A7A' }} />}
                                  checkedIcon={<CheckCircleIcon sx={{ color: '#6A994E' }} />}
                                  sx={{ mr: 1 }}
                                />
                                <ListItemText
                                  primary={
                                    <Typography
                                      variant="body1"
                                      sx={{
                                        fontWeight: 500,
                                        textDecoration: task.completed ? 'line-through' : 'none',
                                        color: task.completed ? '#7A7A7A' : '#2C2C2C',
                                      }}
                                    >
                                      {task.title}
                                    </Typography>
                                  }
                                  secondary={
                                    <Box display="flex" gap={1} alignItems="center" mt={0.5}>
                                      <Chip
                                        label={task.frequency === 'daily' ? 'Daily' : task.frequency === 'weekly' ? 'Weekly' : task.frequency === 'monthly' ? 'Monthly' : 'One-time'}
                                        size="small"
                                        sx={{
                                          backgroundColor: '#FFB86C20',
                                          color: '#E89A4A',
                                          fontWeight: 500,
                                          height: 20,
                                          fontSize: '0.7rem',
                                        }}
                                      />
                                      <Typography variant="caption" sx={{ color: '#7A7A7A' }}>
                                        {task.estimatedMinutes} min
                                      </Typography>
                                      {task.scheduledTime && (
                                        <Typography variant="caption" sx={{ color: '#FFB86C', fontWeight: 600 }}>
                                          • {task.scheduledTime}
                                        </Typography>
                                      )}
                                    </Box>
                                  }
                                />
                              </ListItem>
                            ))}
                          </List>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" sx={{ color: '#7A7A7A', textAlign: 'center', py: 2 }}>
                    No tasks for today! 🎉
                  </Typography>
                )}
              </CardContent>
            </Card>

            {/* 3. Pantry */}
            <Card className="animate-slide-in-up" style={{ animationDelay: '0.3s' }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h3" sx={{ fontWeight: 600 }}>
                    Pantry
                  </Typography>
                  <IconButton
                    onClick={() => navigate('/shopping-list')}
                    sx={{
                      color: '#FFB86C',
                    }}
                  >
                    <ShoppingCartIcon />
                  </IconButton>
                </Box>
                <ShoppingList maxItems={3} showSuggestions={false} />
              </CardContent>
            </Card>

            {/* 4. Expense Charts */}
            {expenses.length > 0 && (
              <ExpenseChart
                expenses={expenses}
                householdMembers={currentHousehold.members}
                currentUserId={currentUser?.uid || ''}
              />
            )}

            {/* 5. Today Expenses */}
            <Card className="animate-slide-in-up" style={{ animationDelay: '0.4s' }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h3" sx={{ fontWeight: 600 }}>
                    Today Expenses
                  </Typography>
                </Box>
                {loadingExpenses ? (
                  <Box display="flex" justifyContent="center" p={2}>
                    <CircularProgress size={24} />
                  </Box>
                ) : todayExpenses.length > 0 ? (
                  <List sx={{ p: 0 }}>
                    {todayExpenses.map((expense: Expense, index: number) => (
                      <ListItem
                        key={expense.id}
                        className="stagger-item"
                        sx={{
                          borderBottom: index < todayExpenses.length - 1 ? '1px solid rgba(0, 0, 0, 0.05)' : 'none',
                          py: 1.5,
                          animationDelay: `${index * 0.1}s`,
                          transition: 'all 0.2s ease-out',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 184, 108, 0.05)',
                            transform: 'translateX(4px)',
                          },
                        }}
                      >
                        <ListItemText
                          primary={
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {expense.description}
                            </Typography>
                          }
                          secondary={format(expense.date, 'PPP')}
                        />
                        <Box display="flex" alignItems="center" gap={1}>
                          <Chip
                            label={expense.category}
                            size="small"
                            sx={{
                              backgroundColor: '#FFB86C20',
                              color: '#E89A4A',
                              fontWeight: 500,
                            }}
                          />
                          <Typography variant="h6" sx={{ color: '#FFB86C', fontWeight: 600 }}>
                            €{expense.amount.toFixed(2)}
                          </Typography>
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 3 }}>
                    <Typography variant="body2" sx={{ color: '#7A7A7A', mb: 2 }}>
                      No expenses yet. Add your first one! 💸
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() => setExpenseDialogOpen(true)}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        borderColor: '#FFB86C',
                        color: '#FFB86C',
                      }}
                    >
                      Add Expense
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* 6. Your Badges */}
            <BadgeSystem />

            {/* 7. Invite Friends - Compact version */}
            <Card className="animate-fade-in" style={{ animationDelay: '0.5s' }} sx={{ background: seasonalTheme.gradient }}>
              <CardContent sx={{ py: 1.5 }}>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <PersonAddIcon sx={{ color: seasonalTheme.primary, fontSize: 20 }} />
                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#2C2C2C' }}>
                    Invite Friends
                  </Typography>
                </Box>
                {currentHousehold.inviteCode ? (
                  <>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        p: 1,
                        backgroundColor: 'rgba(255, 255, 255, 0.7)',
                        borderRadius: 1.5,
                        border: `1px solid ${seasonalTheme.primary}`,
                        mb: 1,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          color: seasonalTheme.primary,
                          fontFamily: 'monospace',
                          letterSpacing: 1,
                          flexGrow: 1,
                          textAlign: 'center',
                          fontSize: '0.85rem',
                        }}
                      >
                        {currentHousehold.inviteCode}
                      </Typography>
                      <IconButton
                        onClick={handleCopyInviteCode}
                        size="small"
                        sx={{
                          color: seasonalTheme.primary,
                          padding: '4px',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 184, 108, 0.2)',
                          },
                        }}
                      >
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    {currentHousehold.inviteExpiresAt && (
                      <Typography variant="caption" sx={{ color: '#7A7A7A', fontSize: '0.7rem' }}>
                        Expires: {format(currentHousehold.inviteExpiresAt, 'MMM d, yyyy')}
                      </Typography>
                    )}
                  </>
                ) : (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<RefreshIcon />}
                    onClick={handleRegenerateInviteCode}
                    disabled={regeneratingCode}
                    fullWidth
                    sx={{
                      borderColor: seasonalTheme.primary,
                      color: seasonalTheme.primary,
                      textTransform: 'none',
                      fontSize: '0.75rem',
                      py: 0.5,
                      '&:hover': {
                        borderColor: seasonalTheme.primary,
                        backgroundColor: 'rgba(255, 184, 108, 0.1)',
                      },
                    }}
                  >
                    {regeneratingCode ? 'Generating...' : 'Generate Code'}
                  </Button>
                )}
              </CardContent>
            </Card>
          </Box>
        </Container>

        {/* Floating Action Buttons */}
        <Fab
          color="primary"
          aria-label="search"
          sx={{
            position: 'fixed',
            bottom: 88, // Above bottom navigation
            right: 80,
            zIndex: 999,
          }}
          onClick={() => setSearchDialogOpen(true)}
        >
          <SearchIcon />
        </Fab>
        <Fab
          color="primary"
          aria-label="add expense"
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

        <TaskQuickAdd
          open={taskDialogOpen}
          onClose={() => setTaskDialogOpen(false)}
          onSuccess={handleTaskAdded}
        />

        {/* Global Search Dialog */}
        <GlobalSearch
          open={searchDialogOpen}
          onClose={() => setSearchDialogOpen(false)}
        />
      </Box>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </>
  );
};

export default Dashboard;

