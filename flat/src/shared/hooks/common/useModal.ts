/**
 * Modal management hook
 * Handles modal state and lifecycle
 */

import { useState, useCallback } from 'react';

interface UseModalOptions<T = unknown> {
  initialOpen?: boolean;
  initialData?: T;
  onOpen?: () => void;
  onClose?: () => void;
}

interface UseModalReturn<T = unknown> {
  isOpen: boolean;
  data: T | undefined;
  open: (data?: T) => void;
  close: () => void;
  toggle: () => void;
  setData: (data: T) => void;
}

export function useModal<T = unknown>({
  initialOpen = false,
  initialData,
  onOpen,
  onClose,
}: UseModalOptions<T> = {}): UseModalReturn<T> {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [data, setData] = useState<T | undefined>(initialData);

  const open = useCallback((newData?: T) => {
    if (newData !== undefined) {
      setData(newData);
    }
    setIsOpen(true);
    onOpen?.();
  }, [onOpen]);

  const close = useCallback(() => {
    setIsOpen(false);
    onClose?.();
  }, [onClose]);

  const toggle = useCallback(() => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }, [isOpen, open, close]);

  return {
    isOpen,
    data,
    open,
    close,
    toggle,
    setData,
  };
}

// Multiple modals management
interface UseModalsReturn {
  modals: Record<string, boolean>;
  data: Record<string, any>;
  open: (modalId: string, data?: any) => void;
  close: (modalId: string) => void;
  closeAll: () => void;
  isOpen: (modalId: string) => boolean;
  getData: <T = any>(modalId: string) => T | undefined;
}

export function useModals(): UseModalsReturn {
  const [modals, setModals] = useState<Record<string, boolean>>({});
  const [data, setData] = useState<Record<string, any>>({});

  const open = useCallback((modalId: string, modalData?: any) => {
    setModals(prev => ({ ...prev, [modalId]: true }));
    if (modalData !== undefined) {
      setData(prev => ({ ...prev, [modalId]: modalData }));
    }
  }, []);

  const close = useCallback((modalId: string) => {
    setModals(prev => ({ ...prev, [modalId]: false }));
    // Clear data after closing
    setTimeout(() => {
      setData(prev => {
        const { [modalId]: _, ...rest } = prev;
        return rest;
      });
    }, 300); // Wait for animation
  }, []);

  const closeAll = useCallback(() => {
    setModals({});
    setTimeout(() => setData({}), 300);
  }, []);

  const isOpen = useCallback((modalId: string) => {
    return modals[modalId] || false;
  }, [modals]);

  const getData = useCallback(<T = any>(modalId: string): T | undefined => {
    return data[modalId] as T;
  }, [data]);

  return {
    modals,
    data,
    open,
    close,
    closeAll,
    isOpen,
    getData,
  };
}