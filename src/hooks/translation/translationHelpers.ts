/**
 * Translation Helper Utilities
 *
 * Common helper functions for translation hooks.
 * Extracted from useTranslation.ts for better code organization.
 */

import { useRef } from 'react';
import { TranslationError } from '../../types';

/**
 * Abort manager for canceling in-progress translations
 */
export interface AbortManager {
  abort: () => void;
  reset: () => void;
  isAborted: () => boolean;
}

/**
 * Create abort manager for translation cancellation
 *
 * @returns Abort manager with control methods
 */
export const createAbortManager = (): AbortManager => {
  const abortRef = useRef<boolean>(false);

  return {
    abort: () => {
      abortRef.current = true;
    },
    reset: () => {
      abortRef.current = false;
    },
    isAborted: () => abortRef.current
  };
};

/**
 * Debounce timer manager
 */
export interface DebounceTimer {
  clear: () => void;
  set: (callback: () => void, delay: number) => void;
}

/**
 * Create debounce timer for delayed translation execution
 *
 * @returns Debounce timer with control methods
 */
export const createDebounceTimer = (): DebounceTimer => {
  const timerRef = useRef<number | null>(null);

  return {
    clear: () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    },
    set: (callback: () => void, delay: number) => {
      timerRef.current = setTimeout(callback, delay) as unknown as number;
    }
  };
};

/**
 * Extract user-friendly error message from error object
 *
 * @param error - Error object
 * @param defaultMsg - Default error message
 * @returns User-friendly error message
 */
export const extractErrorMessage = (error: unknown, defaultMsg: string): string => {
  if (error instanceof TranslationError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return defaultMsg;
};
