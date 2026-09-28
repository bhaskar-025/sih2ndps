export enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  DEBUG = 'DEBUG',
}

export class Logger {
  private static formatTime(): string {
    return new Date().toISOString();
  }

  static info(message: string, meta?: any): void {
    console.log(`\x1b[36m[${this.formatTime()}] [INFO]\x1b[0m ${message}`, meta ? meta : '');
  }

  static warn(message: string, meta?: any): void {
    console.warn(`\x1b[33m[${this.formatTime()}] [WARN]\x1b[0m ${message}`, meta ? meta : '');
  }

  static error(message: string, error?: any): void {
    console.error(`\x1b[31m[${this.formatTime()}] [ERROR]\x1b[0m ${message}`, error ? error : '');
  }

  static debug(message: string, meta?: any): void {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`\x1b[35m[${this.formatTime()}] [DEBUG]\x1b[0m ${message}`, meta ? meta : '');
    }
  }
}
