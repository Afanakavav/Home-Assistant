import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Household } from '../types';

// Helper function to convert Firestore Timestamp or Date to Date
const toDate = (value: any): Date | undefined => {
  if (!value) return undefined;
  if (value instanceof Date) return value;
  if (value.toDate && typeof value.toDate === 'function') {
    return value.toDate();
  }
  if (typeof value === 'string' || typeof value === 'number') {
    return new Date(value);
  }
  return undefined;
};



export const getHouseholdByUser = async (userId: string): Promise<Household | null> => {
  const householdsRef = collection(db, 'households');
  
  // For custom auth users (Francesco/Martina), always get the first household
  // regardless of membership (since there's only one household)
  if (userId.startsWith('user-')) {
    const allHouseholds = await getDocs(householdsRef);
    
    if (allHouseholds.empty) {
      return null;
    }
    
    const householdDoc = allHouseholds.docs[0];
    const data = householdDoc.data();
    
    return {
      id: householdDoc.id,
      ...data,
      createdAt: toDate(data.createdAt) || new Date(),
    } as Household;
  }
  
  // For other users, try to find household where user is a member
  const q = query(householdsRef, where('members', 'array-contains', userId));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    const householdDoc = querySnapshot.docs[0];
    const data = householdDoc.data();
    return {
      id: householdDoc.id,
      ...data,
      createdAt: toDate(data.createdAt) || new Date(),
    } as Household;
  }

  return null;
};

export const getHouseholdById = async (householdId: string): Promise<Household | null> => {
  const householdRef = doc(db, 'households', householdId);
  const householdSnap = await getDoc(householdRef);

  if (!householdSnap.exists()) {
    return null;
  }

  const data = householdSnap.data();
  return {
    id: householdSnap.id,
    ...data,
    createdAt: toDate(data.createdAt) || new Date(),
  } as Household;
};


