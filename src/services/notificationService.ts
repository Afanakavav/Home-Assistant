import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';
import { getApps } from 'firebase/app';
import { getPlantsNeedingWater } from './plantService';
import { getUpcomingMaintenance } from './vendorService';
import { logger } from '../utils/logger';

// Initialize Firebase if not already initialized
let messaging: Messaging | null = null;

const initMessaging = async (): Promise<Messaging | null> => {
  if (typeof window === 'undefined') return null; // Server-side rendering
  
  try {
    const apps = getApps();
    if (apps.length === 0) {
      // Firebase should already be initialized, but just in case
      return null;
    }

    if ('serviceWorker' in navigator && 'Notification' in window) {
      messaging = getMessaging(apps[0]);
      return messaging;
    }
  } catch (error) {
    logger.error('Error initializing messaging:', error);
  }
  
  return null;
};

// Request notification permission
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    logger.warn('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    logger.warn('Notification permission denied');
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

// Get FCM token
export const getFCMToken = async (): Promise<string | null> => {
  try {
    const messagingInstance = await initMessaging();
    if (!messagingInstance) return null;

    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) return null;

    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
    if (!vapidKey) {
      logger.warn('VAPID key not configured');
      return null;
    }

    const token = await getToken(messagingInstance, { vapidKey });
    return token;
  } catch (error) {
    logger.error('Error getting FCM token:', error);
    return null;
  }
};

// Listen for foreground messages
export const onForegroundMessage = (callback: (payload: any) => void) => {
  initMessaging().then((messagingInstance) => {
    if (messagingInstance) {
      onMessage(messagingInstance, callback);
    }
  });
};

// Check plants needing water and show notifications
export const checkPlantsNeedingWater = async (householdId: string): Promise<void> => {
  try {
    const plants = await getPlantsNeedingWater(householdId);
    
    if (plants.length > 0 && Notification.permission === 'granted') {
      const plantNames = plants.map((p) => p.name).join(', ');
      const notification = new Notification('🌱 Piante da annaffiare', {
        body: `${plants.length} pianta${plants.length > 1 ? 'e' : ''} necessita${plants.length > 1 ? 'no' : ''} di acqua: ${plantNames}`,
        icon: '/home-assistant/icon-192x192.png',
        badge: '/home-assistant/icon-192x192.png',
        tag: 'plants-watering',
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }
  } catch (error) {
      logger.error('Error checking plants:', error);
  }
};

// Check upcoming maintenance and show notifications
export const checkUpcomingMaintenance = async (householdId: string): Promise<void> => {
  try {
    const maintenance = await getUpcomingMaintenance(householdId, 7); // Next 7 days
    
    if (maintenance.length > 0 && Notification.permission === 'granted') {
      const maintenanceItems = maintenance.map((m) => `${m.vendor.name} - ${m.maintenance.type}`).join(', ');
      const notification = new Notification('🔧 Manutenzioni in arrivo', {
        body: `${maintenance.length} manutenzione${maintenance.length > 1 ? 'i' : ''} in arrivo: ${maintenanceItems}`,
        icon: '/home-assistant/icon-192x192.png',
        badge: '/home-assistant/icon-192x192.png',
        tag: 'maintenance-upcoming',
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }
  } catch (error) {
      logger.error('Error checking maintenance:', error);
  }
};

// Start periodic checks for notifications
export const startNotificationChecks = (householdId: string, intervalMinutes: number = 60): (() => void) => {
  // Check immediately
  checkPlantsNeedingWater(householdId);
  checkUpcomingMaintenance(householdId);

  // Then check periodically
  const interval = setInterval(() => {
    checkPlantsNeedingWater(householdId);
    checkUpcomingMaintenance(householdId);
  }, intervalMinutes * 60 * 1000);

  // Return cleanup function
  return () => clearInterval(interval);
};

