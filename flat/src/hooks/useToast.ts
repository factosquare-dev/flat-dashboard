import { useCallback } from 'react';
import { useStore } from '@/store';

export const useToast = () => {
  const { addNotification } = useStore();
  
  const toast = useCallback((options: {
    title: string;
    message?: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
  }) => {
    addNotification({
      title: options.title,
      message: options.message,
      type: options.type || 'info',
      duration: options.duration || 5000,
    });
  }, [addNotification]);
  
  return {
    toast,
    success: (title: string, message?: string) => 
      toast({ title, message, type: 'success' }),
    error: (title: string, message?: string) => 
      toast({ title, message, type: 'error' }),
    warning: (title: string, message?: string) => 
      toast({ title, message, type: 'warning' }),
    info: (title: string, message?: string) => 
      toast({ title, message, type: 'info' }),
  };
};