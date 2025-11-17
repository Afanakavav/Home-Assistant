import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

export interface UserBadgeStatus {
  userId: string;
  shownBadges: string[]; // Array of badge IDs that have been shown
  updatedAt: any;
}

/**
 * Get the list of badges that have already been shown to the user
 */
export const getShownBadges = async (userId: string): Promise<string[]> => {
  try {
    const badgeStatusRef = doc(db, 'userBadgeStatus', userId);
    const badgeStatusSnap = await getDoc(badgeStatusRef);
    
    if (badgeStatusSnap.exists()) {
      const data = badgeStatusSnap.data() as UserBadgeStatus;
      return data.shownBadges || [];
    }
    
    return [];
  } catch (error) {
    console.error('Error getting shown badges:', error);
    return [];
  }
};

/**
 * Mark a badge as shown for the user
 */
export const markBadgeAsShown = async (userId: string, badgeId: string): Promise<void> => {
  try {
    const badgeStatusRef = doc(db, 'userBadgeStatus', userId);
    const badgeStatusSnap = await getDoc(badgeStatusRef);
    
    if (badgeStatusSnap.exists()) {
      const data = badgeStatusSnap.data() as UserBadgeStatus;
      const shownBadges = data.shownBadges || [];
      
      if (!shownBadges.includes(badgeId)) {
        await setDoc(badgeStatusRef, {
          userId,
          shownBadges: [...shownBadges, badgeId],
          updatedAt: serverTimestamp(),
        }, { merge: true });
      }
    } else {
      // Create new document
      await setDoc(badgeStatusRef, {
        userId,
        shownBadges: [badgeId],
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('Error marking badge as shown:', error);
  }
};

