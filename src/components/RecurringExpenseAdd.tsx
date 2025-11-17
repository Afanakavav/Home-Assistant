import React, { useState } from 'react';
import {
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
  FormControlLabel,
  Switch,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useHousehold } from '../contexts/HouseholdContext';
import { useNotification } from '../contexts/NotificationContext';
import { createRecurringExpense } from '../services/recurringExpenseService';
import type { ExpenseCategory } from '../types';

interface RecurringExpenseAddProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const RecurringExpenseAdd: React.FC<RecurringExpenseAddProps> = ({ open, onClose, onSuccess }) => {
  const { currentUser } = useAuth();
  const { currentHousehold } = useHousehold();
  const { showSuccess } = useNotification();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('bills');
  const [frequency, setFrequency] = useState<'monthly' | 'weekly' | 'yearly'>('monthly');
  const [dayOfMonth, setDayOfMonth] = useState<number>(1);
  const [dayOfWeek, setDayOfWeek] = useState<number>(1); // Monday
  const [month, setMonth] = useState<number>(0); // January
  const [autoCreate, setAutoCreate] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const calculateNextDueDate = (): Date => {
    const now = new Date();
    const nextDate = new Date();

    if (frequency === 'monthly') {
      nextDate.setDate(dayOfMonth);
      if (nextDate <= now) {
        nextDate.setMonth(nextDate.getMonth() + 1);
      }
    } else if (frequency === 'weekly') {
      const daysUntil = (dayOfWeek - now.getDay() + 7) % 7;
      nextDate.setDate(now.getDate() + (daysUntil === 0 ? 7 : daysUntil));
    } else if (frequency === 'yearly') {
      nextDate.setMonth(month);
      nextDate.setDate(dayOfMonth);
      if (nextDate <= now) {
        nextDate.setFullYear(nextDate.getFullYear() + 1);
      }
    }

    return nextDate;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser || !currentHousehold) {
      setError('User or household not found');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const nextDueDate = calculateNextDueDate();

      await createRecurringExpense(currentUser.uid, {
        householdId: currentHousehold.id,
        title: title.trim(),
        amount: amountNum,
        category,
        frequency,
        dayOfMonth: frequency === 'monthly' || frequency === 'yearly' ? dayOfMonth : undefined,
        dayOfWeek: frequency === 'weekly' ? dayOfWeek : undefined,
        month: frequency === 'yearly' ? month : undefined,
        nextDueDate,
        paidBy: currentUser.uid,
        autoCreate,
      });

      // Reset form
      setTitle('');
      setAmount('');
      setCategory('bills');
      setFrequency('monthly');
      setDayOfMonth(1);
      setDayOfWeek(1);
      setMonth(0);
      setAutoCreate(true);

      showSuccess(`Recurring expense "${title.trim()}" created! 🔄`, '🔄');
      
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create recurring expense');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setAmount('');
    setCategory('bills');
    setFrequency('monthly');
    setDayOfMonth(1);
    setDayOfWeek(1);
    setMonth(0);
    setAutoCreate(true);
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Add Recurring Expense</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            margin="normal"
            required
            placeholder="e.g., Rent, Enel Bill"
          />

          <TextField
            fullWidth
            label="Amount (€)"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            margin="normal"
            required
            inputProps={{ step: '0.01', min: '0.01' }}
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Category</InputLabel>
            <Select
              value={category}
              label="Category"
              onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
            >
              <MenuItem value="groceries">Groceries</MenuItem>
              <MenuItem value="bills">Bills</MenuItem>
              <MenuItem value="transport">Transport</MenuItem>
              <MenuItem value="home">Home</MenuItem>
              <MenuItem value="extra">Extra</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Frequency</InputLabel>
            <Select
              value={frequency}
              label="Frequency"
              onChange={(e) => setFrequency(e.target.value as 'monthly' | 'weekly' | 'yearly')}
            >
              <MenuItem value="monthly">Monthly</MenuItem>
              <MenuItem value="weekly">Weekly</MenuItem>
              <MenuItem value="yearly">Yearly</MenuItem>
            </Select>
          </FormControl>

          {frequency === 'monthly' && (
            <TextField
              fullWidth
              label="Day of month"
              type="number"
              value={dayOfMonth}
              onChange={(e) => setDayOfMonth(Math.max(1, Math.min(31, parseInt(e.target.value) || 1)))}
              margin="normal"
              required
              inputProps={{ min: 1, max: 31 }}
              helperText="Day of month when it's due (1-31)"
            />
          )}

          {frequency === 'weekly' && (
            <FormControl fullWidth margin="normal">
              <InputLabel>Day of week</InputLabel>
              <Select
                value={dayOfWeek}
                label="Day of week"
                onChange={(e) => setDayOfWeek(Number(e.target.value))}
              >
                <MenuItem value={0}>Sunday</MenuItem>
                <MenuItem value={1}>Monday</MenuItem>
                <MenuItem value={2}>Tuesday</MenuItem>
                <MenuItem value={3}>Wednesday</MenuItem>
                <MenuItem value={4}>Thursday</MenuItem>
                <MenuItem value={5}>Friday</MenuItem>
                <MenuItem value={6}>Saturday</MenuItem>
              </Select>
            </FormControl>
          )}

          {frequency === 'yearly' && (
            <>
              <FormControl fullWidth margin="normal">
                <InputLabel>Month</InputLabel>
                <Select
                  value={month}
                  label="Month"
                  onChange={(e) => setMonth(Number(e.target.value))}
                >
                  {[
                    'January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'
                  ].map((monthName, index) => (
                    <MenuItem key={index} value={index}>
                      {monthName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Day of month"
                type="number"
                value={dayOfMonth}
                onChange={(e) => setDayOfMonth(Math.max(1, Math.min(31, parseInt(e.target.value) || 1)))}
                margin="normal"
                required
                inputProps={{ min: 1, max: 31 }}
              />
            </>
          )}

          <FormControlLabel
            control={
              <Switch
                checked={autoCreate}
                onChange={(e) => setAutoCreate(e.target.checked)}
                color="primary"
              />
            }
            label="Automatically create expense when due"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
          >
            {loading ? 'Creating...' : 'Create Recurring Expense'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default RecurringExpenseAdd;

