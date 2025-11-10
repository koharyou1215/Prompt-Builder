/**
 * Unified Logger Utility
 *
 * Purpose:
 * - Development: Full logging for debugging
 * - Production: Suppressed logs for security and performance
 * - Error tracking: Always logged (ready for monitoring service integration)
 *
 * Rule: No 'any' type allowed - strict type safety enforced
 */

/**
 * Log level types
 */
type LogLevel = 'info' | 'warn' | 'error' | 'debug';

/**
 * Logger configuration
 */
interface LoggerConfig {
  readonly enabled: boolean;
  readonly levels: ReadonlyArray<LogLevel>;
  readonly prefix: string;
}

/**
 * Production-safe logger class
 */
class Logger {
  private readonly config: LoggerConfig;

  constructor(config: LoggerConfig) {
    this.config = config;
  }

  /**
   * Log informational messages (development only)
   */
  info(message: string, ...args: unknown[]): void {
    if (this.shouldLog('info')) {
      console.info(`${this.config.prefix}[INFO] ${message}`, ...args);
    }
  }

  /**
   * Log warnings (development only)
   */
  warn(message: string, ...args: unknown[]): void {
    if (this.shouldLog('warn')) {
      console.warn(`${this.config.prefix}[WARN] ${message}`, ...args);
    }
  }

  /**
   * Log errors (always logged)
   */
  error(message: string, error?: unknown, ...args: unknown[]): void {
    if (this.shouldLog('error')) {
      console.error(`${this.config.prefix}[ERROR] ${message}`, error, ...args);
    }
  }

  /**
   * Log debug information (development only)
   */
  debug(message: string, ...args: unknown[]): void {
    if (this.shouldLog('debug')) {
      console.debug(`${this.config.prefix}[DEBUG] ${message}`, ...args);
    }
  }

  /**
   * Check if logging is enabled for the specified level
   */
  private shouldLog(level: LogLevel): boolean {
    return this.config.enabled && this.config.levels.includes(level);
  }
}

/**
 * Default logger instance
 * - Development: All logs enabled
 * - Production: Only errors logged
 */
export const logger = new Logger({
  enabled: import.meta.env.DEV,
  levels: ['info', 'warn', 'error', 'debug'],
  prefix: '[App] '
});

/**
 * Create a scoped logger with custom prefix
 *
 * @param scope - Scope name (e.g., 'TranslationService', 'PromptContext')
 * @returns Logger instance with scoped prefix
 *
 * @example
 * ```typescript
 * const log = createScopedLogger('TranslationService');
 * log.info('Translation started', { text: '...' });
 * // Output: [App] [TranslationService][INFO] Translation started {...}
 * ```
 */
export const createScopedLogger = (scope: string): Logger => {
  return new Logger({
    enabled: import.meta.env.DEV,
    levels: ['info', 'warn', 'error', 'debug'],
    prefix: `[App] [${scope}]`
  });
};
