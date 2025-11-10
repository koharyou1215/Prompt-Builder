/**
 * Translation State Management Hook
 *
 * Manages translation state for a specific prompt target.
 * Extracted from useTranslation.ts for better separation of concerns.
 */

import { useState, useEffect } from 'react';
import { usePromptContext } from '../../contexts/PromptContext';
import type { PromptTarget } from '../../types';

/**
 * Translation state hook return type
 */
export interface TranslationState {
  readonly translatedText: string;
  setTranslatedText: (text: string) => void;
  readonly isTranslating: boolean;
  setIsTranslating: (loading: boolean) => void;
  readonly error: string | null;
  setError: (error: string | null) => void;
  setJaPrompt: (text: string) => void;
  readonly sourcePrompt: string;
}

/**
 * Manage translation state for a specific prompt target
 *
 * Handles:
 * - Translated text (Japanese) state
 * - Loading state
 * - Error state
 * - Synchronization with PromptContext
 *
 * @param target - Prompt target ('positive' or 'negative')
 * @returns Translation state and setters
 */
export const useTranslationState = (target: PromptTarget): TranslationState => {
  const {
    promptState,
    setPositiveJa,
    setNegativeJa
  } = usePromptContext();

  // Get source (English) prompt
  const sourcePrompt = promptState[target];

  // Get Japanese setter based on target
  const setJaPrompt = target === 'positive' ? setPositiveJa : setNegativeJa;

  // Get stored Japanese translation from Context
  const storedJaPrompt = target === 'positive' ? promptState.positiveJa : promptState.negativeJa;

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
  }, [storedJaPrompt, translatedText]);

  return {
    translatedText,
    setTranslatedText,
    isTranslating,
    setIsTranslating,
    error,
    setError,
    setJaPrompt,
    sourcePrompt
  };
};
