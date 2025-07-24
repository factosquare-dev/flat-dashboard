import React from 'react';

// Performance monitoring utilities
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private measurements: Map<string, number> = new Map();
  private observers: PerformanceObserver[] = [];

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Measure function execution time
  measureFunction<T extends (...args: any[]) => any>(
    fn: T,
    name: string
  ): (...args: Parameters<T>) => ReturnType<T> {
    return (...args: Parameters<T>): ReturnType<T> => {
      const start = performance.now();
      const result = fn(...args);
      const end = performance.now();
      const duration = end - start;

      // Performance logging removed for cleaner console

      this.measurements.set(name, duration);
      return result;
    };
  }

  // Measure async function execution time
  measureAsyncFunction<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    name: string
  ): (...args: Parameters<T>) => ReturnType<T> {
    return async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
      const start = performance.now();
      const result = await fn(...args);
      const end = performance.now();
      const duration = end - start;

      // Performance logging removed for cleaner console

      this.measurements.set(name, duration);
      return result;
    };
  }

  // Start measuring a process
  startMeasure(name: string): void {
    performance.mark(`${name}-start`);
  }

  // End measuring a process
  endMeasure(name: string): number {
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
    
    const entries = performance.getEntriesByName(name, 'measure');
    const duration = entries[entries.length - 1]?.duration || 0;
    
    this.measurements.set(name, duration);
    return duration;
  }

  // Get measurement results
  getMeasurement(name: string): number | undefined {
    return this.measurements.get(name);
  }

  // Get all measurements
  getAllMeasurements(): Record<string, number> {
    return Object.fromEntries(this.measurements);
  }

  // Monitor Core Web Vitals
  initWebVitalsMonitoring(): void {
    if (typeof window === 'undefined') return;

    // Monitor LCP (Largest Contentful Paint)
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lcpEntry = entries[entries.length - 1];
      
      // LCP logging removed for cleaner console
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // Monitor FID (First Input Delay)
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        const fid = entry.processingStart - entry.startTime;
        
        // FID logging removed for cleaner console
      });
    }).observe({ entryTypes: ['first-input'] });

    // Monitor CLS (Cumulative Layout Shift)
    let clsScore = 0;
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsScore += entry.value;
        }
      });
      
      // CLS logging removed for cleaner console
    }).observe({ entryTypes: ['layout-shift'] });
  }

  // Clear all measurements
  clear(): void {
    this.measurements.clear();
    performance.clearMarks();
    performance.clearMeasures();
  }

  // Generate performance report
  generateReport(): {
    summary: {
      total: number;
      average: number;
      slowest: { name: string; duration: number } | null;
    };
    details: Record<string, number>;
  } {
    const measurements = this.getAllMeasurements();
    const durations = Object.values(measurements);
    
    const total = durations.reduce((sum, duration) => sum + duration, 0);
    const average = durations.length > 0 ? total / durations.length : 0;
    
    const slowest = Object.entries(measurements).reduce(
      (max, [name, duration]) => 
        max.duration < duration ? { name, duration } : max,
      { name: '', duration: 0 }
    );

    return {
      summary: {
        total,
        average,
        slowest: slowest.name ? slowest : null
      },
      details: measurements
    };
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();

// Decorator for measuring method performance
export function measurePerformance(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  
  descriptor.value = function(...args: any[]) {
    const methodName = `${target.constructor.name}.${propertyKey}`;
    return performanceMonitor.measureFunction(originalMethod, methodName).apply(this, args);
  };
  
  return descriptor;
}

// HOC for measuring component render performance
export function withRenderPerformance<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
) {
  const name = componentName || Component.displayName || Component.name || 'Component';
  
  return React.memo(React.forwardRef<any, P>((props, ref) => {
    const renderStart = performance.now();
    
    React.useLayoutEffect(() => {
      const renderEnd = performance.now();
      const renderTime = renderEnd - renderStart;
      
      // Render performance logging removed for cleaner console
    });
    
    return React.createElement(Component, { ...props, ref });
  }));
}