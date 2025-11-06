/**
 * Category Color Context
 *
 * Manages category color configuration state and provides
 * utilities for color management throughout the application.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { CategoryColorConfig } from '../types';
import { loadCategoryColors, saveCategoryColors } from '../services/storageService';
import {
  generateDefaultColorConfig,
  updateCategoryColor as updateColorConfig,
  resetCategoryColor as resetColorConfig,
  resetAllCategoryColors,
  extractCategoryNames,
  getCategoryColor as getColor,
} from '../services/categoryColorService';
import { keywordCategories, negativeKeywordCategories } from '../data/keywords';
import { createScopedLogger } from '../utils/logger';

/**
 * Logger instance
 */
const logger = createScopedLogger('CategoryColorContext');

/**
 * Category Color Context value interface
 */
interface CategoryColorContextValue {
  readonly colorConfigs: ReadonlyArray<CategoryColorConfig>;
  readonly defaultConfigs: ReadonlyArray<CategoryColorConfig>;
  readonly isLoading: boolean;
  readonly updateColor: (categoryName: string, color: string) => Promise<void>;
  readonly resetColor: (categoryName: string) => Promise<void>;
  readonly resetAllColors: () => Promise<void>;
  readonly getCategoryColor: (categoryName: string) => string | undefined;
}

/**
 * Category Color Context
 */
const CategoryColorContext = createContext<CategoryColorContextValue | undefined>(undefined);

/**
 * Category Color Provider Props
 */
interface CategoryColorProviderProps {
  readonly children: React.ReactNode;
}

/**
 * Category Color Provider
 * Manages category color configuration state and persistence
 */
export const CategoryColorProvider: React.FC<CategoryColorProviderProps> = ({ children }) => {
  const [colorConfigs, setColorConfigs] = useState<ReadonlyArray<CategoryColorConfig>>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Generate default configs from all categories (positive + negative)
  const defaultConfigs = useMemo(() => {
    const allCategories = [...keywordCategories, ...negativeKeywordCategories];
    const categoryNames = extractCategoryNames(allCategories);
    return generateDefaultColorConfig(categoryNames);
  }, []);

  // Load color configs from storage on mount
  useEffect(() => {
    const loadConfigs = async (): Promise<void> => {
      try {
        logger.info('Loading category color configs from storage');
        const response = await loadCategoryColors();

        if (response.success && response.data && response.data.length > 0) {
          logger.info(`Loaded ${response.data.length} category color configs`);
          setColorConfigs(response.data);
        } else {
          // No saved configs, use defaults
          logger.info('No saved configs found, using defaults');
          setColorConfigs(defaultConfigs);
          // Save defaults to storage
          await saveCategoryColors(defaultConfigs);
        }
      } catch (error) {
        logger.error('Failed to load category colors, using defaults:', error);
        setColorConfigs(defaultConfigs);
      } finally {
        setIsLoading(false);
      }
    };

    void loadConfigs();
  }, [defaultConfigs]);

  /**
   * Update color for a specific category
   */
  const updateColor = useCallback(async (categoryName: string, color: string): Promise<void> => {
    try {
      logger.info(`Updating color for category "${categoryName}" to ${color}`);
      const updated = updateColorConfig(colorConfigs, categoryName, color);
      setColorConfigs(updated);

      const saveResponse = await saveCategoryColors(updated);
      if (!saveResponse.success) {
        logger.error('Failed to save color config:', saveResponse.error);
      }
    } catch (error) {
      logger.error('Failed to update category color:', error);
    }
  }, [colorConfigs]);

  /**
   * Reset color for a specific category to default
   */
  const resetColor = useCallback(async (categoryName: string): Promise<void> => {
    try {
      logger.info(`Resetting color for category "${categoryName}"`);
      const updated = resetColorConfig(colorConfigs, categoryName, defaultConfigs);
      setColorConfigs(updated);

      const saveResponse = await saveCategoryColors(updated);
      if (!saveResponse.success) {
        logger.error('Failed to save color config:', saveResponse.error);
      }
    } catch (error) {
      logger.error('Failed to reset category color:', error);
    }
  }, [colorConfigs, defaultConfigs]);

  /**
   * Reset all category colors to defaults
   */
  const resetAll = useCallback(async (): Promise<void> => {
    try {
      logger.info('Resetting all category colors to defaults');
      const updated = resetAllCategoryColors(defaultConfigs);
      setColorConfigs(updated);

      const saveResponse = await saveCategoryColors(updated);
      if (!saveResponse.success) {
        logger.error('Failed to save color config:', saveResponse.error);
      }
    } catch (error) {
      logger.error('Failed to reset all category colors:', error);
    }
  }, [defaultConfigs]);

  /**
   * Get color for a specific category
   */
  const getCategoryColor = useCallback((categoryName: string): string | undefined => {
    return getColor(categoryName, colorConfigs);
  }, [colorConfigs]);

  const contextValue: CategoryColorContextValue = useMemo(() => ({
    colorConfigs,
    defaultConfigs,
    isLoading,
    updateColor,
    resetColor,
    resetAllColors: resetAll,
    getCategoryColor,
  }), [colorConfigs, defaultConfigs, isLoading, updateColor, resetColor, resetAll, getCategoryColor]);

  return (
    <CategoryColorContext.Provider value={contextValue}>
      {children}
    </CategoryColorContext.Provider>
  );
};

/**
 * Hook to access Category Color Context
 *
 * @throws Error if used outside of CategoryColorProvider
 * @returns Category Color Context value
 */
export const useCategoryColor = (): CategoryColorContextValue => {
  const context = useContext(CategoryColorContext);

  if (!context) {
    throw new Error('useCategoryColor must be used within CategoryColorProvider');
  }

  return context;
};
