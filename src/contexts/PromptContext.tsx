/**
 * Prompt Context for Global State Management
 *
 * Features:
 * - Auto-save to Chrome Storage
 * - Type-safe state management
 * - Performance optimization with useMemo/useCallback
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect
} from 'react';
import type {
  PromptState,
  PromptTarget,
  PromptMode,
  CategorizedPromptState,
  CategoryGroup,
  CategorizedKeywordItem,
} from '../types';
import { StorageKeys } from '../types';
import { loadFromStorage, saveToStorage } from '../services/storageService';
import { PromptParser } from '../utils/promptParser';
import { PromptBuilder } from '../utils/promptBuilder';
import { useCustomKeywords } from '../hooks/useCustomKeywords';
import { keywordCategories } from '../data/keywords';
import { createScopedLogger } from '../utils/logger';

/**
 * PromptContext value type
 */
interface PromptContextValue {
  // ===== Existing Text Mode =====
  /** Current prompt state (read-only) */
  readonly promptState: PromptState;

  /** Update prompt (generic function) */
  updatePrompt: (target: PromptTarget, value: string) => void;

  /** Update positive prompt */
  setPositivePrompt: (value: string) => void;

  /** Update negative prompt */
  setNegativePrompt: (value: string) => void;

  /** Update positive Japanese translation */
  setPositiveJa: (value: string) => void;

  /** Update negative Japanese translation */
  setNegativeJa: (value: string) => void;

  /** Set entire prompt state (for restoring from history) */
  setPromptState: (state: PromptState) => void;

  /** Reset prompt to default */
  resetPrompt: () => void;

  /** Append keyword to existing prompt */
  appendKeyword: (target: PromptTarget, keyword: string) => void;

  /** Loading state */
  readonly isLoading: boolean;

  // ===== New Category Mode =====
  /** Current mode (text or category) */
  readonly mode: PromptMode;

  /** Switch between text and category mode */
  switchMode: (newMode: PromptMode) => void;

  /** Current category state */
  readonly categoryState: CategorizedPromptState;

  /** Add keyword to specific category */
  addKeywordToCategory: (
    target: PromptTarget,
    categoryName: string,
    keyword: string,
    ja: string,
    weight?: string
  ) => void;

  /** Remove keyword from specific category */
  removeKeywordFromCategory: (
    target: PromptTarget,
    categoryName: string,
    keyword: string
  ) => void;

  /** Sync from text to category */
  syncFromText: (target: PromptTarget) => void;

  /** Called after translation success */
  onTranslateSuccess: () => void;

  // ===== Original Prompt Management =====
  /** Set original prompt (before reverse translation) */
  setOriginalPrompt: (target: PromptTarget, value: string) => void;

  /** Restore original prompt (undo reverse translation) */
  restoreOriginal: (target: PromptTarget) => void;

  /** Check if original prompt exists */
  hasOriginal: (target: PromptTarget) => boolean;
}

/**
 * Default prompt state
 */
const defaultPromptState: PromptState = {
  positive: '',
  negative: '',
  positiveJa: '',
  negativeJa: ''
};

/**
 * Default category state
 */
const defaultCategoryState: CategorizedPromptState = {
  positive: [],
  negative: [],
  uncategorized: []
};

/**
 * Logger instance
 */
const logger = createScopedLogger('PromptContext');

/**
 * Create PromptContext
 * Initial value is undefined to detect usage outside Provider
 */
const PromptContext = createContext<PromptContextValue | undefined>(undefined);

/**
 * PromptProvider Props
 */
interface PromptProviderProps {
  readonly children: React.ReactNode;
}

/**
 * PromptProvider Component
 * Manages application-wide prompt state
 */
export const PromptProvider: React.FC<PromptProviderProps> = ({ children }) => {
  const [promptState, setPromptStateInternal] = useState<PromptState>(defaultPromptState);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [mode, setMode] = useState<PromptMode>('text');
  const [categoryState, setCategoryState] = useState<CategorizedPromptState>(defaultCategoryState);

  // Get custom keywords for parser
  const { customKeywords } = useCustomKeywords();

  // Create parser and builder instances (memoized)
  const parser = useMemo(
    () => new PromptParser(keywordCategories, customKeywords),
    [customKeywords]
  );

  const builder = useMemo(() => new PromptBuilder(), []);

  /**
   * Initialize: Load auto-saved prompt from storage
   */
  useEffect(() => {
    const initializePromptState = async (): Promise<void> => {
      setIsLoading(true);
      try {
        const response = await loadFromStorage<PromptState>(StorageKeys.AUTO_SAVE);

        if (response.success && response.data) {
          setPromptStateInternal(response.data);
        } else {
          // Use default if no data in storage
          setPromptStateInternal(defaultPromptState);
        }
      } catch (error) {
        logger.error('Failed to load prompt state from storage', error);
        setPromptStateInternal(defaultPromptState);
      } finally {
        setIsLoading(false);
      }
    };

    void initializePromptState();
  }, []);

  /**
   * Auto-save whenever prompt state changes
   */
  useEffect(() => {
    // Don't save during initial loading
    if (isLoading) {
      return;
    }

    const autoSave = async (): Promise<void> => {
      try {
        await saveToStorage(StorageKeys.AUTO_SAVE, promptState);
      } catch (error) {
        logger.error('Failed to auto-save prompt state', error);
      }
    };

    void autoSave();
  }, [promptState, isLoading]);

  /**
   * Generic prompt update function
   */
  const updatePrompt = useCallback((target: PromptTarget, value: string): void => {
    setPromptStateInternal((prevState) => ({
      ...prevState,
      [target]: value
    }));
  }, []);

  /**
   * Update positive prompt
   */
  const setPositivePrompt = useCallback((value: string): void => {
    updatePrompt('positive', value);
  }, [updatePrompt]);

  /**
   * Update negative prompt
   */
  const setNegativePrompt = useCallback((value: string): void => {
    updatePrompt('negative', value);
  }, [updatePrompt]);

  /**
   * Update positive Japanese translation
   */
  const setPositiveJa = useCallback((value: string): void => {
    setPromptStateInternal((prevState) => ({
      ...prevState,
      positiveJa: value
    }));
  }, []);

  /**
   * Update negative Japanese translation
   */
  const setNegativeJa = useCallback((value: string): void => {
    setPromptStateInternal((prevState) => ({
      ...prevState,
      negativeJa: value
    }));
  }, []);

  /**
   * Set entire prompt state
   * Used when restoring from history
   */
  const setPromptState = useCallback((state: PromptState): void => {
    setPromptStateInternal(state);
  }, []);

  /**
   * Reset prompt to default
   */
  const resetPrompt = useCallback((): void => {
    setPromptStateInternal(defaultPromptState);
  }, []);

  /**
   * Append keyword with comma separator
   */
  const appendKeyword = useCallback((target: PromptTarget, keyword: string): void => {
    setPromptStateInternal((prevState) => {
      const currentValue = prevState[target].trim();

      // Append with comma separator if existing content exists
      const newValue = currentValue
        ? `${currentValue}, ${keyword}`
        : keyword;

      return {
        ...prevState,
        [target]: newValue
      };
    });
  }, []);

  // ===== Original Prompt Management =====

  /**
   * Set original prompt (before reverse translation)
   */
  const setOriginalPrompt = useCallback((target: PromptTarget, value: string): void => {
    setPromptStateInternal((prevState) => ({
      ...prevState,
      ...(target === 'positive'
        ? { originalPositive: value }
        : { originalNegative: value }
      )
    }));
    logger.info(`Original ${target} prompt saved: "${value.substring(0, 50)}..."`);
  }, []);

  /**
   * Restore original prompt (undo reverse translation)
   */
  const restoreOriginal = useCallback((target: PromptTarget): void => {
    setPromptStateInternal((prevState) => {
      const original = target === 'positive'
        ? prevState.originalPositive
        : prevState.originalNegative;

      if (!original) {
        logger.warn(`No original ${target} prompt to restore`);
        return prevState;
      }

      logger.info(`Restoring original ${target} prompt: "${original.substring(0, 50)}..."`);

      return {
        ...prevState,
        [target]: original,
        // Clear the original after restoring
        ...(target === 'positive'
          ? { originalPositive: undefined }
          : { originalNegative: undefined }
        )
      };
    });
  }, []);

  /**
   * Check if original prompt exists
   */
  const hasOriginal = useCallback((target: PromptTarget): boolean => {
    const original = target === 'positive'
      ? promptState.originalPositive
      : promptState.originalNegative;
    return !!original && original.trim().length > 0;
  }, [promptState]);

  // ===== Category Mode Functions =====

  /**
   * Sync from text to category
   * Only updates the specified target, preserving the other target's state
   */
  const syncFromText = useCallback(
    (target: PromptTarget): void => {
      const text = promptState[target];

      logger.debug('syncFromText START', {
        target,
        positiveLength: promptState.positive.length,
        negativeLength: promptState.negative.length,
        textLength: text.length
      });

      const parsed = parser.parse(text, target);

      logger.debug('syncFromText parsed', {
        positiveCategories: parsed.positive.length,
        negativeCategories: parsed.negative.length,
        uncategorizedCount: parsed.uncategorized.length
      });

      // Merge with existing state instead of replacing
      setCategoryState((prev) => {
        const newState = {
          ...prev,
          [target]: parsed[target],
          // Only update uncategorized if parsing positive prompt
          ...(target === 'positive' ? { uncategorized: parsed.uncategorized } : {}),
        };

        logger.debug('syncFromText END', {
          prevCategoriesCount: target === 'positive' ? prev.positive.length : prev.negative.length,
          newCategoriesCount: target === 'positive' ? newState.positive.length : newState.negative.length
        });

        return newState;
      });
    },
    [promptState, parser]
  );

  /**
   * Switch between text and category mode
   */
  const switchMode = useCallback(
    (newMode: PromptMode): void => {
      if (newMode === 'category' && mode === 'text') {
        // Switching to category mode: parse ONLY positive prompt
        // Negative prompt remains in text mode (template-based)
        syncFromText('positive');
      } else if (newMode === 'text' && mode === 'category') {
        // Switching to text mode: rebuild ONLY positive prompt from categories
        // Negative prompt is not affected
        const positive = builder.build(categoryState, 'positive');
        setPromptStateInternal((prev) => ({
          ...prev,
          positive,
        }));
      }
      setMode(newMode);
    },
    [mode, categoryState, builder, syncFromText]
  );

  /**
   * Auto-sync when custom keywords change in category mode
   */
  useEffect(() => {
    if (mode === 'category') {
      // Re-parse ONLY positive prompt when custom keywords are updated
      // Negative prompt is not affected by category mode
      syncFromText('positive');
    }
  }, [customKeywords, mode, syncFromText]);

  /**
   * Add keyword to specific category
   */
  const addKeywordToCategory = useCallback(
    (
      target: PromptTarget,
      categoryName: string,
      keyword: string,
      ja: string,
      weight?: string
    ): void => {
      setCategoryState((prev) => {
        const targetGroups = target === 'positive' ? prev.positive : prev.negative;

        // Find category
        const categoryIndex = targetGroups.findIndex((g) => g.categoryName === categoryName);

        if (categoryIndex === -1) {
          // Category doesn't exist, create new one
          const newCategory: CategoryGroup = {
            categoryName,
            keywords: [
              {
                keyword,
                ja,
                categoryName,
                isCustom: true,
                order: 0,
                weight,
              },
            ],
            isExpanded: true,
          };

          return target === 'positive'
            ? { ...prev, positive: [...prev.positive, newCategory] }
            : { ...prev, negative: [...prev.negative, newCategory] };
        } else {
          // Category exists, add keyword
          const updatedGroups = [...targetGroups];
          const category = updatedGroups[categoryIndex];

          // Type guard: ensure category exists
          if (!category) {
            return prev;
          }

          // Check if keyword already exists
          const keywordExists = category.keywords.some(
            (kw) => kw.keyword.toLowerCase() === keyword.toLowerCase()
          );

          if (keywordExists) {
            return prev; // Don't add duplicate
          }

          const newKeyword: CategorizedKeywordItem = {
            keyword,
            ja,
            categoryName,
            isCustom: true,
            order: category.keywords.length,
            weight,
          };

          updatedGroups[categoryIndex] = {
            ...category,
            keywords: [...category.keywords, newKeyword],
          };

          return target === 'positive'
            ? { ...prev, positive: updatedGroups }
            : { ...prev, negative: updatedGroups };
        }
      });

      // Sync back to text
      const updated = builder.build(categoryState, target);
      updatePrompt(target, updated);
    },
    [categoryState, builder, updatePrompt]
  );

  /**
   * Remove keyword from specific category
   */
  const removeKeywordFromCategory = useCallback(
    (target: PromptTarget, categoryName: string, keyword: string): void => {
      setCategoryState((prev) => {
        const targetGroups = target === 'positive' ? prev.positive : prev.negative;

        const updatedGroups = targetGroups
          .map((category) => {
            if (category.categoryName !== categoryName) {
              return category;
            }

            // Remove keyword
            const updatedKeywords = category.keywords.filter(
              (kw) => kw.keyword.toLowerCase() !== keyword.toLowerCase()
            );

            // If category becomes empty, remove it
            if (updatedKeywords.length === 0) {
              return null;
            }

            return {
              ...category,
              keywords: updatedKeywords,
            };
          })
          .filter((cat): cat is CategoryGroup => cat !== null);

        const updated =
          target === 'positive'
            ? { ...prev, positive: updatedGroups }
            : { ...prev, negative: updatedGroups };

        // Sync back to text
        const text = builder.build(updated, target);
        updatePrompt(target, text);

        return updated;
      });
    },
    [builder, updatePrompt]
  );

  /**
   * Called after translation success
   * Auto-parse ONLY positive prompt for category data preparation
   * Negative prompt remains as-is in text mode
   *
   * IMPORTANT: Does NOT auto-switch to category mode anymore
   * User must manually switch via UI button (UX improvement)
   */
  const onTranslateSuccess = useCallback((): void => {
    syncFromText('positive');
    // setMode('category'); // REMOVED: Auto-switch disabled to respect user mode preference
  }, [syncFromText]);

  /**
   * Memoize context value for performance optimization
   */
  const contextValue = useMemo<PromptContextValue>(
    () => ({
      // Existing text mode
      promptState,
      updatePrompt,
      setPositivePrompt,
      setNegativePrompt,
      setPositiveJa,
      setNegativeJa,
      setPromptState,
      resetPrompt,
      appendKeyword,
      isLoading,
      // New category mode
      mode,
      switchMode,
      categoryState,
      addKeywordToCategory,
      removeKeywordFromCategory,
      syncFromText,
      onTranslateSuccess,
      // Original prompt management
      setOriginalPrompt,
      restoreOriginal,
      hasOriginal,
    }),
    [
      // Existing text mode
      promptState,
      updatePrompt,
      setPositivePrompt,
      setNegativePrompt,
      setPositiveJa,
      setNegativeJa,
      setPromptState,
      resetPrompt,
      appendKeyword,
      isLoading,
      // New category mode
      mode,
      switchMode,
      categoryState,
      addKeywordToCategory,
      removeKeywordFromCategory,
      syncFromText,
      onTranslateSuccess,
      // Original prompt management
      setOriginalPrompt,
      restoreOriginal,
      hasOriginal,
    ]
  );

  return (
    <PromptContext.Provider value={contextValue}>
      {children}
    </PromptContext.Provider>
  );
};

/**
 * Custom hook to use PromptContext
 * Throws error when used outside Provider for safety
 */
export const usePromptContext = (): PromptContextValue => {
  const context = useContext(PromptContext);

  if (context === undefined) {
    throw new Error('usePromptContext must be used within a PromptProvider');
  }

  return context;
};

/**
 * Optimized hook to get only positive prompt value
 */
export const usePositivePrompt = (): string => {
  const { promptState } = usePromptContext();
  return promptState.positive;
};

/**
 * Optimized hook to get only negative prompt value
 */
export const useNegativePrompt = (): string => {
  const { promptState } = usePromptContext();
  return promptState.negative;
};
