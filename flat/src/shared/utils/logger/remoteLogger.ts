import type { LogEntry } from './types';

export class RemoteLogger {
  private environment: string;
  private endpoint?: string;

  constructor(environment: string, endpoint?: string) {
    this.environment = environment;
    this.endpoint = endpoint;
  }

  send(entry: LogEntry): void {
    // Send logs to remote logging service in production
    if (this.environment === 'production' && entry.level !== 'DEBUG' && this.endpoint) {
      fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      }).catch(() => {
        // Silently fail - don't want logging to break the app
      });
    }
  }
}