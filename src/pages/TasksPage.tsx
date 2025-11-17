import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  Chip,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  Fab,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import {
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  Delete as DeleteIcon,
  CleaningServices as CleaningServicesIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useHousehold } from '../contexts/HouseholdContext';
import { useNotification } from '../contexts/NotificationContext';
import { logger } from '../utils/logger';
import { useAppShortcuts } from '../hooks/useKeyboardShortcuts';
import {
  getTasks,
  getTodayTasks,
  completeTask,
  uncompleteTask,
  deleteTask,
} from '../services/taskService';
import TaskQuickAdd from '../components/TaskQuickAdd';
import TaskCalendar from '../components/TaskCalendar';
import BottomNavigation from '../components/BottomNavigation';
import LoadingSkeleton from '../components/LoadingSkeleton';
import type { Task } from '../types';
import { format } from 'date-fns';

const roomLabels: Record<Task['room'], string> = {
  kitchen: 'Kitchen',
  bathroom: 'Bathroom',
  bedroom: 'Bedroom',
  living: 'Living Room',
  other: 'Other',
};

const roomEmojis: Record<Task['room'], string> = {
  kitchen: '🍳',
  bathroom: '🚿',
  bedroom: '🛏️',
  living: '🛋️',
  other: '📦',
};

const frequencyLabels: Record<Task['frequency'], string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  'one-time': 'One-time',
};

const TasksPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { currentHousehold } = useHousehold();
  const { showSuccess } = useNotification();
  
  // Enable keyboard shortcuts
  useAppShortcuts();
  const [allTasks, setAllTasks] = useState<Task[]>([]); // All tasks including completed
  const [todayTasks, setTodayTasks] = useState<Task[]>([]); // Today's tasks
  const [loading, setLoading] = useState(true);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [taskDetailDialogOpen, setTaskDetailDialogOpen] = useState(false);
  const [clickedTask, setClickedTask] = useState<Task | null>(null);

  useEffect(() => {
    loadTasks();
  }, [currentHousehold]);

  const loadTasks = async () => {
    if (!currentHousehold) return;

    try {
      setLoading(true);
      
      // Load all tasks for calendar view
      const allLoadedTasks = await getTasks(currentHousehold.id);
      setAllTasks(allLoadedTasks);

      // Load today's tasks
      const todayLoadedTasks = await getTodayTasks(currentHousehold.id);
      
      // Sort today's tasks by scheduled time (if available), then by due date, then by room
      todayLoadedTasks.sort((a, b) => {
        // First sort by scheduled time if available
        if (a.scheduledTime && b.scheduledTime) {
          return a.scheduledTime.localeCompare(b.scheduledTime);
        }
        if (a.scheduledTime) return -1;
        if (b.scheduledTime) return 1;
        
        // Then by due date
        if (a.dueDate && b.dueDate) {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        if (a.dueDate) return -1;
        if (b.dueDate) return 1;
        
        // Finally by room
        return a.room.localeCompare(b.room);
      });

      setTodayTasks(todayLoadedTasks);
    } catch (error) {
      logger.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskAdded = () => {
    loadTasks();
    showSuccess('Task added! 🧹', '✅');
  };


  const handleToggleComplete = async (task: Task) => {
    if (!currentUser) return;

    try {
      if (task.completed) {
        await uncompleteTask(task.id);
        showSuccess(`${task.title} restored! 🔄`, '🔄');
      } else {
        await completeTask(task.id, currentUser.uid);
        const message = task.requiredProducts && task.requiredProducts.length > 0
          ? `${task.title} completed! Products consumed from inventory. 🎉`
          : `${task.title} completed! Great job! 🎉`;
        showSuccess(message, '✅');
      }
      await loadTasks();
    } catch (error) {
      logger.error('Error toggling task:', error);
    }
  };

  const handleDelete = async (task: Task) => {
    try {
      await deleteTask(task.id);
      showSuccess('Task deleted! 🗑️', '🗑️');
      await loadTasks();
    } catch (error) {
      logger.error('Error deleting task:', error);
    }
  };

  const handleTaskClick = (task: Task) => {
    setClickedTask(task);
    setTaskDetailDialogOpen(true);
  };

  if (!currentHousehold) {
    return null;
  }

  const todayCount = todayTasks.filter((t) => !t.completed).length;
  const completedCount = todayTasks.filter((t) => t.completed).length;

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
            Home Tasks 🧺
          </Typography>

          {/* Summary Card */}
          <Card sx={{ mb: 3 }} className="animate-slide-in-up">
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" sx={{ color: '#7A7A7A', mb: 0.5 }}>
                    Tasks today
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 600, color: '#2C2C2C' }}>
                    {todayCount} to do
                  </Typography>
                </Box>
                {completedCount > 0 && (
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" sx={{ color: '#7A7A7A', mb: 0.5 }}>
                      Completed
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 600, color: '#6A994E' }}>
                      {completedCount} ✅
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Today's Tasks Section */}
          <Card sx={{ mb: 3 }} className="animate-slide-in-up">
            <CardContent>
              <Typography variant="body2" sx={{ color: '#7A7A7A', mb: 2, textAlign: 'center', fontStyle: 'italic' }}>
                Tasks for today
              </Typography>
              
              {loading ? (
                <LoadingSkeleton variant="list" count={3} />
              ) : todayTasks.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {Object.entries(
                    todayTasks.reduce((acc, task) => {
                      if (!acc[task.room]) acc[task.room] = [];
                      acc[task.room].push(task);
                      return acc;
                    }, {} as { [room: string]: Task[] })
                  ).map(([room, roomTasks], roomIndex) => (
                <Card
                  key={room}
                  className="animate-slide-in-up"
                  style={{ animationDelay: `${roomIndex * 0.1}s` }}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <Typography variant="h4" sx={{ fontSize: '24px' }}>
                        {roomEmojis[room as Task['room']]}
                      </Typography>
                      <Typography variant="h3" sx={{ fontWeight: 600 }}>
                        {roomLabels[room as Task['room']]}
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
                          onClick={() => handleTaskClick(task)}
                          sx={{
                            py: 1.5,
                            borderBottom: index < roomTasks.length - 1 ? '1px solid rgba(0, 0, 0, 0.05)' : 'none',
                            transition: 'all 0.2s ease-out',
                            cursor: 'pointer',
                            '&:hover': {
                              backgroundColor: 'rgba(255, 184, 108, 0.05)',
                              transform: 'translateX(4px)',
                            },
                          }}
                        >
                          <Checkbox
                            checked={task.completed}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleToggleComplete(task);
                            }}
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
                                  label={frequencyLabels[task.frequency]}
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
                          <IconButton
                            edge="end"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(task);
                            }}
                            size="small"
                            sx={{ color: '#E76F51' }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
                  ))}
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <CleaningServicesIcon sx={{ fontSize: 64, color: '#7A7A7A', mb: 2, opacity: 0.5 }} />
                  <Typography variant="body1" sx={{ color: '#7A7A7A', mb: 1 }}>
                    No tasks for today.
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#7A7A7A' }}>
                    Add your first task! 🧹
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Calendar View */}
          <TaskCalendar
            tasks={allTasks}
            onToggleComplete={handleToggleComplete}
            onDelete={(task) => handleDelete(task)}
            onTaskClick={(task) => handleTaskClick(task)}
            showCompleted={true}
          />
        </Container>

        {/* Floating Action Button */}
        <Fab
          color="primary"
          aria-label="add task"
          title="Add task (Ctrl+T)"
          sx={{
            position: 'fixed',
            bottom: 88, // Above bottom navigation
            right: 16,
            zIndex: 999,
          }}
          onClick={() => setTaskDialogOpen(true)}
        >
          <AddIcon />
        </Fab>

        {/* Task Dialog */}
        <TaskQuickAdd
          open={taskDialogOpen}
          onClose={() => setTaskDialogOpen(false)}
          onSuccess={handleTaskAdded}
        />

        {/* Task Detail Dialog */}
        <Dialog 
          open={taskDetailDialogOpen} 
          onClose={() => {
            setTaskDetailDialogOpen(false);
            setClickedTask(null);
          }}
          maxWidth="sm"
          fullWidth
        >
          {clickedTask && (
            <>
              <DialogTitle>
                <Box display="flex" alignItems="center" gap={1}>
                  <Chip
                    label={roomLabels[clickedTask.room]}
                    size="small"
                    sx={{
                      backgroundColor: clickedTask.room === 'kitchen' ? '#6A994E' : 
                                     clickedTask.room === 'bathroom' ? '#4A90E2' :
                                     clickedTask.room === 'bedroom' ? '#E76F51' :
                                     clickedTask.room === 'living' ? '#FFB86C' : '#A3B18A',
                      color: 'white',
                    }}
                  />
                  <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    {clickedTask.title}
                  </Typography>
                </Box>
              </DialogTitle>
              <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                  {clickedTask.description && (
                    <Box>
                      <Typography variant="body2" sx={{ color: '#7A7A7A', mb: 0.5 }}>
                        Description
                      </Typography>
                      <Typography variant="body1">
                        {clickedTask.description}
                      </Typography>
                    </Box>
                  )}
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" sx={{ color: '#7A7A7A' }}>
                        Frequency:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {clickedTask.frequency.charAt(0).toUpperCase() + clickedTask.frequency.slice(1)}
                      </Typography>
                    </Box>
                    
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" sx={{ color: '#7A7A7A' }}>
                        Estimated time:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {clickedTask.estimatedMinutes} min
                      </Typography>
                    </Box>
                    
                    {clickedTask.scheduledTime && (
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2" sx={{ color: '#7A7A7A' }}>
                          Scheduled time:
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: '#FFB86C' }}>
                          {clickedTask.scheduledTime}
                        </Typography>
                      </Box>
                    )}
                    
                    {clickedTask.startDate && (
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2" sx={{ color: '#7A7A7A' }}>
                          Start date:
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {format(new Date(clickedTask.startDate), 'PPP')}
                        </Typography>
                      </Box>
                    )}
                    
                    {clickedTask.dueDate && (
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2" sx={{ color: '#7A7A7A' }}>
                          Due date:
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {format(new Date(clickedTask.dueDate), 'PPP')}
                        </Typography>
                      </Box>
                    )}
                    
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" sx={{ color: '#7A7A7A' }}>
                        Status:
                      </Typography>
                      <Chip
                        label={clickedTask.completed ? 'Completed' : 'Pending'}
                        size="small"
                        sx={{
                          backgroundColor: clickedTask.completed ? '#6A994E' : '#FFB86C',
                          color: 'white',
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => {
                  setTaskDetailDialogOpen(false);
                  setClickedTask(null);
                }}>
                  Close
                </Button>
                {!clickedTask.completed && (
                  <Button
                    variant="contained"
                    startIcon={<CheckCircleIcon />}
                    onClick={() => {
                      handleToggleComplete(clickedTask);
                      setTaskDetailDialogOpen(false);
                      setClickedTask(null);
                    }}
                    sx={{
                      backgroundColor: '#6A994E',
                      '&:hover': {
                        backgroundColor: '#5a8a3e',
                      },
                    }}
                  >
                    Mark as Completed
                  </Button>
                )}
              </DialogActions>
            </>
          )}
        </Dialog>
      </Box>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </>
  );
};

export default TasksPage;
