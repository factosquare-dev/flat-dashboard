import { useCallback } from 'react';
import { useStore } from '@/core/store';
import { NotificationType } from '@/shared/types/enums';

const DEFAULT_TOAST_DURATION = 5000; // 5 seconds

export const useToast = () => {
  const { addNotification } = useStore();
  
  const toast = useCallback((options: {
    title: string;
    message?: string;
    type?: NotificationType;
    duration?: number;
  }) => {
    addNotification({
      title: options.title,
      message: options.message,
      type: options.type || NotificationType.INFO,
      duration: options.duration || DEFAULT_TOAST_DURATION,
    });
  }, [addNotification]);
  
  return {
    toast,
    success: (title: string, message?: string) => 
      toast({ title, message, type: NotificationType.SUCCESS }),
    error: (title: string, message?: string) => 
      toast({ title, message, type: NotificationType.ERROR }),
    warning: (title: string, message?: string) => 
      toast({ title, message, type: NotificationType.WARNING }),
    info: (title: string, message?: string) => 
      toast({ title, message, type: NotificationType.INFO }),
  };
};