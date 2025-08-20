import { Theme, Language, ToastVariant } from '@/shared/types/enums';

export interface Notification {
  id: string;
  type: ToastVariant;
  title: string;
  message?: string;
  duration?: number;
  timestamp: Date;
}

export interface UISlice {
  // State
  theme: Theme;
  language: Language;
  sidebarCollapsed: boolean;
  notifications: Notification[];
  
  // Actions
  setTheme: (theme: Theme) => void;
  setLanguage: (language: Language) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

import { StateCreator } from 'zustand';

export const uiSlice: StateCreator<UISlice> = (set) => ({
  // Initial state
  theme: Theme.LIGHT,
  language: Language.EN,
  sidebarCollapsed: false,
  notifications: [],
  
  // Actions
  setTheme: (theme) => set({ theme }),
  
  setLanguage: (language) => set({ language }),
  
  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  
  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        {
          ...notification,
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          timestamp: new Date(),
        },
      ],
    })),
  
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
  
  clearNotifications: () => set({ notifications: [] }),
});