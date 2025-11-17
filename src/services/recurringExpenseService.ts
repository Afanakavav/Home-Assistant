import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  updateDoc,
  doc,
  serverTimestamp,
  Timestamp,
  deleteDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import type { RecurringExpense } from '../types';
import { createExpense, splitExpenseEqually } from './expenseService';
import { getHouseholdById } from './householdService';

export interface CreateRecurringExpenseData {
  householdId: string;
  title: string;
  amount: number;
  category: 'groceries' | 'bills' | 'transport' | 'home' | 'extra';
  frequency: 'monthly' | 'weekly' | 'yearly';
  dayOfMonth?: number;
  dayOfWeek?: number;
  month?: number;
  nextDueDate: Date;
  paidBy?: string;
  autoCreate: boolean;
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

export const createRecurringExpense = async (
  userId: string,
  expenseData: CreateRecurringExpenseData
): Promise<string> => {
  const recurringRef = collection(db, 'recurringExpenses');
  
  const expense = {
    ...expenseData,
    nextDueDate: Timestamp.fromDate(expenseData.nextDueDate),
    lastPaidDate: undefined,
    createdAt: serverTimestamp(),
    createdBy: userId,
  };

  // Remove undefined values before saving
  const cleanedExpense = cleanUndefined(expense);

  const docRef = await addDoc(recurringRef, cleanedExpense);
  return docRef.id;
};

export const getRecurringExpenses = async (householdId: string): Promise<RecurringExpense[]> => {
  const recurringRef = collection(db, 'recurringExpenses');
  const q = query(
    recurringRef,
    where('householdId', '==', householdId),
    orderBy('nextDueDate', 'asc')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      householdId: data.householdId,
      title: data.title,
      amount: data.amount,
      category: data.category,
      frequency: data.frequency,
      dayOfMonth: data.dayOfMonth,
      dayOfWeek: data.dayOfWeek,
      month: data.month,
      nextDueDate: data.nextDueDate?.toDate() || new Date(),
      lastPaidDate: data.lastPaidDate?.toDate() || undefined,
      paidBy: data.paidBy,
      autoCreate: data.autoCreate || false,
      createdAt: data.createdAt?.toDate() || new Date(),
      createdBy: data.createdBy,
    } as RecurringExpense;
  });
};

export const getUpcomingRecurringExpenses = async (
  householdId: string,
  daysAhead: number = 30
): Promise<RecurringExpense[]> => {
  const allExpenses = await getRecurringExpenses(householdId);
  const now = new Date();
  const futureDate = new Date(now);
  futureDate.setDate(now.getDate() + daysAhead);

  return allExpenses.filter((expense) => {
    const dueDate = new Date(expense.nextDueDate);
    return dueDate >= now && dueDate <= futureDate;
  });
};

export const markRecurringExpensePaid = async (
  recurringExpenseId: string,
  userId: string
): Promise<void> => {
  const expenseRef = doc(db, 'recurringExpenses', recurringExpenseId);
  const expenseSnap = await getDoc(expenseRef);
  
  if (!expenseSnap.exists()) return;
  
  const expenseData = expenseSnap.data() as RecurringExpense;
  const now = new Date();
  
  // Calculate next due date
  let nextDueDate = new Date(expenseData.nextDueDate);
  
  if (expenseData.frequency === 'monthly') {
    nextDueDate.setMonth(nextDueDate.getMonth() + 1);
  } else if (expenseData.frequency === 'weekly') {
    nextDueDate.setDate(nextDueDate.getDate() + 7);
  } else if (expenseData.frequency === 'yearly') {
    nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
  }
  
  // Auto-create expense if enabled
  if (expenseData.autoCreate) {
    const household = await getHouseholdById(expenseData.householdId);
    if (household) {
      await createExpense(userId, {
        householdId: expenseData.householdId,
        amount: expenseData.amount,
        category: expenseData.category,
        paidBy: expenseData.paidBy || userId,
        splitBetween: splitExpenseEqually(expenseData.amount, household.members),
        description: expenseData.title,
        date: now,
      });
    }
  }
  
  await updateDoc(expenseRef, {
    lastPaidDate: Timestamp.fromDate(now),
    nextDueDate: Timestamp.fromDate(nextDueDate),
  });
};

export const updateRecurringExpense = async (
  expenseId: string,
  updates: Partial<CreateRecurringExpenseData & { nextDueDate?: Date }>
): Promise<void> => {
  const expenseRef = doc(db, 'recurringExpenses', expenseId);
  const updateData: any = { ...updates };
  
  if (updates.nextDueDate) {
    updateData.nextDueDate = Timestamp.fromDate(updates.nextDueDate);
  }
  
  await updateDoc(expenseRef, updateData);
};

export const deleteRecurringExpense = async (expenseId: string): Promise<void> => {
  const expenseRef = doc(db, 'recurringExpenses', expenseId);
  await deleteDoc(expenseRef);
};

