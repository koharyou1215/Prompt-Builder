/**
 * PromptBuilder - Build text prompt from categorized structure
 *
 * Rule: No 'any' type allowed - strict type safety enforced
 */

import type { CategorizedPromptState, PromptTarget } from '../types';

/**
 * Build text prompt from categorized structure
 */
export class PromptBuilder {
  /**
   * Convert categorized structure to comma-separated text
   */
  build(categorized: CategorizedPromptState, target: PromptTarget = 'positive'): string {
    const keywords: string[] = [];

    // Select target category groups
    const categoryGroups = target === 'positive' ? categorized.positive : categorized.negative;

    // 1. Process each category in defined order
    for (const category of categoryGroups) {
      // 2. Sort by order within category
      const sorted = [...category.keywords].sort((a, b) => a.order - b.order);

      // 3. Build keyword strings with weights
      for (const item of sorted) {
        const keywordWithWeight = item.weight ? `${item.keyword}${item.weight}` : item.keyword;
        keywords.push(keywordWithWeight);
      }
    }

    // 4. Add uncategorized at the end
    keywords.push(...categorized.uncategorized);

    // 5. Join with comma + space
    return keywords.join(', ');
  }

  /**
   * Build both positive and negative prompts
   */
  buildBoth(categorized: CategorizedPromptState): {
    positive: string;
    negative: string;
  } {
    return {
      positive: this.build(categorized, 'positive'),
      negative: this.build(categorized, 'negative'),
    };
  }
}
