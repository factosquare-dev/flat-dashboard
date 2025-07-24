import React, { ComponentType, memo, useMemo } from 'react';

// Native deep equality check to replace lodash-es
function isEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== typeof b) return false;
  
  if (typeof a !== 'object') return a === b;
  
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  
  if (Array.isArray(a)) {
    if (a.length !== b.length) return false;
    return a.every((item, index) => isEqual(item, b[index]));
  }
  
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  
  if (keysA.length !== keysB.length) return false;
  
  return keysA.every(key => isEqual(a[key], b[key]));
}

/**
 * Deep comparison memo HOC
 * Use this when you need to compare complex objects/arrays in props
 */
export function withDeepMemo<P extends object>(
  Component: ComponentType<P>,
  propsAreEqual?: (prevProps: Readonly<P>, nextProps: Readonly<P>) => boolean
) {
  return memo(Component, propsAreEqual || isEqual);
}

/**
 * Selective memo HOC
 * Only re-renders when specific props change
 */
export function withSelectiveMemo<P extends object>(
  Component: ComponentType<P>,
  selectProps: (props: P) => any[]
) {
  return memo(Component, (prevProps, nextProps) => {
    const prevSelected = selectProps(prevProps);
    const nextSelected = selectProps(nextProps);
    return isEqual(prevSelected, nextSelected);
  });
}

/**
 * Custom comparison function for arrays
 * Useful for memoizing components that receive arrays as props
 */
export function areArraysEqual<T>(
  prevArray: T[],
  nextArray: T[],
  compareItem?: (a: T, b: T) => boolean
): boolean {
  if (prevArray.length !== nextArray.length) return false;
  
  const itemComparator = compareItem || ((a, b) => a === b);
  return prevArray.every((item, index) => itemComparator(item, nextArray[index]));
}

/**
 * Hook for memoizing expensive computations with dependencies
 */
export function useDeepMemo<T>(
  factory: () => T,
  deps: React.DependencyList
): T {
  const prevDepsRef = React.useRef<React.DependencyList>();
  const valueRef = React.useRef<T>();

  if (!prevDepsRef.current || !isEqual(prevDepsRef.current, deps)) {
    prevDepsRef.current = deps;
    valueRef.current = factory();
  }

  return valueRef.current!;
}

/**
 * Hook for creating stable callbacks with deep comparison
 */
export function useDeepCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  return useDeepMemo(() => callback, deps);
}

/**
 * Performance monitoring HOC
 * Logs render times in development
 */
export function withPerformanceMonitor<P extends object>(
  Component: ComponentType<P>,
  componentName: string
) {
  if (process.env.NODE_ENV === 'production') {
    return Component;
  }

  return React.forwardRef<any, P>((props, ref) => {
    const renderStartTime = performance.now();

    React.useEffect(() => {
      const renderEndTime = performance.now();
      const renderTime = renderEndTime - renderStartTime;
      
      if (renderTime > 16) { // Longer than one frame (60fps)
        console.warn(
          `[Performance] ${componentName} took ${renderTime.toFixed(2)}ms to render`
        );
      }
    });

    return <Component {...props} ref={ref} />;
  });
}

/**
 * Utility to create memoized selectors
 */
export function createSelector<T, R>(
  selector: (state: T) => R,
  equalityFn: (a: R, b: R) => boolean = Object.is
): (state: T) => R {
  let lastState: T;
  let lastResult: R;
  let isInitialized = false;

  return (state: T) => {
    if (!isInitialized || !equalityFn(selector(state), lastResult)) {
      lastState = state;
      lastResult = selector(state);
      isInitialized = true;
    }
    return lastResult;
  };
}