/**
 * 성능 모니터링 및 최적화 유틸리티
 */

interface PerformanceEntry {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
}

class PerformanceMonitor {
  private entries = new Map<string, PerformanceEntry>();
  
  start(name: string) {
    this.entries.set(name, {
      name,
      startTime: performance.now()
    });
  }
  
  end(name: string) {
    const entry = this.entries.get(name);
    if (entry) {
      const endTime = performance.now();
      entry.endTime = endTime;
      entry.duration = endTime - entry.startTime;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Performance] ${name}: ${entry.duration.toFixed(2)}ms`);
      }
      
      return entry.duration;
    }
    return 0;
  }
  
  measure(name: string, fn: () => void) {
    this.start(name);
    fn();
    return this.end(name);
  }
  
  async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    this.start(name);
    try {
      const result = await fn();
      this.end(name);
      return result;
    } catch (error) {
      this.end(name);
      throw error;
    }
  }
  
  getEntries() {
    return Array.from(this.entries.values());
  }
  
  clear() {
    this.entries.clear();
  }
}

export const performanceMonitor = new PerformanceMonitor();

/**
 * React Hook for performance monitoring
 */
export const usePerformanceMonitor = () => {
  return {
    start: performanceMonitor.start.bind(performanceMonitor),
    end: performanceMonitor.end.bind(performanceMonitor),
    measure: performanceMonitor.measure.bind(performanceMonitor),
    measureAsync: performanceMonitor.measureAsync.bind(performanceMonitor),
    getEntries: performanceMonitor.getEntries.bind(performanceMonitor),
    clear: performanceMonitor.clear.bind(performanceMonitor),
  };
};