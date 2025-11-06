/**
 * Category Management Hook
 *
 * Features:
 * - Create custom categories
 * - Reorder categories
 * - Delete custom categories
 * - Load custom categories from Chrome Storage
 */

import { useState, useEffect, useCallback } from 'react';
import type { CustomCategory } from '../types';
import { StorageKeys } from '../types';
import { generateCustomKeywordId } from '../utils/id';

/**
 * useCategoryManagement hook return type
 */
interface UseCategoryManagementReturn {
  /** All custom categories */
  readonly customCategories: ReadonlyArray<CustomCategory>;

  /** Add new custom category */
  addCategory: (categoryName: string) => Promise<void>;

  /** Delete custom category */
  deleteCategory: (id: string) => Promise<void>;

  /** Reorder categories */
  reorderCategories: (reorderedCategories: ReadonlyArray<CustomCategory>) => Promise<void>;

  /** Loading state */
  readonly isLoading: boolean;

  /** Error message */
  readonly error: string | null;
}

/**
 * Category management hook
 *
 * Manages user-defined categories, storing them in Chrome Storage.
 *
 * @example
 * ```tsx
 * const { customCategories, addCategory, deleteCategory } = useCategoryManagement();
 *
 * // Add category
 * await addCategory('マイカテゴリー');
 * ```
 */
export const useCategoryManagement = (): UseCategoryManagementReturn => {
  const [customCategories, setCustomCategories] = useState<ReadonlyArray<CustomCategory>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load custom categories from Chrome Storage
   */
  const loadCustomCategories = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await chrome.storage.local.get(StorageKeys.CUSTOM_CATEGORIES);
      const categories = result[StorageKeys.CUSTOM_CATEGORIES] as CustomCategory[] | undefined;

      if (categories && Array.isArray(categories)) {
        setCustomCategories(categories);
      } else {
        setCustomCategories([]);
      }
    } catch (err) {
      console.error('Failed to load custom categories:', err);
      setError('カスタムカテゴリーの読み込みに失敗しました');
      setCustomCategories([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Initial load on mount
   */
  useEffect(() => {
    void loadCustomCategories();
  }, [loadCustomCategories]);

  /**
   * Add new custom category
   */
  const addCategory = useCallback(async (categoryName: string): Promise<void> => {
    try {
      setError(null);

      // Validate input
      if (!categoryName.trim()) {
        throw new Error('カテゴリー名を入力してください');
      }

      // Check if category already exists
      const categoryExists = customCategories.some(
        (cat) => cat.categoryName.toLowerCase() === categoryName.toLowerCase()
      );

      if (categoryExists) {
        throw new Error('このカテゴリー名は既に存在します');
      }

      // Create new custom category
      const newCategory: CustomCategory = {
        id: generateCustomKeywordId(),
        categoryName: categoryName.trim(),
        order: customCategories.length,
        createdAt: Date.now()
      };

      // Add to list
      const updatedCategories = [...customCategories, newCategory];
      setCustomCategories(updatedCategories);

      // Save to Chrome Storage
      await chrome.storage.local.set({
        [StorageKeys.CUSTOM_CATEGORIES]: updatedCategories
      });

      console.log('Custom category added:', newCategory);
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message
        : 'カテゴリーの追加に失敗しました';
      setError(errorMessage);
      console.error('Failed to add category:', err);
      throw err;
    }
  }, [customCategories]);

  /**
   * Delete custom category
   */
  const deleteCategory = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);

      const updatedCategories = customCategories.filter((cat) => cat.id !== id);
      setCustomCategories(updatedCategories);

      // Save to Chrome Storage
      await chrome.storage.local.set({
        [StorageKeys.CUSTOM_CATEGORIES]: updatedCategories
      });

      console.log('Custom category deleted:', id);
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message
        : 'カテゴリーの削除に失敗しました';
      setError(errorMessage);
      console.error('Failed to delete category:', err);
      throw err;
    }
  }, [customCategories]);

  /**
   * Reorder categories
   */
  const reorderCategories = useCallback(async (
    reorderedCategories: ReadonlyArray<CustomCategory>
  ): Promise<void> => {
    try {
      setError(null);

      // Update order field
      const categoriesWithNewOrder = reorderedCategories.map((cat, index) => ({
        ...cat,
        order: index
      }));

      setCustomCategories(categoriesWithNewOrder);

      // Save to Chrome Storage
      await chrome.storage.local.set({
        [StorageKeys.CUSTOM_CATEGORIES]: categoriesWithNewOrder
      });

      console.log('Categories reordered');
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message
        : 'カテゴリーの並び替えに失敗しました';
      setError(errorMessage);
      console.error('Failed to reorder categories:', err);
      throw err;
    }
  }, []);

  return {
    customCategories,
    addCategory,
    deleteCategory,
    reorderCategories,
    isLoading,
    error
  };
};
