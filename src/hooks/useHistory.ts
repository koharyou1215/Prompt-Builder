/**
 * History Management Custom Hook
 *
 * Features:
 * - Save current prompt as history snapshot
 * - Load history entry to current prompt
 * - Delete history entry
 * - List all history entries
 */

import { useState, useEffect, useCallback } from 'react';
import { usePromptContext } from '../contexts/PromptContext';
import type { HistoryEntry, PromptState } from '../types';
import { StorageKeys } from '../types';
import { loadFromStorage, saveToStorage } from '../services/storageService';
import { generateHistoryId } from '../utils/id';

/**
 * useHistory hook return type
 */
interface UseHistoryReturn {
  /** History entries list */
  readonly history: ReadonlyArray<HistoryEntry>;

  /** Save current prompt to history with Japanese translations */
  saveToHistory: (positiveJa: string, negativeJa: string, name?: string) => Promise<void>;

  /** Load history entry to current prompt */
  loadFromHistory: (id: string) => void;

  /** Delete history entry */
  deleteFromHistory: (id: string) => Promise<void>;

  /** Clear all history */
  clearHistory: () => Promise<void>;

  /** Loading state */
  readonly isLoading: boolean;

  /** Error message */
  readonly error: string | null;
}

/**
 * History management hook
 *
 * Manages prompt history using Chrome Storage API.
 * Provides save, load, delete, and list functionality.
 *
 * @returns History management functions and state
 *
 * @example
 * ```tsx
 * const { history, saveToHistory, loadFromHistory } = useHistory();
 *
 * // Save current prompt
 * await saveToHistory('My favorite prompt');
 *
 * // Load from history
 * loadFromHistory(historyEntry.id);
 * ```
 */
export const useHistory = (): UseHistoryReturn => {
  const { promptState, setPromptState } = usePromptContext();

  const [history, setHistory] = useState<ReadonlyArray<HistoryEntry>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load history from storage on mount
   */
  useEffect(() => {
    const loadHistory = async (): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await loadFromStorage<ReadonlyArray<HistoryEntry>>(
          StorageKeys.HISTORY
        );

        if (response.success && response.data) {
          setHistory(response.data);
        } else {
          setHistory([]);
        }
      } catch (err) {
        const errorMessage = err instanceof Error
          ? err.message
          : '履歴の読み込みに失敗しました';
        setError(errorMessage);
        console.error('Failed to load history:', err);
      } finally {
        setIsLoading(false);
      }
    };

    void loadHistory();
  }, []);

  /**
   * Save current prompt to history with Japanese translations
   */
  const saveToHistory = useCallback(async (
    positiveJa: string,
    negativeJa: string,
    name?: string
  ): Promise<void> => {
    setError(null);

    try {
      // Don't save empty prompts
      if (!promptState.positive.trim() && !promptState.negative.trim()) {
        console.warn('Cannot save empty prompt to history');
        return;
      }

      // Create new history entry
      const newEntry: HistoryEntry = {
        id: generateHistoryId(),
        positive: promptState.positive,
        negative: promptState.negative,
        positiveJa,
        negativeJa,
        timestamp: Date.now(),
        name
      };

      // Add to history (newest first)
      const updatedHistory = [newEntry, ...history];

      // Save to storage
      const response = await saveToStorage(StorageKeys.HISTORY, updatedHistory);

      if (response.success) {
        setHistory(updatedHistory);
      } else {
        throw new Error(response.error?.message || '履歴の保存に失敗しました');
      }
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message
        : '履歴の保存に失敗しました';
      setError(errorMessage);
      console.error('Failed to save to history:', err);
      throw err;
    }
  }, [promptState, history]);

  /**
   * Load history entry to current prompt
   */
  const loadFromHistory = useCallback((id: string): void => {
    const entry = history.find((h) => h.id === id);

    if (!entry) {
      setError('履歴エントリが見つかりません');
      return;
    }

    // Update current prompt state
    const newPromptState: PromptState = {
      positive: entry.positive,
      negative: entry.negative
    };

    setPromptState(newPromptState);
    setError(null);
  }, [history, setPromptState]);

  /**
   * Delete history entry
   */
  const deleteFromHistory = useCallback(async (id: string): Promise<void> => {
    setError(null);

    try {
      // Remove entry from history
      const updatedHistory = history.filter((h) => h.id !== id);

      // Save to storage
      const response = await saveToStorage(StorageKeys.HISTORY, updatedHistory);

      if (response.success) {
        setHistory(updatedHistory);
      } else {
        throw new Error(response.error?.message || '履歴の削除に失敗しました');
      }
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message
        : '履歴の削除に失敗しました';
      setError(errorMessage);
      console.error('Failed to delete from history:', err);
      throw err;
    }
  }, [history]);

  /**
   * Clear all history
   */
  const clearHistory = useCallback(async (): Promise<void> => {
    setError(null);

    try {
      const response = await saveToStorage(StorageKeys.HISTORY, []);

      if (response.success) {
        setHistory([]);
      } else {
        throw new Error(response.error?.message || '履歴のクリアに失敗しました');
      }
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message
        : '履歴のクリアに失敗しました';
      setError(errorMessage);
      console.error('Failed to clear history:', err);
      throw err;
    }
  }, []);

  return {
    history,
    saveToHistory,
    loadFromHistory,
    deleteFromHistory,
    clearHistory,
    isLoading,
    error
  };
};
