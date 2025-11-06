/**
 * Prompt Color Parser
 *
 * Parses prompt text and attaches color information based on category matching.
 * Enables colored preview of prompts in the editor.
 */

import type { CategoryColorConfig, KeywordCategory } from '../types';

/**
 * Colored text segment
 */
export interface ColoredTextSegment {
  readonly text: string;
  readonly color?: string;
  readonly category?: string;
}

/**
 * Parse prompt text and attach color information
 *
 * @param promptText - Raw prompt text (comma-separated keywords)
 * @param keywordCategories - Available keyword categories
 * @param colorConfigs - Category color configurations
 * @returns Array of colored text segments
 */
export const parsePromptWithColors = (
  promptText: string,
  keywordCategories: ReadonlyArray<KeywordCategory>,
  colorConfigs: ReadonlyArray<CategoryColorConfig>
): ReadonlyArray<ColoredTextSegment> => {
  if (!promptText.trim()) return [];

  // Split by comma and trim whitespace
  const keywords = promptText
    .split(',')
    .map(k => k.trim())
    .filter(k => k.length > 0);

  return keywords.map(keyword => {
    // Find matching category for this keyword
    const category = findCategoryForKeyword(keyword, keywordCategories);

    if (!category) {
      // No category found, return plain segment
      return { text: keyword };
    }

    // Get color configuration for this category
    const colorConfig = colorConfigs.find(c => c.categoryName === category.categoryName);

    return {
      text: keyword,
      color: colorConfig?.color,
      category: category.categoryName,
    };
  });
};

/**
 * Find category for a keyword
 * Uses fuzzy matching to handle variations and compound keywords
 *
 * @param keyword - Keyword to search for
 * @param categories - Available categories
 * @returns Matching category or undefined
 */
const findCategoryForKeyword = (
  keyword: string,
  categories: ReadonlyArray<KeywordCategory>
): KeywordCategory | undefined => {
  const normalizedKeyword = keyword.toLowerCase().trim();

  // First pass: Exact match
  for (const category of categories) {
    const exactMatch = category.keywords.find(kw => {
      const normalizedEn = kw.en.toLowerCase().trim();
      return normalizedEn === normalizedKeyword;
    });

    if (exactMatch) return category;
  }

  // Second pass: Partial match (keyword contains the category keyword)
  for (const category of categories) {
    const partialMatch = category.keywords.find(kw => {
      const normalizedEn = kw.en.toLowerCase().trim();

      // Check if the prompt keyword contains the category keyword
      // e.g., "1girl" matches when prompt has "1girl"
      if (normalizedKeyword.includes(normalizedEn)) return true;

      // Check reverse: category keyword contains prompt keyword
      // e.g., "smile" matches "smiling"
      if (normalizedEn.includes(normalizedKeyword)) return true;

      return false;
    });

    if (partialMatch) return category;
  }

  return undefined;
};

/**
 * Extract unique categories from colored segments
 * Useful for displaying category legends
 *
 * @param segments - Colored text segments
 * @returns Array of unique category names
 */
export const extractUniqueCategories = (
  segments: ReadonlyArray<ColoredTextSegment>
): ReadonlyArray<string> => {
  const categories = segments
    .map(s => s.category)
    .filter((c): c is string => c !== undefined);

  return Array.from(new Set(categories));
};
