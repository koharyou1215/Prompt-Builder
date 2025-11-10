/**
 * One-Way Auto-Translation Custom Hook (Refactored)
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
 *
 * Refactored: Extracted helper hooks for better code organization.
 */

import { useCallback, useEffect } from 'react';
import { usePromptContext } from '../contexts/PromptContext';
import { useSettings } from '../contexts/SettingsContext';
import { translateText } from '../services/translationService';
import type { PromptTarget } from '../types';
import { TRANSLATION_DEBOUNCE_MS } from '../constants';
import { createScopedLogger } from '../utils/logger';
import { useTranslationState } from './translation/useTranslationState';
import { useAutoTranslation } from './translation/useAutoTranslation';
import { createAbortManager, extractErrorMessage } from './translation/translationHelpers';

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
 * Core one-way auto-translation implementation (Refactored)
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

  // Get settings (auto-translate, model selection, translator type)
  const { settings } = useSettings();
  const { autoTranslate, selectedModel, translatorType } = settings;

  // Get context functions
  const { updatePrompt, setOriginalPrompt, hasOriginal } = usePromptContext();

  // Get translation state
  const state = useTranslationState(target);
  const {
    translatedText,
    setTranslatedText,
    isTranslating,
    setIsTranslating,
    error,
    setError,
    setJaPrompt,
    sourcePrompt
  } = state;

  // Auto-translation with debounce
  const autoTranslation = useAutoTranslation({
    sourcePrompt,
    enabled,
    autoTranslate,
    debounceMs,
    target,
    onTranslate: (result: string) => {
      setTranslatedText(result);
      setJaPrompt(result);
    },
    onError: setError,
    setIsTranslating
  });

  // Abort manager for manual translations
  const jaToEnAbortManager = createAbortManager();

  /**
   * Japanese text change handler
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

    // Cancel in-progress reverse translation
    jaToEnAbortManager.abort();

    // NOTE: We do NOT auto-translate Japanese → English to prevent loops
    // Users can use the manual "日→英" button instead
  }, [setJaPrompt, setTranslatedText, setError, jaToEnAbortManager]);

  /**
   * Manual translation trigger English → Japanese (for when auto-translate is disabled)
   */
  const manualTranslate = useCallback(async (): Promise<void> => {
    if (!sourcePrompt.trim()) {
      setTranslatedText('');
      setJaPrompt('');
      return;
    }

    setIsTranslating(true);
    setError(null);

    try {
      const result = await translateText(sourcePrompt, 'en-to-ja', selectedModel, translatorType);
      setTranslatedText(result);
      setJaPrompt(result);
    } catch (err: unknown) {
      const errorMessage = extractErrorMessage(err, '翻訳中にエラーが発生しました');
      setError(errorMessage);
      console.error(`Manual translation error (${target}):`, err);
    } finally {
      setIsTranslating(false);
    }
  }, [sourcePrompt, selectedModel, translatorType, target, setJaPrompt, setTranslatedText, setError, setIsTranslating]);

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

    jaToEnAbortManager.reset();
    setIsTranslating(true);
    setError(null);

    try {
      const result = await translateText(translatedText, 'ja-to-en', selectedModel, translatorType);

      if (!jaToEnAbortManager.isAborted()) {
        // Set flag to skip the next auto-translation triggered by updatePrompt
        autoTranslation.skipNext();

        // Update Context source (English)
        updatePrompt(target, result);

        logger.info(`Reverse translation completed for ${target}`);
      }
    } catch (err: unknown) {
      if (!jaToEnAbortManager.isAborted()) {
        const errorMessage = extractErrorMessage(err, '逆翻訳中にエラーが発生しました');
        setError(errorMessage);
        console.error(`Manual reverse translation error (${target}):`, err);
      }
    } finally {
      if (!jaToEnAbortManager.isAborted()) {
        setIsTranslating(false);
      }
    }
  }, [
    translatedText,
    selectedModel,
    translatorType,
    target,
    updatePrompt,
    sourcePrompt,
    hasOriginal,
    setOriginalPrompt,
    jaToEnAbortManager,
    autoTranslation,
    setError,
    setIsTranslating
  ]);

  /**
   * Cleanup on component unmount
   */
  useEffect(() => {
    return () => {
      jaToEnAbortManager.abort();
    };
  }, [jaToEnAbortManager]);

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
 * // Manual reverse translation button (Japanese → English)
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
 * Same features as useTranslation() but for negative prompt.
 *
 * @param options - Hook options
 * @returns Translation result and control functions
 */
export const useNegativeTranslation = (
  options: UseTranslationOptions = {}
): UseTranslationReturn => {
  return useBidirectionalTranslationCore('negative', options);
};
