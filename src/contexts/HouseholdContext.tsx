import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getHouseholdByUser, getHouseholdById } from '../services/householdService';
import { logger } from '../utils/logger';
import type { Household } from '../types';

interface HouseholdContextType {
  currentHousehold: Household | null;
  loading: boolean;
  refreshHousehold: () => Promise<void>;
}

const HouseholdContext = createContext<HouseholdContextType | undefined>(undefined);

export const useHousehold = () => {
  const context = useContext(HouseholdContext);
  if (!context) {
    throw new Error('useHousehold must be used within a HouseholdProvider');
  }
  return context;
};

export const HouseholdProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [currentHousehold, setCurrentHousehold] = useState<Household | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshHousehold = async (retryCount = 0) => {
    if (!currentUser) {
      setCurrentHousehold(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Try to get household by user ID
      // For custom auth users (Francesco/Martina), this will always return the first household
      let household = await getHouseholdByUser(currentUser.uid);
      
      // If we have a linked household ID from login, try that as fallback
      if (!household && (currentUser as any).linkedHouseholdId) {
        household = await getHouseholdById((currentUser as any).linkedHouseholdId);
      }
      
      if (household) {
        setCurrentHousehold(household);
        setLoading(false);
      } else {
        // Retry up to 3 times if no household found (might be still propagating)
        if (retryCount < 3 && currentUser.uid.startsWith('user-')) {
          setTimeout(() => {
            refreshHousehold(retryCount + 1);
          }, 2000);
        } else {
          setCurrentHousehold(null);
          setLoading(false);
        }
      }
    } catch (error) {
      logger.error('Error loading household:', error);
      setCurrentHousehold(null);
      // Retry on error up to 3 times
      if (retryCount < 3) {
        setTimeout(() => {
          refreshHousehold(retryCount + 1);
        }, 2000);
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (currentUser) {
      refreshHousehold();
    }
  }, [currentUser]);

  const value: HouseholdContextType = {
    currentHousehold,
    loading,
    refreshHousehold,
  };

  return (
    <HouseholdContext.Provider value={value}>
      {children}
    </HouseholdContext.Provider>
  );
};

