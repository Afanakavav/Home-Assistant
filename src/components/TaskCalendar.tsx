import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Tabs,
  Tab,
  Chip,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Alert,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon,
  CalendarToday as CalendarTodayIcon,
  ViewWeek as ViewWeekIcon,
  ViewDay as ViewDayIcon,
  List as ListIcon,
  ChevronLeft,
  ChevronRight,
} from '@mui/icons-material';
import type { Task } from '../types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, startOfWeek, endOfWeek, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays, isBefore, isAfter, isEqual, getDay, getDate, getMonth, getYear } from 'date-fns';

// Room colors
const roomColors: Record<Task['room'], string> = {
  kitchen: '#6A994E', // Green
  bathroom: '#4A90E2', // Blue
  bedroom: '#E76F51', // Red/Orange
  living: '#FFB86C', // Orange
  other: '#A3B18A', // Gray-green
};

const roomLabels: Record<Task['room'], string> = {
  kitchen: 'Kitchen',
  bathroom: 'Bathroom',
  bedroom: 'Bedroom',
  living: 'Living Room',
  other: 'Other',
};

interface TaskCalendarProps {
  tasks: Task[];
  onToggleComplete: (task: Task) => void;
  onDelete: (task: Task) => void;
  onTaskClick?: (task: Task) => void;
  showCompleted?: boolean;
}

type ViewMode = 'month' | 'week' | 'day' | 'list';

const TaskCalendar: React.FC<TaskCalendarProps> = ({
  tasks,
  onToggleComplete,
  onDelete,
  onTaskClick,
  showCompleted = true,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [notify1HourBefore, setNotify1HourBefore] = useState(true);
  const [notify1DayBefore, setNotify1DayBefore] = useState(true);
  const [taskDetailDialogOpen, setTaskDetailDialogOpen] = useState(false);
  const [clickedTask, setClickedTask] = useState<Task | null>(null);

  // Filter tasks based on showCompleted
  const filteredTasks = useMemo(() => {
    if (showCompleted) return tasks;
    return tasks.filter(t => !t.completed);
  }, [tasks, showCompleted]);

  // Get tasks for a specific date, considering frequency and endDate
  const getTasksForDate = (date: Date): Task[] => {
    return filteredTasks.filter(task => {
      // For one-time tasks, check if the date matches exactly
      if (task.frequency === 'one-time') {
        if (!task.startDate && !task.dueDate) return false;
        const taskDate = task.startDate || task.dueDate;
        if (!taskDate) return false;
        return isSameDay(new Date(taskDate), date);
      }

      // For recurring tasks, we need startDate
      if (!task.startDate) return false;

      const startDate = new Date(task.startDate);
      startDate.setHours(0, 0, 0, 0);
      const checkDate = new Date(date);
      checkDate.setHours(0, 0, 0, 0);

      // Check if date is before startDate
      if (isBefore(checkDate, startDate)) return false;

      // If task has endDate, check if date is before or equal to endDate
      if (task.endDate) {
        const endDate = new Date(task.endDate);
        endDate.setHours(23, 59, 59, 999);
        if (isAfter(checkDate, endDate)) return false;
      }

      // Check if date matches the frequency pattern
      if (task.frequency === 'daily') {
        // Every day from startDate to endDate (or forever if no endDate)
        return true;
      } else if (task.frequency === 'weekly') {
        // Same day of week as startDate, and must be a multiple of 7 days from startDate
        if (getDay(startDate) !== getDay(checkDate)) return false;
        const daysDiff = Math.floor((checkDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        return daysDiff >= 0 && daysDiff % 7 === 0;
      } else if (task.frequency === 'monthly') {
        // Same day of month as startDate, and must be in a month that is a multiple of 1 month from startDate
        if (getDate(startDate) !== getDate(checkDate)) return false;
        // Check if checkDate is in a valid month (same day, but month/year can differ)
        const monthsDiff = (checkDate.getFullYear() - startDate.getFullYear()) * 12 + 
                          (checkDate.getMonth() - startDate.getMonth());
        return monthsDiff >= 0 && monthsDiff % 1 === 0;
      }

      return false;
    });
  };

  // Month view
  const monthDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday = 1
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 }); // Monday = 1
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentDate]);

  // Week view
  const weekDays = useMemo(() => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday = 1
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 }); // Monday = 1
    return eachDayOfInterval({ start: weekStart, end: weekEnd });
  }, [currentDate]);

  // Get tasks for a specific date, sorted by scheduled time
  const getTasksForDateSorted = (date: Date): Task[] => {
    const tasks = getTasksForDate(date);
    // Sort by scheduled time (if available), then by title
    return tasks.sort((a, b) => {
      if (a.scheduledTime && b.scheduledTime) {
        return a.scheduledTime.localeCompare(b.scheduledTime);
      }
      if (a.scheduledTime) return -1;
      if (b.scheduledTime) return 1;
      return a.title.localeCompare(b.title);
    });
  };

  // Day view - just current date
  const dayTasks = useMemo(() => {
    const tasks = getTasksForDate(currentDate);
    // Sort by scheduled time (if available), then by title
    return tasks.sort((a, b) => {
      if (a.scheduledTime && b.scheduledTime) {
        return a.scheduledTime.localeCompare(b.scheduledTime);
      }
      if (a.scheduledTime) return -1;
      if (b.scheduledTime) return 1;
      return a.title.localeCompare(b.title);
    });
  }, [currentDate, filteredTasks]);


  const navigateDate = (direction: 'prev' | 'next') => {
    if (viewMode === 'month') {
      setCurrentDate(direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1));
    } else if (viewMode === 'week') {
      setCurrentDate(direction === 'prev' ? subWeeks(currentDate, 1) : addWeeks(currentDate, 1));
    } else if (viewMode === 'day') {
      setCurrentDate(direction === 'prev' ? subDays(currentDate, 1) : addDays(currentDate, 1));
    }
  };

  const renderMonthView = () => {
    const weekDaysLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    return (
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Button onClick={() => navigateDate('prev')} startIcon={<ChevronLeft />}>
            Previous
          </Button>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {format(currentDate, 'MMMM yyyy')}
          </Typography>
          <Button onClick={() => navigateDate('next')} endIcon={<ChevronRight />}>
            Next
          </Button>
        </Box>
        
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, mb: 2 }}>
          {weekDaysLabels.map(day => (
            <Typography key={day} variant="body2" sx={{ fontWeight: 600, textAlign: 'center', p: 1 }}>
              {day}
            </Typography>
          ))}
        </Box>
        
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
          {monthDays.map((day, index) => {
            const dayTasks = getTasksForDate(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isToday = isSameDay(day, new Date());
            
            return (
              <Card
                key={index}
                sx={{
                  minHeight: 100,
                  p: 1,
                  backgroundColor: isToday ? '#FFB86C20' : 'transparent',
                  border: isToday ? '2px solid #FFB86C' : '1px solid rgba(0, 0, 0, 0.1)',
                  opacity: isCurrentMonth ? 1 : 0.5,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: isToday ? 600 : 400,
                    color: isToday ? '#FFB86C' : '#2C2C2C',
                    mb: 0.5,
                  }}
                >
                  {format(day, 'd')}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  {dayTasks.slice(0, 3).map(task => (
                    <Chip
                      key={task.id}
                      label={task.title}
                      size="small"
                      onClick={() => {
                        setClickedTask(task);
                        setTaskDetailDialogOpen(true);
                        if (onTaskClick) onTaskClick(task);
                      }}
                      sx={{
                        backgroundColor: roomColors[task.room],
                        color: 'white',
                        fontSize: '0.7rem',
                        height: 20,
                        textDecoration: task.completed ? 'line-through' : 'none',
                        opacity: task.completed ? 0.6 : 1,
                        cursor: 'pointer',
                        '&:hover': {
                          opacity: task.completed ? 0.8 : 0.9,
                        },
                        '& .MuiChip-label': {
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        },
                      }}
                    />
                  ))}
                  {dayTasks.length > 3 && (
                    <Typography variant="caption" sx={{ color: '#7A7A7A' }}>
                      +{dayTasks.length - 3} more
                    </Typography>
                  )}
                </Box>
              </Card>
            );
          })}
        </Box>
      </Box>
    );
  };

  const renderWeekView = () => {
    return (
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Button onClick={() => navigateDate('prev')} startIcon={<ChevronLeft />}>
            Previous
          </Button>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {format(weekDays[0], 'MMM d')} - {format(weekDays[6], 'MMM d, yyyy')}
          </Typography>
          <Button onClick={() => navigateDate('next')} endIcon={<ChevronRight />}>
            Next
          </Button>
        </Box>
        
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
          {weekDays.map((day, index) => {
            const dayTasks = getTasksForDateSorted(day);
            const isToday = isSameDay(day, new Date());
            
            return (
              <Card key={index} sx={{ p: 2, backgroundColor: isToday ? '#FFB86C20' : 'transparent' }}>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: isToday ? 600 : 400,
                    color: isToday ? '#FFB86C' : '#2C2C2C',
                    mb: 1,
                  }}
                >
                  {format(day, 'EEE d')}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {dayTasks.map(task => (
                    <Box
                      key={task.id}
                      onClick={() => {
                        setClickedTask(task);
                        setTaskDetailDialogOpen(true);
                        if (onTaskClick) onTaskClick(task);
                      }}
                      sx={{
                        p: 1,
                        borderRadius: 1,
                        backgroundColor: `${roomColors[task.room]}20`,
                        borderLeft: `3px solid ${roomColors[task.room]}`,
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: `${roomColors[task.room]}30`,
                        },
                      }}
                    >
                      <Box display="flex" flexDirection="column" gap={0.5}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography
                            variant="body2"
                            sx={{
                              flexGrow: 1,
                              textDecoration: task.completed ? 'line-through' : 'none',
                              opacity: task.completed ? 0.6 : 1,
                              fontWeight: 500,
                            }}
                          >
                            {task.title}
                          </Typography>
                        </Box>
                        {task.scheduledTime && (
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: '#FFB86C', 
                              fontWeight: 600,
                              fontSize: '0.7rem',
                            }}
                          >
                            {task.scheduledTime}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Card>
            );
          })}
        </Box>
      </Box>
    );
  };

  const renderDayView = () => {
    return (
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Button onClick={() => navigateDate('prev')} startIcon={<ChevronLeft />}>
            Previous
          </Button>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {format(currentDate, 'EEEE, MMMM d, yyyy')}
          </Typography>
          <Button onClick={() => navigateDate('next')} endIcon={<ChevronRight />}>
            Next
          </Button>
        </Box>
        
        <List>
          {dayTasks.length > 0 ? (
            dayTasks.map(task => (
              <ListItem
                key={task.id}
                onClick={() => {
                  setClickedTask(task);
                  setTaskDetailDialogOpen(true);
                  if (onTaskClick) onTaskClick(task);
                }}
                sx={{
                  borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                  backgroundColor: `${roomColors[task.room]}10`,
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: `${roomColors[task.room]}20`,
                  },
                }}
              >
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: 500,
                          textDecoration: task.completed ? 'line-through' : 'none',
                          opacity: task.completed ? 0.6 : 1,
                        }}
                      >
                        {task.title}
                      </Typography>
                      <Chip
                        label={roomLabels[task.room]}
                        size="small"
                        sx={{
                          backgroundColor: roomColors[task.room],
                          color: 'white',
                          fontSize: '0.7rem',
                        }}
                      />
                      {task.scheduledTime && (
                        <Chip
                          label={task.scheduledTime}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.7rem' }}
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Typography variant="caption" sx={{ color: '#7A7A7A' }}>
                      {task.estimatedMinutes} min
                    </Typography>
                  }
                />
                <IconButton 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(task);
                  }} 
                  size="small"
                  sx={{ color: '#E76F51' }}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItem>
            ))
          ) : (
            <Typography variant="body2" sx={{ color: '#7A7A7A', textAlign: 'center', py: 4 }}>
              No tasks for this day
            </Typography>
          )}
        </List>
      </Box>
    );
  };

  const renderListView = () => {
    // Group tasks by date
    const tasksByDate: { [key: string]: Task[] } = {};
    filteredTasks.forEach(task => {
      const taskDate = task.startDate || task.dueDate;
      if (taskDate) {
        const dateKey = format(new Date(taskDate), 'yyyy-MM-dd');
        if (!tasksByDate[dateKey]) {
          tasksByDate[dateKey] = [];
        }
        tasksByDate[dateKey].push(task);
      }
    });

    const sortedDates = Object.keys(tasksByDate).sort();

    return (
      <Box>
        {sortedDates.length > 0 ? (
          sortedDates.map(dateKey => {
            const dateTasks = tasksByDate[dateKey];
            const date = new Date(dateKey);
            
            return (
              <Card key={dateKey} sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    {format(date, 'EEEE, MMMM d, yyyy')}
                  </Typography>
                  <List>
                    {dateTasks.map(task => (
                      <ListItem
                        key={task.id}
                        onClick={() => {
                          setClickedTask(task);
                          setTaskDetailDialogOpen(true);
                          if (onTaskClick) onTaskClick(task);
                        }}
                        sx={{
                          borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                          backgroundColor: `${roomColors[task.room]}10`,
                          cursor: 'pointer',
                          '&:hover': {
                            backgroundColor: `${roomColors[task.room]}20`,
                          },
                        }}
                      >
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography
                                variant="body1"
                                sx={{
                                  fontWeight: 500,
                                  textDecoration: task.completed ? 'line-through' : 'none',
                                  opacity: task.completed ? 0.6 : 1,
                                }}
                              >
                                {task.title}
                              </Typography>
                              <Chip
                                label={roomLabels[task.room]}
                                size="small"
                                sx={{
                                  backgroundColor: roomColors[task.room],
                                  color: 'white',
                                  fontSize: '0.7rem',
                                }}
                              />
                              {task.scheduledTime && (
                                <Chip
                                  label={task.scheduledTime}
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontSize: '0.7rem' }}
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            <Typography variant="caption" sx={{ color: '#7A7A7A' }}>
                              {task.estimatedMinutes} min
                            </Typography>
                          }
                        />
                        <IconButton 
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(task);
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
            );
          })
        ) : (
          <Typography variant="body2" sx={{ color: '#7A7A7A', textAlign: 'center', py: 4 }}>
            No tasks available
          </Typography>
        )}
      </Box>
    );
  };

  return (
    <Box>
      {/* View Mode Tabs */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Tabs
            value={viewMode}
            onChange={(_, newValue) => setViewMode(newValue)}
            sx={{ mb: 2 }}
          >
            <Tab icon={<CalendarTodayIcon />} label="Month" value="month" />
            <Tab icon={<ViewWeekIcon />} label="Week" value="week" />
            <Tab icon={<ViewDayIcon />} label="Day" value="day" />
            <Tab icon={<ListIcon />} label="List" value="list" />
          </Tabs>

          {/* Notifications Settings */}
          <Alert severity="info" sx={{ mb: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="body2">
                You will receive notifications 1 day before and 1 hour before each task
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={notificationsEnabled}
                    onChange={(e) => setNotificationsEnabled(e.target.checked)}
                  />
                }
                label="Enable"
              />
            </Box>
            {notificationsEnabled && (
              <Box sx={{ mt: 1, ml: 4 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notify1DayBefore}
                      onChange={(e) => setNotify1DayBefore(e.target.checked)}
                      disabled={!notificationsEnabled}
                    />
                  }
                  label="1 day before"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={notify1HourBefore}
                      onChange={(e) => setNotify1HourBefore(e.target.checked)}
                      disabled={!notificationsEnabled || !notify1HourBefore}
                    />
                  }
                  label="1 hour before (if time set)"
                />
              </Box>
            )}
          </Alert>
        </CardContent>
      </Card>

      {/* Calendar View */}
      <Card>
        <CardContent>
          {viewMode === 'month' && renderMonthView()}
          {viewMode === 'week' && renderWeekView()}
          {viewMode === 'day' && renderDayView()}
          {viewMode === 'list' && renderListView()}
        </CardContent>
      </Card>

      {/* Task Detail Dialog */}
      <Dialog 
        open={taskDetailDialogOpen} 
        onClose={(_event, reason) => {
          if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
            setTaskDetailDialogOpen(false);
            setClickedTask(null);
          }
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
                    backgroundColor: roomColors[clickedTask.room],
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
                    onToggleComplete(clickedTask);
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
  );
};

export default TaskCalendar;

