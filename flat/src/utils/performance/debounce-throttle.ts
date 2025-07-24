import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Debounce function - delays execution until after wait milliseconds have elapsed
 * since the last time the debounced function was invoked
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  options?: { leading?: boolean; trailing?: boolean; maxWait?: number }
): T & { cancel: () => void; flush: () => void } {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastArgs: any[] | null = null;
  let lastThis: any = null;
  let lastCallTime: number | null = null;
  let lastInvokeTime = 0;
  let result: any;

  const { leading = false, trailing = true, maxWait } = options || {};

  function invokeFunc(time: number) {
    const args = lastArgs;
    const thisArg = lastThis;
    
    lastArgs = lastThis = null;
    lastInvokeTime = time;
    result = func.apply(thisArg, args!);
    return result;
  }

  function leadingEdge(time: number) {
    lastInvokeTime = time;
    timeoutId = setTimeout(timerExpired, wait);
    return leading ? invokeFunc(time) : result;
  }

  function remainingWait(time: number) {
    const timeSinceLastCall = time - (lastCallTime || 0);
    const timeSinceLastInvoke = time - lastInvokeTime;
    const timeWaiting = wait - timeSinceLastCall;

    return maxWait !== undefined
      ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke)
      : timeWaiting;
  }

  function shouldInvoke(time: number) {
    const timeSinceLastCall = time - (lastCallTime || 0);
    const timeSinceLastInvoke = time - lastInvokeTime;

    return (
      lastCallTime === null ||
      timeSinceLastCall >= wait ||
      timeSinceLastCall < 0 ||
      (maxWait !== undefined && timeSinceLastInvoke >= maxWait)
    );
  }

  function timerExpired() {
    const time = Date.now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    timeoutId = setTimeout(timerExpired, remainingWait(time));
  }

  function trailingEdge(time: number) {
    timeoutId = null;
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = null;
    return result;
  }

  function debounced(this: any, ...args: any[]) {
    const time = Date.now();
    const isInvoking = shouldInvoke(time);

    lastArgs = args;
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (timeoutId === null) {
        return leadingEdge(lastCallTime);
      }
      if (maxWait !== undefined) {
        timeoutId = setTimeout(timerExpired, wait);
        return invokeFunc(lastCallTime);
      }
    }
    if (timeoutId === null) {
      timeoutId = setTimeout(timerExpired, wait);
    }
    return result;
  }

  debounced.cancel = function() {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    lastInvokeTime = 0;
    lastArgs = lastCallTime = lastThis = timeoutId = null;
  };

  debounced.flush = function() {
    return timeoutId === null ? result : trailingEdge(Date.now());
  };

  return debounced as any;
}

/**
 * Throttle function - ensures func is called at most once per wait milliseconds
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  options?: { leading?: boolean; trailing?: boolean }
): T & { cancel: () => void; flush: () => void } {
  return debounce(func, wait, {
    leading: options?.leading ?? true,
    trailing: options?.trailing ?? true,
    maxWait: wait
  });
}

/**
 * React hook for debounced values
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * React hook for debounced callbacks
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  options?: { leading?: boolean; trailing?: boolean; maxWait?: number }
): T & { cancel: () => void; flush: () => void } {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  return useCallback(
    debounce(
      (...args: Parameters<T>) => callbackRef.current(...args),
      delay,
      options
    ),
    [delay, options?.leading, options?.trailing, options?.maxWait]
  ) as T & { cancel: () => void; flush: () => void };
}

/**
 * React hook for throttled callbacks
 */
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  options?: { leading?: boolean; trailing?: boolean }
): T & { cancel: () => void; flush: () => void } {
  return useDebouncedCallback(callback, delay, {
    ...options,
    maxWait: delay
  });
}

/**
 * Request Animation Frame throttle
 * Ensures function is called at most once per animation frame
 */
export function rafThrottle<T extends (...args: any[]) => any>(func: T): T & { cancel: () => void } {
  let rafId: number | null = null;
  let lastArgs: any[] | null = null;
  let lastThis: any = null;

  function throttled(this: any, ...args: any[]) {
    lastArgs = args;
    lastThis = this;

    if (rafId === null) {
      rafId = requestAnimationFrame(() => {
        func.apply(lastThis, lastArgs!);
        rafId = null;
      });
    }
  }

  throttled.cancel = function() {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  };

  return throttled as any;
}