/**
 * One-Way Auto-Translation Custom Hook (Infinite Loop Prevention)
 *
 * Features:
 * - English → Japanese auto-translation with debounce (when auto-translate is ON)
 * - Japanese → English manual translation (via button click only)
 * - Prevents infinite translation loops by making auto-translation one-way
 * - Cancel processing for race condition prevention
 * - Error handling and loading states
 *
 * Design Decision:
 * Auto-translation only works English → Japanese to prevent infinite loops.
 * When users edit Japanese text, it does NOT automatically translate back to English.
 * This prevents the loop: EN → JA → EN → JA → ...
 *
 * For Japanese → English translation, users must click the "日→英" button.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { usePromptContext } from '../contexts/PromptContext';
import { useSettings } from '../contexts/SettingsContext';
import { translateText } from '../services/translationService';
import type { PromptTarget } from '../types';
import { TranslationError } from '../types';
import { TRANSLATION_DEBOUNCE_MS } from '../constants';
import { createScopedLogger } from '../utils/logger';

const logger = createScopedLogger('useTranslation');

/**
 * useTranslation hook return type
 */
export interface UseTranslationReturn {
  /** Translated text (Japanese) */
  readonly translatedText: string;

  /** Handler for Japanese text change (triggers reverse translation) */
  handleJapaneseChange: (newJapaneseText: string) => void;

  /** Manual translation trigger English → Japanese (for when auto-translate is disabled) */
  manualTranslate: () => Promise<void>;

  /** Manual translation trigger Japanese → English */
  manualTranslateReverse: () => Promise<void>;

  /** Translation in progress flag */
  readonly isTranslating: boolean;

  /** Translation error message (null if no error) */
  readonly error: string | null;
}

/**
 * useTranslation hook options
 */
export interface UseTranslationOptions {
  /** Debounce time in milliseconds (default: from constants) */
  readonly debounceMs?: number;

  /** Enable translation (default: true) */
  readonly enabled?: boolean;
}

/**
 * Core one-way auto-translation implementation
 *
 * Internal hook that handles translation logic for any prompt target.
 * This eliminates code duplication between positive and negative prompts.
 *
 * Auto-translation behavior (when enabled):
 * - English edit → Auto-translates to Japanese ✓
 * - Japanese edit → Does NOT auto-translate to English ✗ (prevents loops)
 *
 * @param target - Prompt target ('positive' or 'negative')
 * @param options - Hook options
 * @returns Translation result and control functions
 */
const useBidirectionalTranslationCore = (
  target: PromptTarget,
  options: UseTranslationOptions = {}
): UseTranslationReturn => {
  const {
    debounceMs = TRANSLATION_DEBOUNCE_MS,
    enabled = true
  } = options;

  // Get source (English) and update function from Context
  const {
    promptState,
    updatePrompt,
    setPositiveJa,
    setNegativeJa,
    onTranslateSuccess,
    setOriginalPrompt,
    hasOriginal
  } = usePromptContext();
  const sourcePrompt = promptState[target];

  // Get Japanese setter based on target
  const setJaPrompt = target === 'positive' ? setPositiveJa : setNegativeJa;

  // Get stored Japanese translation from Context
  const storedJaPrompt = target === 'positive' ? promptState.positiveJa : promptState.negativeJa;

  // Get settings (auto-translate, model selection, translator type, tag organization)
  const { settings } = useSettings();
  const { autoTranslate, selectedModel, translatorType, organizeTagsByCategory } = settings;

  // Translation result (Japanese) state - initialize from Context
  const [translatedText, setTranslatedText] = useState<string>(storedJaPrompt || '');

  // Translation in progress flag
  const [isTranslating, setIsTranslating] = useState<boolean>(false);

  // Error state
  const [error, setError] = useState<string | null>(null);

  // Sync translatedText with Context when it changes
  useEffect(() => {
    if (storedJaPrompt !== undefined && storedJaPrompt !== translatedText) {
      setTranslatedText(storedJaPrompt);
    }
  }, [storedJaPrompt]);

  // Debounce timer references
  const enToJaTimerRef = useRef<number | null>(null);
  const jaToEnTimerRef = useRef<number | null>(null);

  // Abort flags for canceling in-progress requests
  const enToJaAbortRef = useRef<boolean>(false);
  const jaToEnAbortRef = useRef<boolean>(false);

  // Flag to skip next auto-translation after manual reverse translation
  const skipNextAutoTranslateRef = useRef<boolean>(false);

  /**
   * Feature A: English → Japanese translation
   * Executes translation after debounce when sourcePrompt changes
   */
  useEffect(() => {
    // Do nothing if translation is disabled or auto-translate is off
    if (!enabled || !autoTranslate) {
      return;
    }

    // Skip this auto-translation if it was triggered by manual reverse translation
    if (skipNextAutoTranslateRef.current) {
      skipNextAutoTranslateRef.current = false;
      return;
    }

    // Clear translation result if source is empty
    if (!sourcePrompt.trim()) {
      setTranslatedText('');
      setError(null);
      return;
    }

    // Clear existing timer
    if (enToJaTimerRef.current) {
      clearTimeout(enToJaTimerRef.current);
    }

    // Cancel in-progress translation
    enToJaAbortRef.current = true;

    // Debounce processing
    enToJaTimerRef.current = setTimeout(() => {
      const translateEnToJa = async (): Promise<void> => {
        // Reset cancel flag for new translation request
        enToJaAbortRef.current = false;

        setIsTranslating(true);
        setError(null);

        try {
          // Call translation service with selected model and translator type
          const result = await translateText(sourcePrompt, 'en-to-ja', selectedModel, translatorType, organizeTagsByCategory);

          // Check if not canceled during translation
          if (!enToJaAbortRef.current) {
            setTranslatedText(result);
            // Save to Context for persistence
            setJaPrompt(result);

            // Trigger category mode after successful auto-translation
            onTranslateSuccess();
          }
        } catch (err: unknown) {
          // Set error only if not canceled
          if (!enToJaAbortRef.current) {
            let errorMessage = '翻訳中にエラーが発生しました';

            if (err instanceof TranslationError) {
              errorMessage = err.message;
            } else if (err instanceof Error) {
              errorMessage = err.message;
            }

            setError(errorMessage);
            console.error(`Translation error (${target} en-to-ja):`, err);
          }
        } finally {
          // Clear loading state only if not canceled
          if (!enToJaAbortRef.current) {
            setIsTranslating(false);
          }
        }
      };

      void translateEnToJa();
    }, debounceMs);

    // Cleanup function
    return () => {
      if (enToJaTimerRef.current) {
        clearTimeout(enToJaTimerRef.current);
      }
      enToJaAbortRef.current = true;
    };
  }, [sourcePrompt, debounceMs, enabled, autoTranslate, selectedModel, translatorType, target, setJaPrompt, onTranslateSuccess]);

  /**
   * Feature B: Japanese text change handler
   *
   * IMPORTANT: To prevent infinite translation loops, this handler does NOT
   * automatically trigger reverse translation (ja-to-en).
   *
   * Auto-translation is one-way only: English → Japanese
   * For Japanese → English, users must click the manual button.
   */
  const handleJapaneseChange = useCallback((newJapaneseText: string): void => {
    // Immediately reflect in UI (update translation result state)
    setTranslatedText(newJapaneseText);
    // Save to Context for persistence
    setJaPrompt(newJapaneseText);
    setError(null);

    // Clear any pending reverse translation timers
    if (jaToEnTimerRef.current) {
      clearTimeout(jaToEnTimerRef.current);
    }

    // Cancel in-progress reverse translation
    jaToEnAbortRef.current = true;

    // NOTE: We do NOT auto-translate Japanese → English to prevent loops
    // Users can use the manual "日→英" button instead
  }, [setJaPrompt]);

  /**
   * Manual translation trigger English → Japanese (for when auto-translate is disabled)
   */
  const manualTranslate = useCallback(async (): Promise<void> => {
    if (!sourcePrompt.trim()) {
      setTranslatedText('');
      setJaPrompt('');
      return;
    }

    enToJaAbortRef.current = false;
    setIsTranslating(true);
    setError(null);

    try {
      const result = await translateText(sourcePrompt, 'en-to-ja', selectedModel, translatorType, organizeTagsByCategory);

      if (!enToJaAbortRef.current) {
        setTranslatedText(result);
        // Save to Context for persistence
        setJaPrompt(result);

        // Trigger category mode after successful translation
        onTranslateSuccess();
      }
    } catch (err: unknown) {
      if (!enToJaAbortRef.current) {
        let errorMessage = '翻訳中にエラーが発生しました';

        if (err instanceof TranslationError) {
          errorMessage = err.message;
        } else if (err instanceof Error) {
          errorMessage = err.message;
        }

        setError(errorMessage);
        console.error(`Manual translation error (${target}):`, err);
      }
    } finally {
      if (!enToJaAbortRef.current) {
        setIsTranslating(false);
      }
    }
  }, [sourcePrompt, selectedModel, translatorType, target, setJaPrompt, onTranslateSuccess]);

  /**
   * Manual translation trigger Japanese → English
   *
   * Enhancement: Automatically saves original English text before first reverse translation
   */
  const manualTranslateReverse = useCallback(async (): Promise<void> => {
    if (!translatedText.trim()) {
      updatePrompt(target, '');
      return;
    }

    // Save original English prompt before first reverse translation
    if (!hasOriginal(target) && sourcePrompt.trim()) {
      logger.info(`Saving original ${target} prompt before reverse translation`);
      setOriginalPrompt(target, sourcePrompt);
    }

    jaToEnAbortRef.current = false;
    setIsTranslating(true);
    setError(null);

    try {
      const result = await translateText(translatedText, 'ja-to-en', selectedModel, translatorType, organizeTagsByCategory);

      if (!jaToEnAbortRef.current) {
        // Set flag to skip the next auto-translation triggered by updatePrompt
        skipNextAutoTranslateRef.current = true;

        // Update Context source (English)
        updatePrompt(target, result);

        logger.info(`Reverse translation completed for ${target}`);
      }
    } catch (err: unknown) {
      if (!jaToEnAbortRef.current) {
        let errorMessage = '逆翻訳中にエラーが発生しました';

        if (err instanceof TranslationError) {
          errorMessage = err.message;
        } else if (err instanceof Error) {
          errorMessage = err.message;
        }

        setError(errorMessage);
        console.error(`Manual reverse translation error (${target}):`, err);
      }
    } finally {
      if (!jaToEnAbortRef.current) {
        setIsTranslating(false);
      }
    }
  }, [translatedText, selectedModel, translatorType, target, updatePrompt, sourcePrompt, hasOriginal, setOriginalPrompt]);

  /**
   * Cleanup timers on component unmount
   */
  useEffect(() => {
    return () => {
      if (enToJaTimerRef.current) {
        clearTimeout(enToJaTimerRef.current);
      }
      if (jaToEnTimerRef.current) {
        clearTimeout(jaToEnTimerRef.current);
      }
      enToJaAbortRef.current = true;
      jaToEnAbortRef.current = true;
    };
  }, []);

  return {
    translatedText,
    handleJapaneseChange,
    manualTranslate,
    manualTranslateReverse,
    isTranslating,
    error
  };
};

/**
 * One-way auto-translation hook for positive prompt
 *
 * Translation features:
 * 1. English → Japanese: AUTO (when auto-translate is ON)
 * 2. Japanese → English: MANUAL only (via manualTranslateReverse button)
 *
 * This design prevents infinite translation loops that occur when:
 * EN → JA → slightly different JA → EN → slightly different EN → JA → ...
 *
 * @param options - Hook options
 * @returns Translation result and control functions
 *
 * @example
 * ```tsx
 * const {
 *   translatedText,
 *   handleJapaneseChange,
 *   manualTranslate,
 *   manualTranslateReverse,
 *   isTranslating
 * } = useTranslation();
 *
 * // Japanese textarea (user can edit freely)
 * <textarea
 *   value={translatedText}
 *   onChange={(e) => handleJapaneseChange(e.target.value)}
 * />
 *
 * // Manual reverse translation button
 * <button onClick={manualTranslateReverse}>日→英</button>
 * ```
 */
export const useTranslation = (
  options: UseTranslationOptions = {}
): UseTranslationReturn => {
  return useBidirectionalTranslationCore('positive', options);
};

/**
 * One-way auto-translation hook for negative prompt
 *
 * Provides same functionality as useTranslation but for negative prompt.
 * See useTranslation documentation for details on one-way auto-translation behavior.
 *
 * @param options - Hook options
 * @returns Translation result and control functions
 *
 * @example
 * ```tsx
 * const {
 *   translatedText,
 *   handleJapaneseChange,
 *   manualTranslateReverse
 * } = useNegativeTranslation();
 *
 * <textarea
 *   value={translatedText}
 *   onChange={(e) => handleJapaneseChange(e.target.value)}
 * />
 * <button onClick={manualTranslateReverse}>日→英</button>
 * ```
 */
export const useNegativeTranslation = (
  options: UseTranslationOptions = {}
): UseTranslationReturn => {
  return useBidirectionalTranslationCore('negative', options);
};
