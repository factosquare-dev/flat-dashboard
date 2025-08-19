import { create } from 'zustand';
import type { Notification, NotificationPayload, NotificationType } from '@/types/notification';

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  
  // Actions
  addNotification: (payload: NotificationPayload) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  removeNotification: (notificationId: string) => void;
  clearAll: () => void;
  
  // Browser notification
  requestPermission: () => Promise<boolean>;
  showBrowserNotification: (title: string, message: string, icon?: string) => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,

  addNotification: (payload: NotificationPayload) => {
    const newNotification: Notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...payload,
      read: false,
      createdAt: new Date()
    };

    set((state) => ({
      notifications: [newNotification, ...state.notifications],
      unreadCount: state.unreadCount + 1
    }));

    // Show browser notification if permitted
    if (Notification.permission === 'granted') {
      get().showBrowserNotification(payload.title, payload.message);
    }

    // Play notification sound (optional)
    const audio = new Audio('/notification.mp3');
    audio.play().catch(() => {}); // Ignore errors if sound file doesn't exist
  },

  markAsRead: (notificationId: string) => {
    set((state) => {
      const notification = state.notifications.find(n => n.id === notificationId);
      if (notification && !notification.read) {
        notification.read = true;
        return {
          notifications: [...state.notifications],
          unreadCount: Math.max(0, state.unreadCount - 1)
        };
      }
      return state;
    });
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map(n => ({ ...n, read: true })),
      unreadCount: 0
    }));
  },

  removeNotification: (notificationId: string) => {
    set((state) => {
      const notification = state.notifications.find(n => n.id === notificationId);
      const newNotifications = state.notifications.filter(n => n.id !== notificationId);
      
      return {
        notifications: newNotifications,
        unreadCount: notification && !notification.read 
          ? Math.max(0, state.unreadCount - 1) 
          : state.unreadCount
      };
    });
  },

  clearAll: () => {
    set({ notifications: [], unreadCount: 0 });
  },

  requestPermission: async () => {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  },

  showBrowserNotification: (title: string, message: string, icon?: string) => {
    if (Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body: message,
        icon: icon || '/logo.png',
        badge: '/badge.png',
        tag: 'flat-notification',
        renotify: true,
        requireInteraction: false
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Auto close after 5 seconds
      setTimeout(() => notification.close(), 5000);
    }
  }
}));