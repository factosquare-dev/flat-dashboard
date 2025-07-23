import { useState, useCallback, useRef } from 'react';

export interface ModalState<T = any> {
  isOpen: boolean;
  data?: T;
}

export interface UseModalStateReturn<T = any> {
  isOpen: boolean;
  data?: T;
  open: (data?: T) => void;
  close: () => void;
  toggle: (data?: T) => void;
  setData: (data: T) => void;
}

/**
 * 통합 모달 상태 관리 Hook
 * - 모든 모달에서 일관된 상태 관리
 * - 데이터 전달 지원
 * - 메모리 누수 방지
 */
export function useModalState<T = any>(
  initialState: boolean = false,
  initialData?: T
): UseModalStateReturn<T> {
  const [state, setState] = useState<ModalState<T>>({
    isOpen: initialState,
    data: initialData,
  });

  const isMountedRef = useRef(true);

  const open = useCallback((data?: T) => {
    if (isMountedRef.current) {
      setState({
        isOpen: true,
        data: data !== undefined ? data : state.data,
      });
    }
  }, [state.data]);

  const close = useCallback(() => {
    if (isMountedRef.current) {
      setState(prev => ({
        ...prev,
        isOpen: false,
      }));
    }
  }, []);

  const toggle = useCallback((data?: T) => {
    if (isMountedRef.current) {
      setState(prev => ({
        isOpen: !prev.isOpen,
        data: data !== undefined ? data : prev.data,
      }));
    }
  }, []);

  const setData = useCallback((data: T) => {
    if (isMountedRef.current) {
      setState(prev => ({
        ...prev,
        data,
      }));
    }
  }, []);

  // Cleanup on unmount
  useState(() => {
    return () => {
      isMountedRef.current = false;
    };
  });

  return {
    isOpen: state.isOpen,
    data: state.data,
    open,
    close,
    toggle,
    setData,
  };
}

/**
 * 여러 모달을 관리하는 Hook
 */
export function useMultipleModals<T extends string = string>() {
  const [openModals, setOpenModals] = useState<Set<T>>(new Set());
  const modalDataRef = useRef<Map<T, any>>(new Map());

  const isOpen = useCallback((modalId: T) => {
    return openModals.has(modalId);
  }, [openModals]);

  const open = useCallback((modalId: T, data?: any) => {
    setOpenModals(prev => new Set(prev).add(modalId));
    if (data !== undefined) {
      modalDataRef.current.set(modalId, data);
    }
  }, []);

  const close = useCallback((modalId: T) => {
    setOpenModals(prev => {
      const next = new Set(prev);
      next.delete(modalId);
      return next;
    });
    modalDataRef.current.delete(modalId);
  }, []);

  const closeAll = useCallback(() => {
    setOpenModals(new Set());
    modalDataRef.current.clear();
  }, []);

  const getData = useCallback((modalId: T) => {
    return modalDataRef.current.get(modalId);
  }, []);

  return {
    isOpen,
    open,
    close,
    closeAll,
    getData,
    openModals: Array.from(openModals),
  };
}