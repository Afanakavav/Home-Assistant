// Core types for Home Assistant

export type ExpenseCategory = 'groceries' | 'bills' | 'transport' | 'home' | 'extra';

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: Date;
  households: string[]; // household IDs
  settings: {
    notifications: boolean;
    defaultSplit: 'equal' | 'custom';
  };
}

export interface Household {
  id: string;
  name: string;
  createdAt: Date;
  members: string[]; // user UIDs
  inviteCode?: string;
  inviteExpiresAt?: Date;
  settings: {
    currency: string;
    timezone: string;
  };
}

export interface Expense {
  id: string;
  householdId: string;
  amount: number;
  currency: string;
  category: ExpenseCategory;
  paidBy: string; // user UID
  splitBetween: {
    [userId: string]: number; // amount owed by each user
  };
  description: string;
  receiptUrl?: string; // Firebase Storage URL
  date: Date;
  createdAt: Date;
  createdBy: string; // user UID
  reconciled: boolean;
}

export interface ShoppingListItem {
  id: string;
  name: string;
  quantity?: number;
  addedBy: string; // user UID
  addedAt: Date;
  checked: boolean;
  checkedBy?: string;
  checkedAt?: Date;
}

export interface ShoppingList {
  id: string;
  householdId: string;
  items: ShoppingListItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  householdId: string;
  title: string;
  description?: string;
  room: 'kitchen' | 'bathroom' | 'bedroom' | 'living' | 'other';
  frequency: 'daily' | 'weekly' | 'monthly' | 'one-time';
  estimatedMinutes: number;
  assignedTo?: string; // user UID (optional - rotational)
  requiredProducts?: string[]; // InventoryItem IDs
  completed: boolean;
  completedBy?: string;
  completedAt?: Date;
  dueDate?: Date;
  startDate?: Date; // Date when the task should start
  endDate?: Date; // Date when the recurring task should end (for frequency-based tasks)
  scheduledTime?: string; // Time when the task should be done (HH:mm format)
  createdAt: Date;
  createdBy: string;
}

export interface Activity {
  id: string;
  householdId: string;
  type: 'expense' | 'task' | 'shopping';
  action: 'created' | 'completed' | 'updated' | 'deleted';
  userId: string;
  entityId: string; // expense/task/shopping item ID
  timestamp: Date;
  metadata: Record<string, any>;
}

export type InventoryItemStatus = 'ok' | 'low' | 'out';

export interface InventoryItem {
  id: string;
  householdId: string;
  name: string;
  category: 'groceries' | 'cleaning' | 'personal' | 'other';
  status: InventoryItemStatus;
  quantity?: number;
  unit?: string; // 'pcs', 'kg', 'L', etc.
  minQuantity?: number; // Threshold for "low" status
  lastPurchased?: Date;
  lastUsed?: Date;
  linkedToTasks?: string[]; // Task IDs that use this item
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface RecurringExpense {
  id: string;
  householdId: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  frequency: 'monthly' | 'weekly' | 'yearly';
  dayOfMonth?: number; // 1-31 for monthly
  dayOfWeek?: number; // 0-6 for weekly (0 = Sunday)
  month?: number; // 0-11 for yearly
  nextDueDate: Date;
  lastPaidDate?: Date;
  paidBy?: string; // Default user who pays
  autoCreate: boolean; // Auto-create expense when due
  createdAt: Date;
  createdBy: string;
}

export interface Plant {
  id: string;
  householdId: string;
  name: string;
  location: string; // Position in house
  wateringFrequency: number; // Days between watering
  lastWatered?: Date;
  nextWatering?: Date;
  lightNotes?: string;
  fertilizerNotes?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface Vendor {
  id: string;
  householdId: string;
  name: string;
  type: 'utility' | 'maintenance' | 'service' | 'other';
  contactInfo: {
    phone?: string;
    email?: string;
    website?: string;
    address?: string;
  };
  contracts?: {
    startDate: Date;
    endDate?: Date;
    monthlyCost?: number;
    notes?: string;
  }[];
  maintenanceSchedule?: {
    type: string; // e.g., "Caldaia controllo"
    frequency: number; // Days
    lastService?: Date;
    nextService?: Date;
    notes?: string;
  }[];
  documents?: {
    name: string;
    url: string;
    uploadedAt: Date;
  }[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

