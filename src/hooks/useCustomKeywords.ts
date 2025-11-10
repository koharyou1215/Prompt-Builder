/**
 * Custom Keywords Management Hook
 *
 * Features:
 * - Add user-defined keywords to categories
 * - Load custom keywords from Chrome Storage
 * - Edit and delete both custom and default keywords
 * - Merge with default keywords, applying overrides and hidden keywords
 * - Reorder categories
 */

import { useState, useEffect, useCallback } from 'react';
import type { CustomKeyword, KeywordCategory, Keyword, KeywordOverride, HiddenKeyword } from '../types';
import { StorageKeys } from '../types';
import { keywordCategories } from '../data/keywords';
import { generateCustomKeywordId } from '../utils/id';

/**
 * useCustomKeywords hook return type
 */
interface UseCustomKeywordsReturn {
  /** All keyword categories (default + custom merged, with overrides applied) */
  readonly allCategories: ReadonlyArray<KeywordCategory>;

  /** Custom keywords only */
  readonly customKeywords: ReadonlyArray<CustomKeyword>;

  /** Add new custom keyword */
  addKeyword: (categoryName: string, ja: string, en: string) => Promise<void>;

  /** Update keyword (custom or default) */
  updateKeyword: (categoryName: string, originalEn: string, ja: string, en: string, newCategoryName?: string) => Promise<void>;

  /** Delete keyword (custom or default) */
  deleteKeyword: (categoryName: string, en: string) => Promise<void>;

  /** Check if a keyword is custom (user-added) */
  isCustomKeyword: (categoryName: string, en: string) => boolean;

  /** Reorder categories */
  reorderCategories: (newOrder: ReadonlyArray<string>) => Promise<void>;

  /** Move category up in order */
  moveCategoryUp: (categoryName: string) => Promise<void>;

  /** Move category down in order */
  moveCategoryDown: (categoryName: string) => Promise<void>;

  /** Loading state */
  readonly isLoading: boolean;

  /** Error message */
  readonly error: string | null;
}

/**
 * Custom keywords management hook
 *
 * Manages user-defined keywords, storing them in Chrome Storage
 * and merging with default keywords for display.
 *
 * @example
 * ```tsx
 * const { allCategories, addKeyword } = useCustomKeywords();
 *
 * // Add keyword
 * await addKeyword('キャラクター基本', '魔法使い', 'wizard');
 * ```
 */
export const useCustomKeywords = (): UseCustomKeywordsReturn => {
  const [customKeywords, setCustomKeywords] = useState<ReadonlyArray<CustomKeyword>>([]);
  const [keywordOverrides, setKeywordOverrides] = useState<ReadonlyArray<KeywordOverride>>([]);
  const [hiddenKeywords, setHiddenKeywords] = useState<ReadonlyArray<HiddenKeyword>>([]);
  const [categoryOrder, setCategoryOrder] = useState<ReadonlyArray<string>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load all keyword data from Chrome Storage
   */
  const loadCustomKeywords = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await chrome.storage.local.get([
        StorageKeys.CUSTOM_KEYWORDS,
        StorageKeys.KEYWORD_OVERRIDES,
        StorageKeys.HIDDEN_KEYWORDS,
        StorageKeys.CATEGORY_ORDER
      ]);

      const keywords = result[StorageKeys.CUSTOM_KEYWORDS] as CustomKeyword[] | undefined;
      const overrides = result[StorageKeys.KEYWORD_OVERRIDES] as KeywordOverride[] | undefined;
      const hidden = result[StorageKeys.HIDDEN_KEYWORDS] as HiddenKeyword[] | undefined;
      const order = result[StorageKeys.CATEGORY_ORDER] as string[] | undefined;

      setCustomKeywords(keywords && Array.isArray(keywords) ? keywords : []);
      setKeywordOverrides(overrides && Array.isArray(overrides) ? overrides : []);
      setHiddenKeywords(hidden && Array.isArray(hidden) ? hidden : []);
      setCategoryOrder(order && Array.isArray(order) ? order : []);
    } catch (err) {
      console.error('Failed to load keyword data:', err);
      setError('キーワードデータの読み込みに失敗しました');
      setCustomKeywords([]);
      setKeywordOverrides([]);
      setHiddenKeywords([]);
      setCategoryOrder([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Initial load on mount
   */
  useEffect(() => {
    void loadCustomKeywords();
  }, [loadCustomKeywords]);

  /**
   * Merge default and custom keywords, applying overrides and hidden keywords
   */
  const allCategories: ReadonlyArray<KeywordCategory> = useCallback(() => {
    // Start with default categories
    let categories = keywordCategories.map((category) => {
      // Apply overrides and filter hidden keywords
      const processedKeywords = category.keywords
        .filter((keyword) => {
          // Check if keyword is hidden
          return !hiddenKeywords.some(
            (hidden) => hidden.categoryName === category.categoryName && hidden.en === keyword.en
          );
        })
        .map((keyword) => {
          // Check if keyword has override
          const override = keywordOverrides.find(
            (ov) => ov.categoryName === category.categoryName && ov.originalEn === keyword.en
          );

          if (override) {
            return {
              ja: override.ja,
              en: override.en
            };
          }

          return keyword;
        });

      return {
        categoryName: category.categoryName,
        keywords: processedKeywords
      };
    });

    // Add custom keywords
    if (customKeywords.length > 0) {
      const customByCategory = customKeywords.reduce((acc, custom) => {
        if (!acc[custom.categoryName]) {
          acc[custom.categoryName] = [];
        }
        acc[custom.categoryName]!.push({
          ja: custom.ja,
          en: custom.en
        });
        return acc;
      }, {} as Record<string, Keyword[]>);

      // Merge custom keywords into existing categories
      categories = categories.map((category) => {
        const customKeywordsForCategory = customByCategory[category.categoryName] || [];
        if (customKeywordsForCategory.length === 0) {
          return category;
        }

        // Remove from customByCategory after merging
        delete customByCategory[category.categoryName];

        return {
          categoryName: category.categoryName,
          keywords: [...category.keywords, ...customKeywordsForCategory]
        };
      });

      // Add new custom categories (not in default categories)
      for (const [categoryName, keywords] of Object.entries(customByCategory)) {
        categories.push({
          categoryName,
          keywords
        });
      }
    }

    // Apply category ordering if set
    if (categoryOrder.length > 0) {
      const orderedCategories: KeywordCategory[] = [];
      const categoryMap = new Map(categories.map((cat) => [cat.categoryName, cat]));

      // Add categories in the specified order
      for (const catName of categoryOrder) {
        const cat = categoryMap.get(catName);
        if (cat) {
          orderedCategories.push(cat);
          categoryMap.delete(catName);
        }
      }

      // Add any remaining categories not in the order
      for (const cat of categoryMap.values()) {
        orderedCategories.push(cat);
      }

      return orderedCategories;
    }

    return categories;
  }, [customKeywords, keywordOverrides, hiddenKeywords, categoryOrder])();

  /**
   * Add new custom keyword
   */
  const addKeyword = useCallback(async (
    categoryName: string,
    ja: string,
    en: string
  ): Promise<void> => {
    try {
      setError(null);

      // Validate inputs
      if (!categoryName.trim() || !ja.trim() || !en.trim()) {
        throw new Error('カテゴリー、日本語、英語のすべてを入力してください');
      }

      // Create new custom keyword
      const newKeyword: CustomKeyword = {
        id: generateCustomKeywordId(),
        categoryName,
        ja: ja.trim(),
        en: en.trim(),
        createdAt: Date.now()
      };

      // Add to list
      const updatedKeywords = [...customKeywords, newKeyword];
      setCustomKeywords(updatedKeywords);

      // Save to Chrome Storage
      await chrome.storage.local.set({
        [StorageKeys.CUSTOM_KEYWORDS]: updatedKeywords
      });

      console.log('Custom keyword added:', newKeyword);
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message
        : 'キーワードの追加に失敗しました';
      setError(errorMessage);
      console.error('Failed to add keyword:', err);
      throw err;
    }
  }, [customKeywords]);

  /**
   * Check if a keyword is custom (user-added, not default)
   */
  const isCustomKeyword = useCallback((categoryName: string, en: string): boolean => {
    return customKeywords.some((kw) => kw.categoryName === categoryName && kw.en === en);
  }, [customKeywords]);

  /**
   * Update keyword (custom or default)
   */
  const updateKeyword = useCallback(async (
    categoryName: string,
    originalEn: string,
    ja: string,
    en: string,
    newCategoryName?: string
  ): Promise<void> => {
    try {
      setError(null);

      // Validate inputs
      if (!categoryName.trim() || !ja.trim() || !en.trim()) {
        throw new Error('カテゴリー、日本語、英語のすべてを入力してください');
      }

      const targetCategory = newCategoryName?.trim() || categoryName;

      // Check if it's a custom keyword
      const customKeyword = customKeywords.find(
        (kw) => kw.categoryName === categoryName && kw.en === originalEn
      );

      if (customKeyword) {
        // Update custom keyword
        const updatedKeywords = customKeywords.map((kw) => {
          if (kw.id === customKeyword.id) {
            return {
              ...kw,
              categoryName: targetCategory,
              ja: ja.trim(),
              en: en.trim()
            };
          }
          return kw;
        });

        setCustomKeywords(updatedKeywords);
        await chrome.storage.local.set({
          [StorageKeys.CUSTOM_KEYWORDS]: updatedKeywords
        });
      } else {
        // Update default keyword (create override)
        const existingOverrideIndex = keywordOverrides.findIndex(
          (ov) => ov.categoryName === categoryName && ov.originalEn === originalEn
        );

        let updatedOverrides: KeywordOverride[];
        const newOverride: KeywordOverride = {
          categoryName,
          originalEn,
          ja: ja.trim(),
          en: en.trim(),
          newCategoryName: targetCategory !== categoryName ? targetCategory : undefined
        };

        if (existingOverrideIndex >= 0) {
          // Update existing override
          updatedOverrides = [...keywordOverrides];
          updatedOverrides[existingOverrideIndex] = newOverride;
        } else {
          // Add new override
          updatedOverrides = [...keywordOverrides, newOverride];
        }

        setKeywordOverrides(updatedOverrides);
        await chrome.storage.local.set({
          [StorageKeys.KEYWORD_OVERRIDES]: updatedOverrides
        });
      }

      console.log('Keyword updated:', { categoryName, originalEn, ja, en });
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message
        : 'キーワードの更新に失敗しました';
      setError(errorMessage);
      console.error('Failed to update keyword:', err);
      throw err;
    }
  }, [customKeywords, keywordOverrides]);

  /**
   * Delete keyword (custom or default)
   */
  const deleteKeyword = useCallback(async (categoryName: string, en: string): Promise<void> => {
    try {
      setError(null);

      // Check if it's a custom keyword
      const customKeyword = customKeywords.find(
        (kw) => kw.categoryName === categoryName && kw.en === en
      );

      if (customKeyword) {
        // Delete custom keyword
        const updatedKeywords = customKeywords.filter((kw) => kw.id !== customKeyword.id);
        setCustomKeywords(updatedKeywords);
        await chrome.storage.local.set({
          [StorageKeys.CUSTOM_KEYWORDS]: updatedKeywords
        });
      } else {
        // Hide default keyword
        const newHidden: HiddenKeyword = {
          categoryName,
          en
        };

        const updatedHidden = [...hiddenKeywords, newHidden];
        setHiddenKeywords(updatedHidden);
        await chrome.storage.local.set({
          [StorageKeys.HIDDEN_KEYWORDS]: updatedHidden
        });
      }

      console.log('Keyword deleted:', { categoryName, en });
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message
        : 'キーワードの削除に失敗しました';
      setError(errorMessage);
      console.error('Failed to delete keyword:', err);
      throw err;
    }
  }, [customKeywords, hiddenKeywords]);

  /**
   * Reorder categories
   */
  const reorderCategories = useCallback(async (newOrder: ReadonlyArray<string>): Promise<void> => {
    try {
      setError(null);

      setCategoryOrder(newOrder);
      await chrome.storage.local.set({
        [StorageKeys.CATEGORY_ORDER]: newOrder
      });

      console.log('Categories reordered:', newOrder);
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message
        : 'カテゴリー並び替えに失敗しました';
      setError(errorMessage);
      console.error('Failed to reorder categories:', err);
      throw err;
    }
  }, []);

  /**
   * Move category up in order
   */
  const moveCategoryUp = useCallback(async (categoryName: string): Promise<void> => {
    const currentOrder = categoryOrder.length > 0
      ? [...categoryOrder]
      : allCategories.map((cat) => cat.categoryName);

    const index = currentOrder.indexOf(categoryName);
    if (index > 0) {
      // Swap with previous category
      [currentOrder[index - 1], currentOrder[index]] = [currentOrder[index]!, currentOrder[index - 1]!];
      await reorderCategories(currentOrder);
    }
  }, [categoryOrder, allCategories, reorderCategories]);

  /**
   * Move category down in order
   */
  const moveCategoryDown = useCallback(async (categoryName: string): Promise<void> => {
    const currentOrder = categoryOrder.length > 0
      ? [...categoryOrder]
      : allCategories.map((cat) => cat.categoryName);

    const index = currentOrder.indexOf(categoryName);
    if (index >= 0 && index < currentOrder.length - 1) {
      // Swap with next category
      [currentOrder[index], currentOrder[index + 1]] = [currentOrder[index + 1]!, currentOrder[index]!];
      await reorderCategories(currentOrder);
    }
  }, [categoryOrder, allCategories, reorderCategories]);

  return {
    allCategories,
    customKeywords,
    addKeyword,
    updateKeyword,
    deleteKeyword,
    isCustomKeyword,
    reorderCategories,
    moveCategoryUp,
    moveCategoryDown,
    isLoading,
    error
  };
};
