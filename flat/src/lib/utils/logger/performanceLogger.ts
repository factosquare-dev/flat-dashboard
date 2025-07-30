type Logger = {
  warn: (message: string) => void;
  logPerformance: (metric: string, value: number) => void;
};

export class PerformanceLogger {
  private static timers = new Map<string, number>();
  private static logger: Logger | null = null;

  /**
   * Initialize with logger instance
   */
  static init(logger: Logger): void {
    this.logger = logger;
  }

  /**
   * Start timing an operation
   */
  static startTimer(id: string): void {
    this.timers.set(id, performance.now());
  }

  /**
   * End timing and log the result
   */
  static endTimer(id: string, description?: string): number | null {
    const startTime = this.timers.get(id);
    if (!startTime) {
      this.logger?.warn(`Timer ${id} not found`);
      return null;
    }

    const duration = performance.now() - startTime;
    this.timers.delete(id);

    this.logger?.logPerformance(description || id, Math.round(duration));
    return duration;
  }

  /**
   * Measure and log a function execution time
   */
  static async measureAsync<T>(
    id: string,
    fn: () => Promise<T>,
    description?: string
  ): Promise<T> {
    this.startTimer(id);
    try {
      const result = await fn();
      this.endTimer(id, description);
      return result;
    } catch (error) {
      this.endTimer(id, description);
      throw error;
    }
  }

  /**
   * Measure and log a synchronous function execution time
   */
  static measure<T>(
    id: string,
    fn: () => T,
    description?: string
  ): T {
    this.startTimer(id);
    try {
      const result = fn();
      this.endTimer(id, description);
      return result;
    } catch (error) {
      this.endTimer(id, description);
      throw error;
    }
  }
}