import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useModal } from '../../../../hooks/common/useModal';

describe('useModal', () => {
  it('should initialize with closed state by default', () => {
    const { result } = renderHook(() => useModal());
    
    expect(result.current.isOpen).toBe(false);
  });

  it('should initialize with provided initial state', () => {
    const { result } = renderHook(() => useModal(true));
    
    expect(result.current.isOpen).toBe(true);
  });

  it('should open modal when open is called', () => {
    const { result } = renderHook(() => useModal());
    
    act(() => {
      result.current.open();
    });
    
    expect(result.current.isOpen).toBe(true);
  });

  it('should close modal when close is called', () => {
    const { result } = renderHook(() => useModal(true));
    
    act(() => {
      result.current.close();
    });
    
    expect(result.current.isOpen).toBe(false);
  });

  it('should toggle modal state', () => {
    const { result } = renderHook(() => useModal());
    
    act(() => {
      result.current.toggle();
    });
    expect(result.current.isOpen).toBe(true);
    
    act(() => {
      result.current.toggle();
    });
    expect(result.current.isOpen).toBe(false);
  });
});