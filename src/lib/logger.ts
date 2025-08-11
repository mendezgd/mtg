/**
 * Logger utility for consistent logging across the application
 */
class Logger {
  private isDevelopment = process.env.NODE_ENV === "development";

  debug(...args: any[]): void {
    if (this.isDevelopment) {
      console.log("[DEBUG]", ...args);
    }
  }

  info(...args: any[]): void {
    if (this.isDevelopment) {
      console.info("[INFO]", ...args);
    }
  }

  warn(...args: any[]): void {
    console.warn("[WARN]", ...args);
  }

  error(...args: any[]): void {
    console.error("[ERROR]", ...args);
  }

  // For performance logging
  time(label: string): void {
    if (this.isDevelopment) {
      console.time(label);
    }
  }

  timeEnd(label: string): void {
    if (this.isDevelopment) {
      console.timeEnd(label);
    }
  }
}

export const logger = new Logger();
