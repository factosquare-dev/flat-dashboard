import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { APP_CONSTANTS } from '@/app/config/constants';
import { logger } from '@/shared/utils/logger';
import { User } from '@/shared/types/user';
import { 
  getCurrentUserFromStorage, 
  saveCurrentUserToStorage,
  clearAllStorage,
  getAuthToken,
  saveAuthToken,
  saveRefreshToken,
  clearAuthTokens,
  saveTheme,
  saveLocale
} from '@/shared/utils/storageConversions';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  updatePreferences: (preferences: Partial<User['preferences']>) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing auth token and validate
    const initializeAuth = async () => {
      try {
        const token = getAuthToken();
        if (token) {
          // Validate token and get user info
          // This would typically be an API call
          const storedUser = getCurrentUserFromStorage();
          if (storedUser) {
            setUser(storedUser);
          }
        }
      } catch (error) {
        logger.error('Auth initialization error', error as Error);
        // Clear invalid tokens
        clearAuthTokens();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // This would typically be an API call
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const { user: userData, token, refreshToken } = await response.json();
      
      // Convert API response to User with branded types
      const typedUser = userData; // In real app, use convertApiUser(userData)
      
      // Store tokens
      saveAuthToken(token);
      saveRefreshToken(refreshToken);
      saveCurrentUserToStorage(typedUser);
      
      setUser(typedUser);
    } catch (error) {
      logger.error('Login error', error as Error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Clear all stored data using utility
    clearAllStorage();
    
    setUser(null);
    
    // Redirect to login page
    window.location.href = APP_CONSTANTS.ROUTES.LOGIN;
  };

  const updateUser = (updates: Partial<User>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    saveCurrentUserToStorage(updatedUser);
  };

  const updatePreferences = (preferences: Partial<User['preferences']>) => {
    if (!user) return;
    
    const updatedUser = {
      ...user,
      preferences: { ...user.preferences, ...preferences }
    };
    setUser(updatedUser);
    saveCurrentUserToStorage(updatedUser);
    
    // Store theme separately for easy access
    if (preferences?.theme) {
      saveTheme(preferences.theme);
    }
    
    // Store locale separately for easy access
    if (preferences?.locale) {
      saveLocale(preferences.locale);
    }
  };

  const value: AuthContextValue = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    updateUser,
    updatePreferences,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Utility hooks
export const useUser = () => {
  const { user, updateUser, updatePreferences } = useAuth();
  return { user, updateUser, updatePreferences };
};

export const useAuthActions = () => {
  const { login, logout } = useAuth();
  return { login, logout };
};