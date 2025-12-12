// Custom authentication service using username/password
// Users are hardcoded: Francesco and Martina with password "Peronciolillo"

export interface CustomUser {
  uid: string;
  username: string;
  displayName: string;
  createdAt: Date;
  households: string[];
  settings: {
    notifications: boolean;
    defaultSplit: 'equal' | 'custom';
  };
}

// Hardcoded users
const USERS: Record<string, { password: string; displayName: string }> = {
  Francesco: {
    password: 'Peronciolillo',
    displayName: 'Francesco',
  },
  Martina: {
    password: 'Peronciolillo',
    displayName: 'Martina',
  },
};

const STORAGE_KEY = 'home-assistant-auth';

export const customAuth = {
  // Login with username and password
  login: async (username: string, password: string): Promise<CustomUser> => {
    const normalizedUsername = username.trim();
    const user = USERS[normalizedUsername];

    if (!user) {
      throw new Error('Invalid username or password');
    }

    if (user.password !== password) {
      throw new Error('Invalid username or password');
    }

    // Create user object
    const customUser: CustomUser = {
      uid: `user-${normalizedUsername.toLowerCase()}`,
      username: normalizedUsername,
      displayName: user.displayName,
      createdAt: new Date(),
      households: [],
      settings: {
        notifications: true,
        defaultSplit: 'equal',
      },
    };

    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      user: customUser,
      timestamp: Date.now(),
    }));

    return customUser;
  },

  // Logout
  logout: (): void => {
    localStorage.removeItem(STORAGE_KEY);
  },

  // Get current user from localStorage
  getCurrentUser: (): CustomUser | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;

      const { user } = JSON.parse(stored);
      return user as CustomUser;
    } catch {
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return customAuth.getCurrentUser() !== null;
  },
};

