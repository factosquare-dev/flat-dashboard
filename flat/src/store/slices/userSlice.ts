import { UserRole } from '../../types/enums';
import { UserId } from '../../types/branded';

export interface User {
  id: UserId;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

export interface UserSlice {
  // State
  user: User | null;
  isAuthenticated: boolean;
  
  // Actions
  login: (user: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

export const userSlice = (set: any) => ({
  // Initial state
  user: null,
  isAuthenticated: false,
  
  // Actions
  login: (user) => set({ user, isAuthenticated: true }),
  
  logout: () => set({ user: null, isAuthenticated: false }),
  
  updateUser: (updates) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    })),
});