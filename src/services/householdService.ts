import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  arrayUnion,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Household } from '../types';

// Generate invite code: HOME-XXXXXX
const generateInviteCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const code = Array.from({ length: 6 }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join('');
  return `HOME-${code}`;
};

export const createHousehold = async (
  userId: string,
  name: string
): Promise<string> => {
  const householdRef = doc(collection(db, 'households'));
  const inviteCode = generateInviteCode();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  const household: Omit<Household, 'id'> = {
    name,
    createdAt: new Date(),
    members: [userId],
    inviteCode,
    inviteExpiresAt: expiresAt,
    settings: {
      currency: 'EUR',
      timezone: 'Europe/Dublin',
    },
  };

  await setDoc(householdRef, {
    ...household,
    createdAt: serverTimestamp(),
    inviteExpiresAt: expiresAt,
  });

  // Add household to user document
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    households: arrayUnion(householdRef.id),
  });

  return householdRef.id;
};

export const joinHousehold = async (
  userId: string,
  inviteCode: string
): Promise<void> => {
  // Find household by invite code
  const householdsRef = collection(db, 'households');
  const q = query(householdsRef, where('inviteCode', '==', inviteCode.toUpperCase()));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    throw new Error('Invalid invite code');
  }

  const householdDoc = querySnapshot.docs[0];
  const householdData = householdDoc.data();

  // Check if invite expired
  if (householdData.inviteExpiresAt?.toDate() < new Date()) {
    throw new Error('Invite code has expired');
  }

  // Check if user is already a member
  if (householdData.members?.includes(userId)) {
    throw new Error('You are already a member of this household');
  }

  // Add user to household
  await updateDoc(householdDoc.ref, {
    members: arrayUnion(userId),
  });

  // Add household to user document
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    households: arrayUnion(householdDoc.id),
  });
};

export const getHouseholdByUser = async (userId: string): Promise<Household | null> => {
  const householdsRef = collection(db, 'households');
  const q = query(householdsRef, where('members', 'array-contains', userId));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return null;
  }

  const householdDoc = querySnapshot.docs[0];
  const data = householdDoc.data();
  return {
    id: householdDoc.id,
    ...data,
    createdAt: data.createdAt?.toDate() || new Date(),
    inviteExpiresAt: data.inviteExpiresAt?.toDate(),
  } as Household;
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
    createdAt: data.createdAt?.toDate() || new Date(),
    inviteExpiresAt: data.inviteExpiresAt?.toDate(),
  } as Household;
};

export const regenerateInviteCode = async (householdId: string): Promise<string> => {
  const householdRef = doc(db, 'households', householdId);
  const newInviteCode = generateInviteCode();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  await updateDoc(householdRef, {
    inviteCode: newInviteCode,
    inviteExpiresAt: expiresAt,
  });

  return newInviteCode;
};

