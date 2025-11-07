/**
 * Custom Keywords Management Hook
 *
 * Features:
 * - Add user-defined keywords to categories
 * - Load custom keywords from Chrome Storage
 * - Delete custom keywords
 * - Merge with default keywords
 */

import { useState, useEffect, useCallback } from 'react';
import type { CustomKeyword, CustomCategory, KeywordCategory, Keyword } from '../types';
import { StorageKeys } from '../types';
import { keywordCategories } from '../data/keywords';
import { generateCustomKeywordId } from '../utils/id';

/**
 * useCustomKeywords hook return type
 */
interface UseCustomKeywordsReturn {
  /** All keyword categories (default + custom merged) */
  readonly allCategories: ReadonlyArray<KeywordCategory>;

  /** Custom keywords only */
  readonly customKeywords: ReadonlyArray<CustomKeyword>;

  /** Add new custom keyword */
  addKeyword: (categoryName: string, ja: string, en: string) => Promise<void>;

  /** Delete custom keyword */
  deleteKeyword: (id: string) => Promise<void>;

  /** Reorder keywords within a category */
  reorderKeywords: (categoryName: string, reorderedKeywords: ReadonlyArray<CustomKeyword>) => Promise<void>;

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
  const [customCategories, setCustomCategories] = useState<ReadonlyArray<CustomCategory>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load custom keywords and categories from Chrome Storage
   */
  const loadCustomKeywords = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await chrome.storage.local.get([
        StorageKeys.CUSTOM_KEYWORDS,
        StorageKeys.CUSTOM_CATEGORIES
      ]);

      const keywords = result[StorageKeys.CUSTOM_KEYWORDS] as CustomKeyword[] | undefined;
      const categories = result[StorageKeys.CUSTOM_CATEGORIES] as CustomCategory[] | undefined;

      if (keywords && Array.isArray(keywords)) {
        // Migration: Add order field to keywords that don't have it
        const migratedKeywords = keywords.map((kw, index) => {
          if (typeof kw.order === 'number') {
            return kw;
          }
          // Group by category and assign order
          const keywordsInSameCategory = keywords.filter(
            (k) => k.categoryName === kw.categoryName && keywords.indexOf(k) <= index
          );
          return {
            ...kw,
            order: keywordsInSameCategory.length - 1
          };
        });

        // Save migrated keywords back to storage if any were migrated
        const needsMigration = keywords.some((kw) => typeof kw.order !== 'number');
        if (needsMigration) {
          await chrome.storage.local.set({
            [StorageKeys.CUSTOM_KEYWORDS]: migratedKeywords
          });
        }

        setCustomKeywords(migratedKeywords);
      } else {
        setCustomKeywords([]);
      }

      if (categories && Array.isArray(categories)) {
        setCustomCategories(categories);
      } else {
        setCustomCategories([]);
      }
    } catch (err) {
      console.error('Failed to load custom keywords:', err);
      setError('カスタムキーワードの読み込みに失敗しました');
      setCustomKeywords([]);
      setCustomCategories([]);
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
   * Merge custom keywords and custom categories with default categories
   */
  const allCategories: ReadonlyArray<KeywordCategory> = useCallback(() => {
    // Group custom keywords by category
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

    // Merge custom keywords with default categories
    const defaultCategoriesWithCustomKeywords = keywordCategories.map((category) => {
      const customKeywordsForCategory = customByCategory[category.categoryName] || [];
      if (customKeywordsForCategory.length === 0) {
        return category;
      }

      return {
        categoryName: category.categoryName,
        keywords: [...category.keywords, ...customKeywordsForCategory]
      };
    });

    // Add custom categories (sorted by order)
    const sortedCustomCategories = [...customCategories].sort((a, b) => a.order - b.order);

    const customCategoryObjects: KeywordCategory[] = sortedCustomCategories.map((category) => {
      const keywordsForCategory = customByCategory[category.categoryName] || [];
      return {
        categoryName: category.categoryName,
        keywords: keywordsForCategory
      };
    });

    // Return default categories + custom categories
    return [...defaultCategoriesWithCustomKeywords, ...customCategoryObjects];
  }, [customKeywords, customCategories])();

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

      // Calculate order (add to end of category)
      const keywordsInCategory = customKeywords.filter(
        (kw) => kw.categoryName === categoryName
      );
      const order = keywordsInCategory.length;

      // Create new custom keyword
      const newKeyword: CustomKeyword = {
        id: generateCustomKeywordId(),
        categoryName,
        ja: ja.trim(),
        en: en.trim(),
        order,
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
   * Delete custom keyword
   */
  const deleteKeyword = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);

      const updatedKeywords = customKeywords.filter((kw) => kw.id !== id);
      setCustomKeywords(updatedKeywords);

      // Save to Chrome Storage
      await chrome.storage.local.set({
        [StorageKeys.CUSTOM_KEYWORDS]: updatedKeywords
      });

      console.log('Custom keyword deleted:', id);
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message
        : 'キーワードの削除に失敗しました';
      setError(errorMessage);
      console.error('Failed to delete keyword:', err);
      throw err;
    }
  }, [customKeywords]);

  /**
   * Reorder keywords within a category
   */
  const reorderKeywords = useCallback(async (
    categoryName: string,
    reorderedKeywords: ReadonlyArray<CustomKeyword>
  ): Promise<void> => {
    try {
      setError(null);

      // Update order field for reordered keywords
      const keywordsWithNewOrder = reorderedKeywords.map((kw, index) => ({
        ...kw,
        order: index
      }));

      // Merge with keywords from other categories
      const otherKeywords = customKeywords.filter(
        (kw) => kw.categoryName !== categoryName
      );
      const updatedKeywords = [...otherKeywords, ...keywordsWithNewOrder];

      setCustomKeywords(updatedKeywords);

      // Save to Chrome Storage
      await chrome.storage.local.set({
        [StorageKeys.CUSTOM_KEYWORDS]: updatedKeywords
      });

      console.log('Keywords reordered in category:', categoryName);
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message
        : 'キーワードの並び替えに失敗しました';
      setError(errorMessage);
      console.error('Failed to reorder keywords:', err);
      throw err;
    }
  }, [customKeywords]);

  return {
    allCategories,
    customKeywords,
    addKeyword,
    deleteKeyword,
    reorderKeywords,
    isLoading,
    error
  };
};
