import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { doc, setDoc, getDoc, collection, getDocs, updateDoc, arrayUnion } from 'firebase/firestore';
import { customAuth, type CustomUser } from '../services/customAuth';
import { logger } from '../utils/logger';
import type { User } from '../types';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Create or update user document in Firestore
const createUserDocument = async (customUser: CustomUser): Promise<User> => {
  const userRef = doc(db, 'users', customUser.uid);
  const userSnap = await getDoc(userRef);

  const userData: User = {
    uid: customUser.uid,
    email: `${customUser.username.toLowerCase()}@home-assistant.local`,
    displayName: customUser.displayName,
    photoURL: undefined,
    createdAt: customUser.createdAt,
    households: customUser.households,
    settings: customUser.settings,
  };

  // Prepare Firestore document (remove undefined fields)
  const firestoreData: any = {
    uid: userData.uid,
    email: userData.email,
    displayName: userData.displayName,
    createdAt: userData.createdAt,
    households: userData.households,
    settings: userData.settings,
  };
  
  // Only include photoURL if it's defined
  if (userData.photoURL) {
    firestoreData.photoURL = userData.photoURL;
  }

  if (!userSnap.exists()) {
    // Create new user document
    await setDoc(userRef, firestoreData);
    return userData;
  } else {
    // Update existing user document
    const data = userSnap.data();
    
    // Handle createdAt - it might be a Timestamp, Date, or already a Date
    let existingCreatedAt: Date;
    if (data.createdAt) {
      if (data.createdAt.toDate && typeof data.createdAt.toDate === 'function') {
        // It's a Firestore Timestamp
        existingCreatedAt = data.createdAt.toDate();
      } else if (data.createdAt instanceof Date) {
        // It's already a Date
        existingCreatedAt = data.createdAt;
      } else {
        // It's something else, use the custom user's createdAt
        existingCreatedAt = customUser.createdAt;
      }
    } else {
      existingCreatedAt = customUser.createdAt;
    }
    
    await setDoc(userRef, {
      ...firestoreData,
      createdAt: existingCreatedAt,
    }, { merge: true });
    return {
      ...userData,
      createdAt: existingCreatedAt,
    };
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async (username: string, password: string) => {
    try {
      const customUser = await customAuth.login(username, password);
      const user = await createUserDocument(customUser);
      
      // For Francesco and Martina, automatically link to the only existing household
      let householdId: string | null = null;
      if (username === 'Francesco' || username === 'Martina') {
        try {
          householdId = await linkToOnlyHousehold(user.uid);
          // Wait a bit for Firestore to propagate
          await new Promise(resolve => setTimeout(resolve, 1500));
        } catch (error) {
          logger.error('Error linking to household:', error);
          // Continue with login even if linking fails
        }
      }
      
      // Store household ID in user object for immediate access
      if (householdId) {
        (user as any).linkedHouseholdId = householdId;
      }
      
      setCurrentUser(user);
    } catch (error) {
      logger.error('Login error:', error);
      throw error;
    }
  };
  
  // Link custom user to the only existing household
  const linkToOnlyHousehold = async (newUserId: string): Promise<string | null> => {
    try {
      // Get the first (and only) household
      const householdsRef = collection(db, 'households');
      const allHouseholds = await getDocs(householdsRef);
      
      if (allHouseholds.empty) {
        logger.error('No household found in database');
        alert('ERROR: No household found in database. Please check the console for details.');
        return null;
      }
      
      // Get the first household (should be the only one)
      const householdDoc = allHouseholds.docs[0];
      const householdId = householdDoc.id;
      const householdData = householdDoc.data();
      
      // Add user to household members if not already a member
      const currentMembers = householdData.members || [];
      if (!currentMembers.includes(newUserId)) {
        await updateDoc(householdDoc.ref, {
          members: arrayUnion(newUserId),
        });
      }
      
      // Update user document with household ID
      const newUserRef = doc(db, 'users', newUserId);
      const userSnap = await getDoc(newUserRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const userHouseholds = userData.households || [];
        
        if (!userHouseholds.includes(householdId)) {
          await updateDoc(newUserRef, {
            households: arrayUnion(householdId),
          });
        }
      }
      
      return householdId;
    } catch (error) {
      logger.error('Error in household link process:', error);
      throw error;
    }
  };

  const logout = async () => {
    customAuth.logout();
    setCurrentUser(null);
  };

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const customUser = customAuth.getCurrentUser();
      if (customUser) {
        try {
          const user = await createUserDocument(customUser);
          setCurrentUser(user);
        } catch (error) {
          console.error('Error loading user:', error);
          customAuth.logout();
        }
      }
      setLoading(false);
    };

    checkAuth();

    // Listen for storage changes (logout from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'home-assistant-auth' && !e.newValue) {
        setCurrentUser(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const value: AuthContextType = {
    currentUser,
    loading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

