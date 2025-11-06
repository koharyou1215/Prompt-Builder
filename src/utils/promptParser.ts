/**
 * PromptParser - Parse text prompt into categorized structure
 *
 * Rule: No 'any' type allowed - strict type safety enforced
 */

import type {
  KeywordCategory,
  CustomKeyword,
  CategorizedPromptState,
  CategoryGroup,
  CategorizedKeywordItem,
  PromptTarget,
} from '../types';

/**
 * Parsed token with category information
 */
interface ParsedToken {
  readonly keyword: string;
  readonly weight?: string;
  readonly categoryName: string;
  readonly ja: string;
  readonly isCustom: boolean;
}

/**
 * Maximum number of keywords to prevent performance issues
 */
const MAX_KEYWORDS = 1000;

/**
 * Default category for uncategorized keywords
 */
const UNCATEGORIZED_CATEGORY = 'その他';

/**
 * Parse text prompt into categorized structure
 */
export class PromptParser {
  private keywordMap: Map<string, { categoryName: string; ja: string; isCustom: boolean }>;

  constructor(
    keywords: ReadonlyArray<KeywordCategory>,
    customKeywords: ReadonlyArray<CustomKeyword>
  ) {
    this.keywordMap = this.buildKeywordMap(keywords, customKeywords);
  }

  /**
   * Build O(1) lookup map from keywords
   */
  private buildKeywordMap(
    keywords: ReadonlyArray<KeywordCategory>,
    customKeywords: ReadonlyArray<CustomKeyword>
  ): Map<string, { categoryName: string; ja: string; isCustom: boolean }> {
    const map = new Map<string, { categoryName: string; ja: string; isCustom: boolean }>();

    // Add default keywords
    keywords.forEach((category) => {
      category.keywords.forEach((keyword) => {
        const key = keyword.en.toLowerCase().trim();
        map.set(key, {
          categoryName: category.categoryName,
          ja: keyword.ja,
          isCustom: false,
        });
      });
    });

    // Add custom keywords (override if exists)
    customKeywords.forEach((keyword) => {
      const key = keyword.en.toLowerCase().trim();
      map.set(key, {
        categoryName: keyword.categoryName,
        ja: keyword.ja,
        isCustom: true,
      });
    });

    return map;
  }

  /**
   * Parse comma-separated prompt into categories
   */
  parse(promptText: string, target: PromptTarget = 'positive'): CategorizedPromptState {
    // Handle empty prompt
    if (!promptText.trim()) {
      return {
        positive: [],
        negative: [],
        uncategorized: [],
      };
    }

    // 1. Split by comma and trim
    let tokens = promptText
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    // 2. Truncate if too many keywords
    if (tokens.length > MAX_KEYWORDS) {
      console.warn(`Prompt has ${tokens.length} keywords, truncating to ${MAX_KEYWORDS}`);
      tokens = tokens.slice(0, MAX_KEYWORDS);
    }

    // 3. Parse each token
    const parsedTokens = tokens.map((token) => this.parseToken(token));

    // 4. Group by category
    const grouped = this.groupByCategory(parsedTokens);

    // 5. Build result structure
    if (target === 'positive') {
      return {
        positive: grouped.categorized,
        negative: [],
        uncategorized: grouped.uncategorized,
      };
    } else {
      return {
        positive: [],
        negative: grouped.categorized,
        uncategorized: grouped.uncategorized,
      };
    }
  }

  /**
   * Parse single token: "keyword:1.2" → {keyword, weight, category}
   */
  private parseToken(token: string): ParsedToken {
    // Extract weight: "keyword:1.2" → {keyword: "keyword", weight: ":1.2"}
    const match = token.match(/^(.+?)(:[0-9]+\.?[0-9]*)$/);
    const keyword = match?.[1]?.trim() || token.trim();
    const weight = match?.[2];

    // Remove weight from keyword for lookup
    const keywordForLookup = keyword.toLowerCase().trim();

    // Look up category
    const categoryInfo = this.keywordMap.get(keywordForLookup);

    if (categoryInfo) {
      return {
        keyword,
        weight,
        categoryName: categoryInfo.categoryName,
        ja: categoryInfo.ja,
        isCustom: categoryInfo.isCustom,
      };
    } else {
      // Uncategorized keyword
      return {
        keyword,
        weight,
        categoryName: UNCATEGORIZED_CATEGORY,
        ja: keyword, // Use keyword itself as display
        isCustom: false,
      };
    }
  }

  /**
   * Group parsed tokens by category
   */
  private groupByCategory(parsedTokens: ReadonlyArray<ParsedToken>): {
    categorized: ReadonlyArray<CategoryGroup>;
    uncategorized: ReadonlyArray<string>;
  } {
    const categoryMap = new Map<string, CategorizedKeywordItem[]>();
    const uncategorized: string[] = [];

    parsedTokens.forEach((token, index) => {
      if (token.categoryName === UNCATEGORIZED_CATEGORY) {
        // Add to uncategorized
        const keywordWithWeight = token.weight ? `${token.keyword}${token.weight}` : token.keyword;
        uncategorized.push(keywordWithWeight);
      } else {
        // Add to category
        if (!categoryMap.has(token.categoryName)) {
          categoryMap.set(token.categoryName, []);
        }

        const categoryItems = categoryMap.get(token.categoryName)!;
        categoryItems.push({
          keyword: token.keyword,
          ja: token.ja,
          categoryName: token.categoryName,
          isCustom: token.isCustom,
          order: index, // Preserve original order
          weight: token.weight,
        });
      }
    });

    // Build CategoryGroup array
    const categorized: CategoryGroup[] = [];
    categoryMap.forEach((keywords, categoryName) => {
      // Deduplicate keywords within category
      const deduped = this.deduplicateKeywords(keywords);

      categorized.push({
        categoryName,
        keywords: deduped,
        isExpanded: true, // Default to expanded
      });
    });

    return { categorized, uncategorized };
  }

  /**
   * Remove duplicate keywords within same category
   * Keep first occurrence
   */
  private deduplicateKeywords(
    keywords: ReadonlyArray<CategorizedKeywordItem>
  ): ReadonlyArray<CategorizedKeywordItem> {
    const seen = new Set<string>();
    return keywords.filter((kw) => {
      const key = kw.keyword.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
}
