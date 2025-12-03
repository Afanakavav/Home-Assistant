import React, { useState, useRef } from 'react';
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
import {
  Add as AddIcon,
  Mic as MicIcon,
  Stop as StopIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useHousehold } from '../contexts/HouseholdContext';
import { useNotification } from '../contexts/NotificationContext';
import { logger } from '../utils/logger';
import { createExpense, splitExpenseEqually } from '../services/expenseService';
import { recognizeSpeech, recognizeSpeechNative, parseExpenseFromSpeech } from '../services/speechService';
import type { ExpenseCategory } from '../types';

interface ExpenseQuickAddProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const ExpenseQuickAdd: React.FC<ExpenseQuickAddProps> = ({ open, onClose, onSuccess }) => {
  const { currentUser } = useAuth();
  const { currentHousehold } = useHousehold();
  const { showSuccess } = useNotification();
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('extra');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [processingSpeech, setProcessingSpeech] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState('');
  
  // Date and time - default to today
  const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const [expenseDate, setExpenseDate] = useState<string>(getTodayDateString());
  const [expenseTime, setExpenseTime] = useState<string>('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const categories: ExpenseCategory[] = ['groceries', 'bills', 'transport', 'home', 'extra', 'eating-out'];

  const handleStartRecording = async () => {
    try {
      setError('');
      setRecording(true);
      setSpeechTranscript('');
      audioChunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        
        if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          await processAudioBlob(audioBlob);
        }
      };

      mediaRecorder.start();
    } catch (err: any) {
      setError(`Microphone access denied: ${err.message}`);
      setRecording(false);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const processAudioBlob = async (audioBlob: Blob) => {
    setProcessingSpeech(true);
    try {
      // Try Google Cloud Speech-to-Text first
      let transcript: string;
      try {
        const result = await recognizeSpeech(audioBlob);
        transcript = result.transcript;
      } catch (googleError) {
        logger.warn('Google Speech API failed, trying native:', googleError);
        // Fallback to native Web Speech API
        transcript = await recognizeSpeechNative();
      }

      setSpeechTranscript(transcript);

      // Parse expense from transcript
      const parsed = parseExpenseFromSpeech(transcript);
      if (parsed) {
        setAmount(parsed.amount.toString());
        setCategory(parsed.category as ExpenseCategory);
        setDescription(parsed.description);
      } else {
        setError('Could not parse expense from speech. Please fill manually.');
      }
    } catch (err: any) {
      setError(`Speech recognition failed: ${err.message}`);
    } finally {
      setProcessingSpeech(false);
    }
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

    if (!description.trim()) {
      setError('Please enter a description');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Split expense equally between all household members
      const splitBetween = splitExpenseEqually(amountNum, currentHousehold.members);

      // Create date with optional time
      const expenseDateTime = new Date(expenseDate);
      if (expenseTime) {
        const [hours, minutes] = expenseTime.split(':');
        expenseDateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
      } else {
        expenseDateTime.setHours(0, 0, 0, 0);
      }

      await createExpense(currentUser.uid, {
        householdId: currentHousehold.id,
        amount: amountNum,
        category,
        paidBy: currentUser.uid,
        splitBetween,
        description: description.trim(),
        date: expenseDateTime,
      });

      // Reset form
      setAmount('');
      setCategory('extra');
      setDescription('');
      setSpeechTranscript('');
      setExpenseDate(getTodayDateString());
      setExpenseTime('');

      // Show success notification with animation
      showSuccess(`Expense of €${amountNum.toFixed(2)} added! The house thanks you 🏡`, '💸');
      
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create expense');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (recording) {
      handleStopRecording();
    }
    setAmount('');
    setCategory('extra');
    setDescription('');
    setError('');
    setSpeechTranscript('');
    setExpenseDate(getTodayDateString());
    setExpenseTime('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Add Expense</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {speechTranscript && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <strong>Recognized:</strong> {speechTranscript}
            </Alert>
          )}

          <Box sx={{ mb: 2, display: 'flex', gap: 1, justifyContent: 'center' }}>
            {!recording ? (
              <Button
                variant="outlined"
                startIcon={<MicIcon />}
                onClick={handleStartRecording}
                disabled={processingSpeech}
                color="primary"
              >
                {processingSpeech ? 'Processing...' : 'Start Voice Input'}
              </Button>
            ) : (
              <Button
                variant="contained"
                startIcon={<StopIcon />}
                onClick={handleStopRecording}
                color="error"
              >
                Stop Recording
              </Button>
            )}
          </Box>

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
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Date"
            type="date"
            value={expenseDate}
            onChange={(e) => setExpenseDate(e.target.value)}
            margin="normal"
            required
            InputLabelProps={{
              shrink: true,
            }}
          />

          <TextField
            fullWidth
            label="Time (optional)"
            type="time"
            value={expenseTime}
            onChange={(e) => setExpenseTime(e.target.value)}
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
            helperText="Optional: set a specific time for this expense"
          />

          <TextField
            fullWidth
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            margin="normal"
            required
            placeholder="e.g., Groceries at supermarket"
            inputProps={{ maxLength: 200 }}
            helperText={`${description.length}/200 characters`}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading || recording}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || recording || processingSpeech}
            startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
          >
            {loading ? 'Adding...' : 'Add Expense'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ExpenseQuickAdd;

