import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
}

interface AppState {
  // Auth state
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  
  // UI state
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  activeModal: string | null;
  notifications: Notification[];
  
  // Global loading states
  isLoading: boolean;
  loadingMessage: string | null;
}

interface AppActions {
  // Auth actions
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  
  // UI actions
  toggleTheme: () => void;
  toggleSidebar: () => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
  
  // Notification actions
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  // Loading actions
  setLoading: (isLoading: boolean, message?: string) => void;
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  timestamp: Date;
}

type AppStore = AppState & AppActions;

const initialState: AppState = {
  user: null,
  isAuthenticated: false,
  token: null,
  theme: 'light',
  sidebarOpen: true,
  activeModal: null,
  notifications: [],
  isLoading: false,
  loadingMessage: null,
};

export const useAppStore = create<AppStore>()(
  subscribeWithSelector(
    devtools(
      immer((set) => ({
        ...initialState,
        
        // Auth actions
        login: (user, token) =>
          set((state) => {
            state.user = user;
            state.isAuthenticated = true;
            state.token = token;
            localStorage.setItem('auth_token', token);
          }),
          
        logout: () =>
          set((state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.token = null;
            localStorage.removeItem('auth_token');
          }),
          
        updateUser: (updates) =>
          set((state) => {
            if (state.user) {
              state.user = { ...state.user, ...updates };
            }
          }),
          
        // UI actions
        toggleTheme: () =>
          set((state) => {
            state.theme = state.theme === 'light' ? 'dark' : 'light';
            document.documentElement.classList.toggle('dark');
          }),
          
        toggleSidebar: () =>
          set((state) => {
            state.sidebarOpen = !state.sidebarOpen;
          }),
          
        openModal: (modalId) =>
          set((state) => {
            state.activeModal = modalId;
          }),
          
        closeModal: () =>
          set((state) => {
            state.activeModal = null;
          }),
          
        // Notification actions
        addNotification: (notification) =>
          set((state) => {
            state.notifications.push(notification);
            
            // Auto-remove after duration
            if (notification.duration) {
              setTimeout(() => {
                useAppStore.getState().removeNotification(notification.id);
              }, notification.duration);
            }
          }),
          
        removeNotification: (id) =>
          set((state) => {
            state.notifications = state.notifications.filter((n) => n.id !== id);
          }),
          
        clearNotifications: () =>
          set((state) => {
            state.notifications = [];
          }),
          
        // Loading actions
        setLoading: (isLoading, message) =>
          set((state) => {
            state.isLoading = isLoading;
            state.loadingMessage = message || null;
          }),
      })),
      {
        name: 'AppStore',
      }
    )
  )
);

// Selectors
export const selectUser = (state: AppStore) => state.user;
export const selectIsAuthenticated = (state: AppStore) => state.isAuthenticated;
export const selectTheme = (state: AppStore) => state.theme;
export const selectNotifications = (state: AppStore) => state.notifications;

// Subscribe to auth changes
useAppStore.subscribe(
  selectIsAuthenticated,
  (isAuthenticated) => {
    if (!isAuthenticated) {
      // Redirect to login or clear sensitive data
      window.location.href = '/login';
    }
  }
);