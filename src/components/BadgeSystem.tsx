import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Card, CardContent, Chip, Grow, Fade } from '@mui/material';
import { EmojiEvents } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useHousehold } from '../contexts/HouseholdContext';
import { useNotification } from '../contexts/NotificationContext';
import { getWeekExpenses } from '../services/expenseService';
import { getShoppingList } from '../services/shoppingListService';
import { getShownBadges, markBadgeAsShown } from '../services/badgeService';
import { logger } from '../utils/logger';

export interface Badge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  condition: () => Promise<boolean> | boolean;
  unlocked: boolean;
  unlockedAt?: Date;
}

const BadgeSystem: React.FC = () => {
  const { currentUser } = useAuth();
  const { currentHousehold } = useHousehold();
  const { showSuccess } = useNotification();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [newBadge, setNewBadge] = useState<Badge | null>(null);
  const [showBadges, setShowBadges] = useState(false);
  const shownBadgesRef = useRef<Set<string>>(new Set()); // Track badges that have already been shown
  const isCheckingRef = useRef(false); // Prevent concurrent checks
  const [loadedShownBadges, setLoadedShownBadges] = useState(false);

  // Define badges with real conditions
  const availableBadges: Omit<Badge, 'unlocked' | 'unlockedAt'>[] = [
    {
      id: 'first-expense',
      name: 'First Expense',
      description: 'You recorded your first expense',
      emoji: '💸',
      condition: async () => {
        if (!currentHousehold) return false;
        try {
          const expenses = await getWeekExpenses(currentHousehold.id);
          return expenses.length >= 1;
        } catch {
          return false;
        }
      },
    },
    {
      id: 'shopping-hero',
      name: 'Shopping Hero',
      description: 'You completed the shopping list',
      emoji: '💪',
      condition: async () => {
        if (!currentHousehold) return false;
        try {
          const list = await getShoppingList(currentHousehold.id);
          if (!list || !list.items || list.items.length === 0) return false;
          const allChecked = list.items.every(item => item.checked);
          return allChecked;
        } catch {
          return false;
        }
      },
    },
    {
      id: 'expense-tracker',
      name: 'Expense Tracker',
      description: '10 expenses recorded',
      emoji: '📊',
      condition: async () => {
        if (!currentHousehold) return false;
        try {
          const expenses = await getWeekExpenses(currentHousehold.id);
          return expenses.length >= 10;
        } catch {
          return false;
        }
      },
    },
    {
      id: 'house-harmony',
      name: 'House Harmony',
      description: '3 consecutive days of activity',
      emoji: '🌸',
      condition: async () => {
        // TODO: Implement consecutive days check
        return false;
      },
    },
  ];

  // Load shown badges from Firestore
  useEffect(() => {
    if (!currentUser || loadedShownBadges) return;
    
    const loadShownBadges = async () => {
      try {
        const shown = await getShownBadges(currentUser.uid);
        shownBadgesRef.current = new Set(shown);
        setLoadedShownBadges(true);
      } catch (error) {
        logger.error('Error loading shown badges:', error);
      }
    };
    
    loadShownBadges();
  }, [currentUser, loadedShownBadges]);
  
  // Initialize badges once
  useEffect(() => {
    if (!currentHousehold) return;
    
    if (badges.length === 0) {
      setBadges(availableBadges.map(badge => ({
        ...badge,
        unlocked: false,
      })));
      setShowBadges(true);
    }
  }, [currentHousehold]);

  // Check badges separately - using ref to prevent loops
  useEffect(() => {
    if (!currentHousehold || !loadedShownBadges) return; // Wait for badges to load

    // Check badges
    const checkBadges = async () => {
      // Prevent concurrent checks
      if (isCheckingRef.current) return;
      isCheckingRef.current = true;

      try {
        const newBadgesFound: Badge[] = [];

        // Check conditions asynchronously
        for (const badgeDef of availableBadges) {
          try {
            // Skip if already shown
            if (shownBadgesRef.current.has(badgeDef.id)) continue;
            
            const conditionMet = await badgeDef.condition();
            
            // Get current state and update if needed
            setBadges((prevBadges) => {
              const currentBadges = prevBadges.length > 0 ? prevBadges : availableBadges.map(b => ({ ...b, unlocked: false }));
              const existingBadge = currentBadges.find(b => b.id === badgeDef.id);
              const wasUnlocked = existingBadge?.unlocked || false;
              
              if (conditionMet && !wasUnlocked) {
                // Newly unlocked badge
                const unlockedBadge: Badge = {
                  ...badgeDef,
                  unlocked: true,
                  unlockedAt: new Date(),
                };
                
                // Only show notification if we haven't shown it before (check Firestore)
                if (!shownBadgesRef.current.has(badgeDef.id) && currentUser) {
                  newBadgesFound.push(unlockedBadge);
                  shownBadgesRef.current.add(badgeDef.id);
                  // Mark as shown in Firestore
                  markBadgeAsShown(currentUser.uid, badgeDef.id).catch(err => {
                    logger.error('Error marking badge as shown:', err);
                  });
                }
                
                // Update this badge in the array
                return currentBadges.map(b => 
                  b.id === badgeDef.id ? unlockedBadge : b
                );
              }
              
              return prevBadges; // No change
            });
          } catch (error) {
            logger.error(`Error checking badge ${badgeDef.id}:`, error);
          }
        }

        // Show new badge notification if found (after a small delay to let state update)
        if (newBadgesFound.length > 0) {
          const firstNewBadge = newBadgesFound[0];
          setTimeout(() => {
            setNewBadge(firstNewBadge);
            showSuccess(`Badge unlocked: ${firstNewBadge.name} ${firstNewBadge.emoji}`, '🎉');
            setTimeout(() => setNewBadge(null), 3000);
          }, 500);
        }
      } finally {
        isCheckingRef.current = false;
      }
    };

    // Initial check after a delay
    const initialTimeout = setTimeout(checkBadges, 2000);

    // Check every 60 seconds (less frequent to avoid loops)
    const interval = setInterval(checkBadges, 60000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [currentHousehold, currentUser, showSuccess, loadedShownBadges]); // Added loadedShownBadges

  const unlockedBadges = badges.filter(b => b.unlocked);
  const lockedBadges = badges.filter(b => !b.unlocked);

  if (unlockedBadges.length === 0 && lockedBadges.length === 0) {
    return null;
  }

  return (
    <>
      {/* New Badge Animation */}
      {newBadge && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            animation: 'fadeIn 0.3s ease-out',
          }}
        >
          <Grow in={!!newBadge} timeout={500}>
            <Card
              className="celebrate"
              sx={{
                background: 'linear-gradient(135deg, #FFB86C 0%, #6A994E 100%)',
                color: '#FFF9F3',
                textAlign: 'center',
                p: 4,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                borderRadius: 3,
                minWidth: 280,
                maxWidth: 320,
              }}
            >
              <CardContent>
                <Typography 
                  variant="h2" 
                  sx={{ 
                    mb: 2, 
                    fontSize: '64px',
                    animation: 'bounce 0.6s ease-out',
                  }}
                >
                  {newBadge.emoji}
                </Typography>
                <Typography variant="h5" sx={{ mb: 1, fontWeight: 600, color: '#FFF9F3' }}>
                  Badge Unlocked! 🎉
                </Typography>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 500, color: '#FFF9F3' }}>
                  {newBadge.name}
                </Typography>
                <Typography variant="body2" sx={{ color: '#FFF9F3', opacity: 0.9 }}>
                  {newBadge.description}
                </Typography>
              </CardContent>
            </Card>
          </Grow>
        </Box>
      )}

      {/* Badge Display - Small, compact version - Show all badges */}
      {(unlockedBadges.length > 0 || lockedBadges.length > 0) && (
        <Fade in={showBadges} timeout={500}>
          <Card
            className="animate-fade-in"
            sx={{
              background: 'linear-gradient(135deg, #FFB86C15 0%, #6A994E15 100%)',
              border: '1px solid rgba(255, 184, 108, 0.2)',
              mb: 2,
            }}
          >
          <CardContent sx={{ py: 1.5 }}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <EmojiEvents sx={{ color: '#FFB86C', fontSize: 20 }} />
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                Your Badges
              </Typography>
            </Box>
            <Box display="flex" flexWrap="wrap" gap={0.5}>
              {unlockedBadges.map((badge) => (
                <Chip
                  key={badge.id}
                  icon={<span style={{ fontSize: '14px' }}>{badge.emoji}</span>}
                  label={badge.name}
                  size="small"
                  sx={{
                    backgroundColor: '#FFB86C30',
                    color: '#2C2C2C',
                    fontWeight: 500,
                    fontSize: '0.75rem',
                    border: '1px solid rgba(255, 184, 108, 0.3)',
                    '& .MuiChip-icon': {
                      marginLeft: '4px',
                    },
                  }}
                />
              ))}
              {lockedBadges.map((badge) => (
                <Chip
                  key={badge.id}
                  icon={<span style={{ fontSize: '14px', opacity: 0.3 }}>{badge.emoji}</span>}
                  label={badge.name}
                  size="small"
                  sx={{
                    backgroundColor: '#E0E0E030',
                    color: '#7A7A7A',
                    fontWeight: 400,
                    fontSize: '0.75rem',
                    border: '1px solid rgba(122, 122, 122, 0.2)',
                    opacity: 0.5,
                    '& .MuiChip-icon': {
                      marginLeft: '4px',
                    },
                  }}
                />
              ))}
            </Box>
          </CardContent>
        </Card>
        </Fade>
      )}
    </>
  );
};

export default BadgeSystem;
