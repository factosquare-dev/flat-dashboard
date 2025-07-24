import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { APP_CONSTANTS } from '../config/constants';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  preferences?: {
    theme: 'light' | 'dark';
    locale: string;
  };
}

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
        const token = localStorage.getItem(APP_CONSTANTS.STORAGE_KEYS.AUTH_TOKEN);
        if (token) {
          // Validate token and get user info
          // This would typically be an API call
          const storedUser = localStorage.getItem(APP_CONSTANTS.STORAGE_KEYS.USER_PREFERENCES);
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear invalid tokens
        localStorage.removeItem(APP_CONSTANTS.STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(APP_CONSTANTS.STORAGE_KEYS.REFRESH_TOKEN);
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
      
      // Store tokens
      localStorage.setItem(APP_CONSTANTS.STORAGE_KEYS.AUTH_TOKEN, token);
      localStorage.setItem(APP_CONSTANTS.STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      localStorage.setItem(APP_CONSTANTS.STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(userData));
      
      setUser(userData);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Clear stored data
    localStorage.removeItem(APP_CONSTANTS.STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(APP_CONSTANTS.STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(APP_CONSTANTS.STORAGE_KEYS.USER_PREFERENCES);
    
    setUser(null);
    
    // Redirect to login page
    window.location.href = APP_CONSTANTS.ROUTES.LOGIN;
  };

  const updateUser = (updates: Partial<User>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem(APP_CONSTANTS.STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(updatedUser));
  };

  const updatePreferences = (preferences: Partial<User['preferences']>) => {
    if (!user) return;
    
    const updatedUser = {
      ...user,
      preferences: { ...user.preferences, ...preferences }
    };
    setUser(updatedUser);
    localStorage.setItem(APP_CONSTANTS.STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(updatedUser));
    
    // Store theme separately for easy access
    if (preferences.theme) {
      localStorage.setItem(APP_CONSTANTS.STORAGE_KEYS.THEME, preferences.theme);
    }
    
    // Store locale separately for easy access
    if (preferences.locale) {
      localStorage.setItem(APP_CONSTANTS.STORAGE_KEYS.LOCALE, preferences.locale);
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