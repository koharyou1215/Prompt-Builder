/**
 * Auto-Translation Hook
 *
 * Handles automatic English → Japanese translation with debounce.
 * Extracted from useTranslation.ts for better separation of concerns.
 */

import { useEffect, useRef } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { usePromptContext } from '../../contexts/PromptContext';
import { translateText } from '../../services/translationService';
import type { PromptTarget } from '../../types';
import { createAbortManager, createDebounceTimer, extractErrorMessage } from './translationHelpers';

/**
 * Auto-translation hook options
 */
export interface UseAutoTranslationOptions {
  readonly sourcePrompt: string;
  readonly enabled: boolean;
  readonly autoTranslate: boolean;
  readonly debounceMs: number;
  readonly target: PromptTarget;
  onTranslate: (result: string) => void;
  onError: (error: string | null) => void;
  setIsTranslating: (loading: boolean) => void;
}

/**
 * Auto-translation hook return type
 */
export interface UseAutoTranslationReturn {
  skipNext: () => void;
}

/**
 * Handle automatic English → Japanese translation with debounce
 *
 * Features:
 * - Debounced translation execution
 * - Abort management for race condition prevention
 * - Skip flag to prevent loops after manual reverse translation
 *
 * @param options - Auto-translation configuration
 * @returns Control methods
 */
export const useAutoTranslation = (
  options: UseAutoTranslationOptions
): UseAutoTranslationReturn => {
  const {
    sourcePrompt,
    enabled,
    autoTranslate,
    debounceMs,
    target,
    onTranslate,
    onError,
    setIsTranslating
  } = options;

  const { settings } = useSettings();
  const { selectedModel, translatorType } = settings;
  const { onTranslateSuccess } = usePromptContext();

  // Abort management
  const abortManager = createAbortManager();

  // Debounce timer
  const debounceTimer = createDebounceTimer();

  // Skip flag to prevent auto-translation after manual reverse translation
  const skipNextRef = useRef<boolean>(false);

  /**
   * Auto-translation effect (English → Japanese)
   * Executes translation after debounce when sourcePrompt changes
   */
  useEffect(() => {
    // Do nothing if translation is disabled or auto-translate is off
    if (!enabled || !autoTranslate) {
      return;
    }

    // Skip this auto-translation if it was triggered by manual reverse translation
    if (skipNextRef.current) {
      skipNextRef.current = false;
      return;
    }

    // Clear translation result if source is empty
    if (!sourcePrompt.trim()) {
      onTranslate('');
      onError(null);
      return;
    }

    // Clear existing timer and abort in-progress translation
    debounceTimer.clear();
    abortManager.abort();

    // Debounce processing
    debounceTimer.set(async () => {
      // Reset cancel flag for new translation request
      abortManager.reset();

      setIsTranslating(true);
      onError(null);

      try {
        // Call translation service with selected model and translator type
        const result = await translateText(sourcePrompt, 'en-to-ja', selectedModel, translatorType);

        // Check if not canceled during translation
        if (!abortManager.isAborted()) {
          onTranslate(result);

          // Trigger category mode after successful auto-translation
          onTranslateSuccess();
        }
      } catch (err: unknown) {
        // Set error only if not canceled
        if (!abortManager.isAborted()) {
          const errorMessage = extractErrorMessage(err, '翻訳中にエラーが発生しました');
          onError(errorMessage);
          console.error(`Translation error (${target} en-to-ja):`, err);
        }
      } finally {
        // Clear loading state only if not canceled
        if (!abortManager.isAborted()) {
          setIsTranslating(false);
        }
      }
    }, debounceMs);

    // Cleanup function
    return () => {
      debounceTimer.clear();
      abortManager.abort();
    };
  }, [
    sourcePrompt,
    debounceMs,
    enabled,
    autoTranslate,
    selectedModel,
    translatorType,
    target,
    onTranslate,
    onError,
    setIsTranslating,
    onTranslateSuccess,
    abortManager,
    debounceTimer
  ]);

  /**
   * Set skip flag to prevent next auto-translation
   * Used after manual reverse translation to avoid loops
   */
  const skipNext = (): void => {
    skipNextRef.current = true;
  };

  return { skipNext };
};
