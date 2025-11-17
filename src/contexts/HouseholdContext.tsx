import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getHouseholdByUser } from '../services/householdService';
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

  const refreshHousehold = async () => {
    if (!currentUser) {
      setCurrentHousehold(null);
      setLoading(false);
      return;
    }

    try {
      const household = await getHouseholdByUser(currentUser.uid);
      setCurrentHousehold(household);
    } catch (error) {
      logger.error('Error loading household:', error);
      setCurrentHousehold(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshHousehold();
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

