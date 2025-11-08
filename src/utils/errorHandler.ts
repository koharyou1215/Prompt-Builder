/**
 * Unified Error Handling Utilities
 *
 * Provides consistent error handling patterns across the application
 */

/**
 * Extract error message from unknown error types
 * @param err - Unknown error object
 * @param defaultMessage - Default message if error cannot be parsed
 * @returns Formatted error message string
 */
export const getErrorMessage = (err: unknown, defaultMessage: string): string => {
  if (err instanceof Error) {
    return err.message;
  }
  if (typeof err === 'string') {
    return err;
  }
  return defaultMessage;
};

/**
 * Result type for async operations
 */
export interface AsyncResult<T = unknown> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: Error;
}

/**
 * Wrap async operations with consistent error handling
 * @param fn - Async function to execute
 * @param errorContext - Context message for error logging
 * @returns AsyncResult with success/failure status
 *
 * @example
 * ```ts
 * const result = await handleAsync(
 *   () => fetchData(),
 *   'データの取得に失敗しました'
 * );
 *
 * if (result.success) {
 *   console.log(result.data);
 * } else {
 *   console.error(result.error);
 * }
 * ```
 */
export const handleAsync = async <T>(
  fn: () => Promise<T>,
  errorContext: string
): Promise<AsyncResult<T>> => {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (error) {
    const errorMessage = getErrorMessage(error, errorContext);
    return {
      success: false,
      error: new Error(errorMessage)
    };
  }
};

/**
 * Log error with consistent format
 * @param context - Error context (component/function name)
 * @param err - Error object
 */
export const logError = (context: string, err: unknown): void => {
  const message = getErrorMessage(err, 'Unknown error');
  console.error(`[${context}] ${message}`, err);
};
