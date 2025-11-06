/**
 * Category Color Service
 *
 * Manages category color configuration and operations.
 * Provides utilities for color management without side effects.
 */

import type { CategoryColorConfig } from '../types';
import { DEFAULT_CATEGORY_COLORS } from '../constants';

/**
 * Get color for a specific category
 *
 * @param categoryName - Category name to get color for
 * @param configs - Array of color configurations
 * @returns CSS color string if found, undefined otherwise
 */
export const getCategoryColor = (
  categoryName: string,
  configs: ReadonlyArray<CategoryColorConfig>
): string | undefined => {
  const config = configs.find(c => c.categoryName === categoryName);
  return config?.color;
};

/**
 * Generate default color configuration for all categories
 * Assigns colors from the default palette in a round-robin fashion
 *
 * @param categoryNames - Array of category names
 * @returns Array of default color configurations
 */
export const generateDefaultColorConfig = (
  categoryNames: ReadonlyArray<string>
): ReadonlyArray<CategoryColorConfig> => {
  return categoryNames.map((name, index): CategoryColorConfig => ({
    categoryName: name,
    color: DEFAULT_CATEGORY_COLORS[index % DEFAULT_CATEGORY_COLORS.length] as string,
    isCustom: false,
  }));
};

/**
 * Update color for a specific category
 * Creates a new config if it doesn't exist, updates existing one otherwise
 *
 * @param configs - Current color configurations
 * @param categoryName - Category name to update
 * @param color - New CSS color value
 * @returns New array with updated configuration (immutable)
 */
export const updateCategoryColor = (
  configs: ReadonlyArray<CategoryColorConfig>,
  categoryName: string,
  color: string
): ReadonlyArray<CategoryColorConfig> => {
  const existingIndex = configs.findIndex(c => c.categoryName === categoryName);

  if (existingIndex !== -1) {
    // Update existing config
    return configs.map((c, i) =>
      i === existingIndex
        ? { ...c, color, isCustom: true }
        : c
    );
  } else {
    // Add new config
    return [
      ...configs,
      { categoryName, color, isCustom: true },
    ];
  }
};

/**
 * Reset category color to default
 * Removes custom color and restores default from provided defaults
 *
 * @param configs - Current color configurations
 * @param categoryName - Category name to reset
 * @param defaultConfigs - Default color configurations
 * @returns New array with reset configuration (immutable)
 */
export const resetCategoryColor = (
  configs: ReadonlyArray<CategoryColorConfig>,
  categoryName: string,
  defaultConfigs: ReadonlyArray<CategoryColorConfig>
): ReadonlyArray<CategoryColorConfig> => {
  const defaultConfig = defaultConfigs.find(c => c.categoryName === categoryName);

  if (!defaultConfig) {
    // No default found, remove the config
    return configs.filter(c => c.categoryName !== categoryName);
  }

  const existingIndex = configs.findIndex(c => c.categoryName === categoryName);

  if (existingIndex !== -1) {
    // Replace with default
    return configs.map((c, i) =>
      i === existingIndex
        ? { ...defaultConfig, isCustom: false }
        : c
    );
  } else {
    // Add default config
    return [...configs, { ...defaultConfig, isCustom: false }];
  }
};

/**
 * Reset all category colors to defaults
 *
 * @param defaultConfigs - Default color configurations
 * @returns Array of default configurations
 */
export const resetAllCategoryColors = (
  defaultConfigs: ReadonlyArray<CategoryColorConfig>
): ReadonlyArray<CategoryColorConfig> => {
  return defaultConfigs.map(config => ({ ...config, isCustom: false }));
};

/**
 * Extract all unique category names from keyword categories
 * Helper utility to get category list
 *
 * @param categories - Keyword categories array
 * @returns Array of unique category names
 */
export const extractCategoryNames = <T extends { readonly categoryName: string }>(
  categories: ReadonlyArray<T>
): ReadonlyArray<string> => {
  return Array.from(new Set(categories.map(c => c.categoryName)));
};
