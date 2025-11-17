import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  doc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { firestoreCache, getExpensesCacheKey } from '../utils/firestoreCache';
import type { Expense, ExpenseCategory } from '../types';

export interface CreateExpenseData {
  householdId: string;
  amount: number;
  category: ExpenseCategory;
  paidBy: string; // user UID
  splitBetween: { [userId: string]: number };
  description: string;
  receiptUrl?: string;
  date: Date;
}

export const createExpense = async (
  userId: string,
  expenseData: CreateExpenseData
): Promise<string> => {
  const expensesRef = collection(db, 'expenses');
  
  const expense = {
    ...expenseData,
    currency: 'EUR',
    createdBy: userId,
    createdAt: serverTimestamp(),
    reconciled: false,
    date: Timestamp.fromDate(expenseData.date),
  };

  const docRef = await addDoc(expensesRef, expense);
  
  // Invalidate cache for this household
  firestoreCache.invalidatePattern(`expenses-${expenseData.householdId}.*`);
  
  return docRef.id;
};

export const getExpenses = async (
  householdId: string,
  options?: {
    limitCount?: number;
    startDate?: Date;
    endDate?: Date;
    category?: ExpenseCategory;
  }
): Promise<Expense[]> => {
  // Check cache first
  const cacheKey = getExpensesCacheKey(householdId, options);
  const cached = firestoreCache.get<Expense[]>(cacheKey);
  if (cached) {
    return cached;
  }

  const expensesRef = collection(db, 'expenses');
  let q = query(
    expensesRef,
    where('householdId', '==', householdId),
    orderBy('date', 'desc')
  );

  if (options?.startDate) {
    q = query(q, where('date', '>=', Timestamp.fromDate(options.startDate)));
  }

  if (options?.endDate) {
    q = query(q, where('date', '<=', Timestamp.fromDate(options.endDate)));
  }

  if (options?.category) {
    q = query(q, where('category', '==', options.category));
  }

  if (options?.limitCount) {
    q = query(q, limit(options.limitCount));
  }

  const querySnapshot = await getDocs(q);
  const expenses = querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      date: data.date?.toDate() || new Date(),
      createdAt: data.createdAt?.toDate() || new Date(),
    } as Expense;
  });

  // Cache the result
  firestoreCache.set(cacheKey, expenses);
  return expenses;
};

export const getWeekExpenses = async (householdId: string): Promise<Expense[]> => {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
  startOfWeek.setHours(0, 0, 0, 0);

  return getExpenses(householdId, {
    startDate: startOfWeek,
    endDate: now,
  });
};

export const getMonthExpenses = async (householdId: string): Promise<Expense[]> => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  startOfMonth.setHours(0, 0, 0, 0);

  return getExpenses(householdId, {
    startDate: startOfMonth,
    endDate: now,
  });
};

// Calculate total expenses for a period
export const calculateTotalExpenses = (expenses: Expense[]): number => {
  return expenses.reduce((total, expense) => total + expense.amount, 0);
};

// Calculate expenses by category
export const calculateExpensesByCategory = (
  expenses: Expense[]
): { [category: string]: number } => {
  return expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as { [category: string]: number });
};

// Split expense equally between household members
export const splitExpenseEqually = (
  amount: number,
  memberIds: string[]
): { [userId: string]: number } => {
  const splitAmount = amount / memberIds.length;
  return memberIds.reduce((acc, userId) => {
    acc[userId] = splitAmount;
    return acc;
  }, {} as { [userId: string]: number });
};

// Delete an expense
export const deleteExpense = async (expenseId: string, householdId: string): Promise<void> => {
  const expenseRef = doc(db, 'expenses', expenseId);
  await deleteDoc(expenseRef);
  
  // Invalidate cache for this household
  firestoreCache.invalidatePattern(`expenses-${householdId}.*`);
};

