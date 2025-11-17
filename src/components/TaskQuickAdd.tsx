import React, { useState, useEffect } from 'react';
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
  Chip,
  Typography,
  Checkbox,
  ListItemText,
  OutlinedInput,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useHousehold } from '../contexts/HouseholdContext';
import { logger } from '../utils/logger';
import { createTask, roomTemplates } from '../services/taskService';
import { getInventoryItems } from '../services/inventoryService';
import type { Task, InventoryItem } from '../types';

interface TaskQuickAddProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const roomLabels: Record<Task['room'], string> = {
  kitchen: 'Kitchen',
  bathroom: 'Bathroom',
  bedroom: 'Bedroom',
  living: 'Living Room',
  other: 'Other',
};

const frequencyLabels: Record<Task['frequency'], string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  'one-time': 'One-time',
};

const TaskQuickAdd: React.FC<TaskQuickAddProps> = ({ open, onClose, onSuccess }) => {
  const { currentUser } = useAuth();
  const { currentHousehold } = useHousehold();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [room, setRoom] = useState<Task['room']>('kitchen');
  const [frequency, setFrequency] = useState<Task['frequency']>('weekly');
  const [estimatedMinutes, setEstimatedMinutes] = useState(15);
  const [assignedTo, setAssignedTo] = useState<string>('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  
  // Start date - default to today
  const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const [startDate, setStartDate] = useState<string>(getTodayDateString());
  const [scheduledTime, setScheduledTime] = useState<string>(''); // Optional time (HH:mm format)

  const rooms: Task['room'][] = ['kitchen', 'bathroom', 'bedroom', 'living', 'other'];
  const frequencies: Task['frequency'][] = ['daily', 'weekly', 'monthly', 'one-time'];
  const timeOptions = [5, 10, 15, 20, 30, 45, 60];

  useEffect(() => {
    if (currentHousehold && open) {
      loadInventoryItems();
    }
  }, [currentHousehold, open]);

  const loadInventoryItems = async () => {
    if (!currentHousehold) return;
    try {
      const items = await getInventoryItems(currentHousehold.id);
      setInventoryItems(items);
    } catch (error) {
      logger.error('Error loading inventory items:', error);
    }
  };

  const templates = roomTemplates[room] || [];

  const handleTemplateSelect = (template: typeof templates[0]) => {
    setTitle(template.title);
    setEstimatedMinutes(template.estimatedMinutes);
    setFrequency(template.frequency);
    setSelectedTemplate(template.title);
  };

  const handleRoomChange = (newRoom: Task['room']) => {
    setRoom(newRoom);
    setTitle('');
    setSelectedTemplate(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser || !currentHousehold) {
      setError('User or household not found');
      return;
    }

    if (!title.trim()) {
      setError('Please enter a task title');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Calculate due date based on frequency and start date
      let dueDate: Date | undefined;
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0); // Set to start of day
      
      if (frequency === 'daily') {
        dueDate = new Date(start);
        dueDate.setDate(start.getDate() + 1);
      } else if (frequency === 'weekly') {
        dueDate = new Date(start);
        dueDate.setDate(start.getDate() + 7);
      } else if (frequency === 'monthly') {
        dueDate = new Date(start);
        dueDate.setMonth(start.getMonth() + 1);
      } else if (frequency === 'one-time') {
        // For one-time tasks, due date is the start date
        dueDate = new Date(start);
      }

      await createTask(currentUser.uid, {
        householdId: currentHousehold.id,
        title: title.trim(),
        description: description.trim() || undefined,
        room,
        frequency,
        estimatedMinutes,
        assignedTo: assignedTo || undefined,
        requiredProducts: selectedProducts.length > 0 ? selectedProducts : undefined,
        dueDate,
        startDate: start,
        scheduledTime: scheduledTime || undefined,
      });

      // Reset form
      setTitle('');
      setDescription('');
      setRoom('kitchen');
      setFrequency('weekly');
      setEstimatedMinutes(15);
      setAssignedTo('');
      setSelectedTemplate(null);
      setSelectedProducts([]);
      setStartDate(getTodayDateString());
      setScheduledTime('');
      
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setRoom('kitchen');
    setFrequency('weekly');
    setEstimatedMinutes(15);
    setAssignedTo('');
    setError('');
    setSelectedTemplate(null);
    setSelectedProducts([]);
    setStartDate(getTodayDateString());
    setScheduledTime('');
    setLoading(false);
    onClose();
  };

  const members = currentHousehold?.members || [];

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Task</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
            <InputLabel id="room-label">Room</InputLabel>
            <Select
              labelId="room-label"
              id="room"
              value={room}
              label="Room"
              onChange={(e) => handleRoomChange(e.target.value as Task['room'])}
            >
              {rooms.map((r) => (
                <MenuItem key={r} value={r}>
                  {roomLabels[r]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Template suggestions */}
          {templates.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ color: '#7A7A7A', mb: 1 }}>
                Quick templates:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {templates.map((template, index) => (
                  <Chip
                    key={index}
                    label={template.title}
                    onClick={() => handleTemplateSelect(template)}
                    variant={selectedTemplate === template.title ? 'filled' : 'outlined'}
                    sx={{
                      backgroundColor: selectedTemplate === template.title ? '#FFB86C' : 'transparent',
                      color: selectedTemplate === template.title ? '#FFF9F3' : '#2C2C2C',
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}

          <TextField
            autoFocus
            margin="dense"
            id="title"
            label="Task Title"
            type="text"
            fullWidth
            variant="outlined"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            sx={{ mb: 2 }}
            required
          />

          <TextField
            margin="dense"
            id="description"
            label="Description (optional)"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            sx={{ mb: 2 }}
            inputProps={{ maxLength: 500 }}
            helperText={`${description.length}/500 characters`}
          />

          <TextField
            margin="dense"
            id="startDate"
            label="Start Date"
            type="date"
            fullWidth
            variant="outlined"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            sx={{ mb: 2 }}
            InputLabelProps={{
              shrink: true,
            }}
            helperText="Choose when to start this task"
          />

          <TextField
            margin="dense"
            id="scheduledTime"
            label="Scheduled Time (optional)"
            type="time"
            fullWidth
            variant="outlined"
            value={scheduledTime}
            onChange={(e) => setScheduledTime(e.target.value)}
            sx={{ mb: 2 }}
            InputLabelProps={{
              shrink: true,
            }}
            helperText="Set a specific time for this task"
          />

          <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
            <InputLabel id="frequency-label">Frequency</InputLabel>
            <Select
              labelId="frequency-label"
              id="frequency"
              value={frequency}
              label="Frequency"
              onChange={(e) => setFrequency(e.target.value as Task['frequency'])}
            >
              {frequencies.map((f) => (
                <MenuItem key={f} value={f}>
                  {frequencyLabels[f]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
            <InputLabel id="time-label">Estimated Time (minutes)</InputLabel>
            <Select
              labelId="time-label"
              id="time"
              value={estimatedMinutes}
              label="Estimated Time (minutes)"
              onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
            >
              {timeOptions.map((time) => (
                <MenuItem key={time} value={time}>
                  {time} minutes
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {members.length > 1 && (
            <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
              <InputLabel id="assigned-label">Assigned to (optional)</InputLabel>
              <Select
                labelId="assigned-label"
                id="assigned"
                value={assignedTo}
                label="Assigned to (optional)"
                onChange={(e) => setAssignedTo(e.target.value)}
              >
                <MenuItem value="">None (rotating)</MenuItem>
                {members.map((memberId) => {
                  const isCurrentUser = memberId === currentUser?.uid;
                  const memberName = isCurrentUser
                    ? currentUser?.displayName?.split(' ')[0] || currentUser?.email?.split('@')[0] || 'You'
                    : 'Other user';
                  return (
                    <MenuItem key={memberId} value={memberId}>
                      {memberName}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          )}

          {/* Product selection */}
          {inventoryItems.length > 0 && (
            <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
              <InputLabel id="products-label">Required Products (optional)</InputLabel>
              <Select
                labelId="products-label"
                id="products"
                multiple
                value={selectedProducts}
                onChange={(e) => setSelectedProducts(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                input={<OutlinedInput label="Required Products (optional)" />}
                renderValue={(selected) => {
                  const selectedItems = inventoryItems.filter((item) => selected.includes(item.id));
                  return selectedItems.map((item) => item.name).join(', ');
                }}
              >
                {inventoryItems.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    <Checkbox checked={selectedProducts.indexOf(item.id) > -1} />
                    <ListItemText primary={item.name} secondary={item.quantity !== undefined ? `${item.quantity} ${item.unit || 'pcs'}` : ''} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
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

export default TaskQuickAdd;

