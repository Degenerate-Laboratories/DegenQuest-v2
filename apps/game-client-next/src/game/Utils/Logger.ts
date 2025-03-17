// Simple client-side logger implementation
class LoggerClass {
  info(message: string, data?: any) {
    console.info(`[INFO] ${message}`, data || '');
  }

  warning(message: string, data?: any) {
    console.warn(`[WARNING] ${message}`, data || '');
  }

  error(message: string, data?: any) {
    console.error(`[ERROR] ${message}`, data || '');
  }
}

// Export a singleton instance
const Logger = new LoggerClass();

export default Logger; 