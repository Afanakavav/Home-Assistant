import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  query,
  where,
  updateDoc,
  doc,
  serverTimestamp,
  Timestamp,
  deleteDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { logger } from '../utils/logger';
import type { Task } from '../types';

export interface CreateTaskData {
  householdId: string;
  title: string;
  description?: string;
  room: 'kitchen' | 'bathroom' | 'bedroom' | 'living' | 'other';
  frequency: 'daily' | 'weekly' | 'monthly' | 'one-time';
  estimatedMinutes: number;
  requiredProducts?: string[];
  dueDate?: Date;
  startDate?: Date;
  endDate?: Date; // Date when the recurring task should end (for frequency-based tasks)
  scheduledTime?: string; // Time when the task should be done (HH:mm format)
}

// Helper to remove undefined values from object
const cleanUndefined = (obj: any): any => {
  const cleaned: any = {};
  for (const key in obj) {
    if (obj[key] !== undefined) {
      cleaned[key] = obj[key];
    }
  }
  return cleaned;
};

export const createTask = async (userId: string, taskData: CreateTaskData): Promise<string> => {
  const tasksRef = collection(db, 'tasks');
  
  const task = {
    ...taskData,
    createdBy: userId,
    createdAt: serverTimestamp(),
    completed: false,
    dueDate: taskData.dueDate ? Timestamp.fromDate(taskData.dueDate) : undefined,
    startDate: taskData.startDate ? Timestamp.fromDate(taskData.startDate) : undefined,
    endDate: taskData.endDate ? Timestamp.fromDate(taskData.endDate) : undefined,
  };

  // Remove undefined values before saving
  const cleanedTask = cleanUndefined(task);

  const docRef = await addDoc(tasksRef, cleanedTask);
  return docRef.id;
};

export const getTasks = async (
  householdId: string,
  options?: {
    completed?: boolean;
    room?: string;
    frequency?: string;
  }
): Promise<Task[]> => {
  const tasksRef = collection(db, 'tasks');
  
  // Build query without orderBy first to avoid index issues
  let q = query(
    tasksRef,
    where('householdId', '==', householdId)
  );

  if (options?.completed !== undefined) {
    q = query(q, where('completed', '==', options.completed));
  }

  if (options?.room) {
    q = query(q, where('room', '==', options.room));
  }

  if (options?.frequency) {
    q = query(q, where('frequency', '==', options.frequency));
  }

  const querySnapshot = await getDocs(q);
  const tasks = querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      householdId: data.householdId,
      title: data.title,
      description: data.description,
      room: data.room,
      frequency: data.frequency,
      estimatedMinutes: data.estimatedMinutes,
      completed: data.completed || false,
      completedBy: data.completedBy,
      completedAt: data.completedAt?.toDate() || undefined,
      requiredProducts: data.requiredProducts || [],
      dueDate: data.dueDate?.toDate() || undefined,
      startDate: data.startDate?.toDate() || undefined,
      endDate: data.endDate?.toDate() || undefined,
      scheduledTime: data.scheduledTime || undefined,
      createdAt: data.createdAt?.toDate() || new Date(),
      createdBy: data.createdBy,
    } as Task;
  });

  // Sort in memory: tasks with dueDate first (by date), then tasks without dueDate (by createdAt)
  tasks.sort((a, b) => {
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    // Both have no dueDate, sort by createdAt
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  return tasks;
};

export const getTodayTasks = async (householdId: string): Promise<Task[]> => {
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);

  // Get all incomplete tasks
  const allTasks = await getTasks(householdId, { completed: false });
  
  // Filter tasks that should appear today based on frequency
  return allTasks.filter((task) => {
    // For one-time tasks, check if due/start date is today
    if (task.frequency === 'one-time') {
      if (!task.dueDate && !task.startDate) return true;
      
      if (task.startDate) {
        const startDate = new Date(task.startDate);
        startDate.setHours(0, 0, 0, 0);
        if (startDate.getTime() === startOfDay.getTime()) return true;
      }
      
      if (task.dueDate) {
        const dueDate = new Date(task.dueDate);
        return dueDate >= startOfDay && dueDate <= endOfDay;
      }
      return false;
    }

    // For recurring tasks, check if today matches the frequency pattern
    if (!task.startDate) return false;

    const startDate = new Date(task.startDate);
    startDate.setHours(0, 0, 0, 0);
    const today = new Date(startOfDay);

    // Check if today is before startDate
    if (today < startDate) return false;

    // If task has endDate, check if today is before or equal to endDate
    if (task.endDate) {
      const endDate = new Date(task.endDate);
      endDate.setHours(23, 59, 59, 999);
      if (today > endDate) return false;
    }

    // Check frequency pattern
    if (task.frequency === 'daily') {
      return true; // Every day
    } else if (task.frequency === 'weekly') {
      // Same day of week, and multiple of 7 days from startDate
      if (startDate.getDay() !== today.getDay()) return false;
      const daysDiff = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff >= 0 && daysDiff % 7 === 0;
    } else if (task.frequency === 'monthly') {
      // Same day of month, and multiple of 1 month from startDate
      if (startDate.getDate() !== today.getDate()) return false;
      const monthsDiff = (today.getFullYear() - startDate.getFullYear()) * 12 + 
                        (today.getMonth() - startDate.getMonth());
      return monthsDiff >= 0 && monthsDiff % 1 === 0;
    }

    return false;
  });
};

export const getWeekTasks = async (householdId: string): Promise<Task[]> => {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  // Get all incomplete tasks
  const allTasks = await getTasks(householdId, { completed: false });
  
  // Filter tasks that should appear this week based on frequency
  return allTasks.filter((task) => {
    // For one-time tasks, check if due date is this week
    if (task.frequency === 'one-time') {
      if (!task.dueDate && !task.startDate) return true;
      const taskDate = task.startDate || task.dueDate;
      if (!taskDate) return false;
      const date = new Date(taskDate);
      return date >= startOfWeek && date <= endOfWeek;
    }

    // For recurring tasks, check if any day this week matches the frequency pattern
    if (!task.startDate) return false;

    const startDate = new Date(task.startDate);
    startDate.setHours(0, 0, 0, 0);

    // Check if task has started and hasn't ended
    if (task.endDate) {
      const endDate = new Date(task.endDate);
      endDate.setHours(23, 59, 59, 999);
      if (endDate < startOfWeek) return false; // Task ended before this week
    }
    if (startDate > endOfWeek) return false; // Task starts after this week

    // Check if any day in this week matches the frequency
    for (let day = new Date(startOfWeek); day <= endOfWeek; day.setDate(day.getDate() + 1)) {
      const checkDate = new Date(day);
      checkDate.setHours(0, 0, 0, 0);

      if (checkDate < startDate) continue; // Before start date
      if (task.endDate) {
        const endDate = new Date(task.endDate);
        endDate.setHours(23, 59, 59, 999);
        if (checkDate > endDate) continue; // After end date
      }

      if (task.frequency === 'daily') {
        return true; // At least one day matches
      } else if (task.frequency === 'weekly') {
        if (startDate.getDay() === checkDate.getDay()) {
          const daysDiff = Math.floor((checkDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
          if (daysDiff >= 0 && daysDiff % 7 === 0) return true;
        }
      } else if (task.frequency === 'monthly') {
        if (startDate.getDate() === checkDate.getDate()) {
          const monthsDiff = (checkDate.getFullYear() - startDate.getFullYear()) * 12 + 
                            (checkDate.getMonth() - startDate.getMonth());
          if (monthsDiff >= 0 && monthsDiff % 1 === 0) return true;
        }
      }
    }

    return false;
  });
};

export const completeTask = async (
  taskId: string,
  userId: string
): Promise<void> => {
  const taskRef = doc(db, 'tasks', taskId);
  const taskSnap = await getDoc(taskRef);
  
  if (!taskSnap.exists()) return;
  
  const taskData = taskSnap.data();
  
  // Update task
  await updateDoc(taskRef, {
    completed: true,
    completedBy: userId,
    completedAt: serverTimestamp(),
  });

  // Consume products from inventory if task has requiredProducts
  if (taskData.requiredProducts && Array.isArray(taskData.requiredProducts) && taskData.requiredProducts.length > 0) {
    const { updateInventoryItem } = await import('./inventoryService');
    const { doc: inventoryDoc, getDoc: getInventoryDoc } = await import('firebase/firestore');
    
    for (const productId of taskData.requiredProducts) {
      try {
        const productRef = inventoryDoc(db, 'inventory', productId);
        const productSnap = await getInventoryDoc(productRef);
        
        if (productSnap.exists()) {
          const productData = productSnap.data();
          const currentQuantity = productData.quantity || 0;
          
          if (currentQuantity > 0) {
            // Decrement quantity by 1
            const newQuantity = currentQuantity - 1;
            await updateInventoryItem(productId, {
              quantity: newQuantity,
              lastUsed: new Date(),
            });
          }
        }
      } catch (error) {
        logger.error(`Error consuming product ${productId}:`, error);
        // Continue with other products even if one fails
      }
    }
  }
};

export const uncompleteTask = async (taskId: string): Promise<void> => {
  const taskRef = doc(db, 'tasks', taskId);
  await updateDoc(taskRef, {
    completed: false,
    completedBy: undefined,
    completedAt: undefined,
  });
};

export const updateTask = async (
  taskId: string,
  updates: Partial<CreateTaskData>
): Promise<void> => {
  const taskRef = doc(db, 'tasks', taskId);
  const updateData: any = { ...updates };
  
  if (updates.dueDate) {
    updateData.dueDate = Timestamp.fromDate(updates.dueDate);
  }
  
  await updateDoc(taskRef, updateData);
};

export const deleteTask = async (taskId: string): Promise<void> => {
  const taskRef = doc(db, 'tasks', taskId);
  await deleteDoc(taskRef);
};

// Room templates for quick task creation
export const roomTemplates: {
  [key: string]: { title: string; estimatedMinutes: number; frequency: 'daily' | 'weekly' | 'monthly' }[];
} = {
  kitchen: [
    { title: 'Wash dishes', estimatedMinutes: 15, frequency: 'daily' },
    { title: 'Clean the stovetop', estimatedMinutes: 10, frequency: 'daily' },
    { title: 'Clean the fridge', estimatedMinutes: 20, frequency: 'weekly' },
    { title: 'Clean the oven', estimatedMinutes: 30, frequency: 'monthly' },
    { title: 'Empty the dishwasher', estimatedMinutes: 5, frequency: 'daily' },
  ],
  bathroom: [
    { title: 'Clean the sink', estimatedMinutes: 5, frequency: 'daily' },
    { title: 'Clean the shower/bathtub', estimatedMinutes: 15, frequency: 'weekly' },
    { title: 'Clean the toilet', estimatedMinutes: 10, frequency: 'weekly' },
    { title: 'Clean mirrors and surfaces', estimatedMinutes: 10, frequency: 'weekly' },
    { title: 'Change towels', estimatedMinutes: 5, frequency: 'weekly' },
  ],
  bedroom: [
    { title: 'Make the bed', estimatedMinutes: 5, frequency: 'daily' },
    { title: 'Organize clothes', estimatedMinutes: 15, frequency: 'weekly' },
    { title: 'Dust', estimatedMinutes: 10, frequency: 'weekly' },
    { title: 'Change bed sheets', estimatedMinutes: 15, frequency: 'weekly' },
  ],
  living: [
    { title: 'Dust', estimatedMinutes: 15, frequency: 'weekly' },
    { title: 'Vacuum', estimatedMinutes: 20, frequency: 'weekly' },
    { title: 'Organize pillows and blankets', estimatedMinutes: 5, frequency: 'daily' },
    { title: 'Clean windows', estimatedMinutes: 30, frequency: 'monthly' },
  ],
  other: [
    { title: 'Do laundry', estimatedMinutes: 30, frequency: 'weekly' },
    { title: 'Iron', estimatedMinutes: 45, frequency: 'weekly' },
    { title: 'Take out trash', estimatedMinutes: 5, frequency: 'weekly' },
    { title: 'Check bills', estimatedMinutes: 10, frequency: 'monthly' },
  ],
};

