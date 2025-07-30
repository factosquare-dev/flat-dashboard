import type { LogEntry } from './types';

export class ConsoleFormatter {
  private environment: string;

  constructor(environment: string) {
    this.environment = environment;
  }

  format(entry: LogEntry): void {
    const prefix = `[${entry.timestamp}] ${entry.level}`;
    const contextStr = entry.context ? JSON.stringify(entry.context) : '';
    
    if (this.environment === 'development') {
      // Development: Human-readable format
      const style = this.getConsoleStyle(entry.level);
      console.log(
        `%c${prefix}%c ${entry.message}`,
        style,
        'color: inherit',
        contextStr ? `\nContext: ${contextStr}` : '',
        entry.error ? `\nError: ${entry.error.message}` : ''
      );
      
      if (entry.error?.stack) {
        console.log(`Stack: ${entry.error.stack}`);
      }
    } else {
      // Production: JSON format
      console.log(JSON.stringify(entry));
    }
  }

  private getConsoleStyle(level: string): string {
    switch (level) {
      case 'DEBUG':
        return 'color: #888; font-weight: normal;';
      case 'INFO':
        return 'color: #0066cc; font-weight: bold;';
      case 'WARN':
        return 'color: #ff9900; font-weight: bold;';
      case 'ERROR':
        return 'color: #cc0000; font-weight: bold;';
      default:
        return 'color: inherit;';
    }
  }
}