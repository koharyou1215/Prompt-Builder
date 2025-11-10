/**
 * Tag Organizer Utility
 * Organizes and sorts prompt tags by category with line breaks
 */

import { keywordCategories } from '../data/keywords';
import type { KeywordCategory } from '../types';

/**
 * Category order for organizing tags
 * カテゴリの並び順序を定義
 */
const CATEGORY_ORDER = [
  '品質', // Quality tags
  'キャラクター', // Character (includes character basics, hair, eyes)
  '表情', // Expression
  '服装', // Clothing (includes clothing, clothing state, accessories)
  'ポーズ', // Pose (includes basic poses and restraints)
  'シチュエーション', // Situation (includes sexual content and scenes)
  '構図・アングル・背景', // Composition, angle, background
  'エフェクト', // Effects
  'その他', // Other (uncategorized)
] as const;

/**
 * Category mapping from keyword categories to organization categories
 * keywords.ts のカテゴリ名を整理カテゴリにマッピング
 */
const CATEGORY_MAPPING: Record<string, string> = {
  // Quality - handled separately as it's usually implicit in quality tags

  // Character
  'キャラクター基本': 'キャラクター',
  '髪型・髪色': 'キャラクター',
  '目・瞳': 'キャラクター',

  // Expression
  '表情': '表情',

  // Clothing
  '服装': '服装',
  '服装の状態': '服装',
  'アクセサリー・装飾': '服装',
  'ファッションセット': '服装',

  // Pose
  'ポーズ基本': 'ポーズ',
  '拘束・ボンデージ': 'ポーズ',

  // Situation
  '性的な表現': 'シチュエーション',
  'シーン': 'シチュエーション',

  // Composition, Angle, Background
  '構図・アングル': '構図・アングル・背景',
  '背景': '構図・アングル・背景',
  '場所・環境': '構図・アングル・背景',

  // Effects
  'エフェクト': 'エフェクト',
};

/**
 * Common quality tags (English)
 * 品質タグのリスト（英語）
 */
const QUALITY_TAGS_EN = new Set([
  'masterpiece',
  'best quality',
  'high quality',
  'ultra detailed',
  'absurdres',
  'highres',
  '8k',
  '4k',
  'extremely detailed',
  'detailed',
  'official art',
  'beautiful',
  'aesthetic',
  'intricate details',
  'fine details',
  'sharp focus',
  'professional',
]);

/**
 * Common quality tags (Japanese)
 * 品質タグのリスト（日本語）
 */
const QUALITY_TAGS_JA = new Set([
  '傑作',
  '最高品質',
  '高品質',
  '超詳細',
  '非常に詳細',
  '詳細',
  '公式アート',
  '美しい',
  '美的',
  '複雑なディテール',
  '細かいディテール',
  'シャープフォーカス',
  'プロフェッショナル',
  '8K',
  '4K',
]);

/**
 * Tag classification result
 */
interface ClassifiedTags {
  [category: string]: string[];
}

/**
 * Check if a tag is a quality tag
 */
const isQualityTag = (tag: string, language: 'en' | 'ja'): boolean => {
  const normalizedTag = tag.toLowerCase().trim();
  const qualitySet = language === 'en' ? QUALITY_TAGS_EN : QUALITY_TAGS_JA;

  return qualitySet.has(normalizedTag);
};

/**
 * Parse comma-separated tags into array
 */
const parseTags = (text: string): string[] => {
  return text
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0);
};

/**
 * Build a lookup map for fast tag classification
 * タグからカテゴリへの高速検索マップを構築
 */
const buildTagLookupMap = (): {
  enMap: Map<string, string>;
  jaMap: Map<string, string>;
} => {
  const enMap = new Map<string, string>();
  const jaMap = new Map<string, string>();

  keywordCategories.forEach((category: KeywordCategory) => {
    const organizedCategory = CATEGORY_MAPPING[category.categoryName] || 'その他';

    category.keywords.forEach((keyword) => {
      // Normalize tags: lowercase and trim
      const enTag = keyword.en.toLowerCase().trim();
      const jaTag = keyword.ja.trim();

      enMap.set(enTag, organizedCategory);
      jaMap.set(jaTag, organizedCategory);
    });
  });

  return { enMap, jaMap };
};

// Build lookup maps once at module load time
const { enMap: EN_TAG_MAP, jaMap: JA_TAG_MAP } = buildTagLookupMap();

/**
 * Classify a tag into a category using keyword database
 * キーワードデータベースを使用してタグを分類
 */
const classifyTag = (tag: string, language: 'en' | 'ja'): string => {
  // Check if it's a quality tag first
  if (isQualityTag(tag, language)) {
    return '品質';
  }

  // Look up in keyword database
  const normalizedTag = language === 'en' ? tag.toLowerCase().trim() : tag.trim();
  const tagMap = language === 'en' ? EN_TAG_MAP : JA_TAG_MAP;

  const category = tagMap.get(normalizedTag);
  if (category) {
    return category;
  }

  // Try partial matching for complex tags (e.g., tags with parentheses or modifiers)
  // 複雑なタグ（括弧や修飾語を含む）の部分一致を試行
  for (const [registeredTag, cat] of tagMap.entries()) {
    if (normalizedTag.includes(registeredTag) || registeredTag.includes(normalizedTag)) {
      return cat;
    }
  }

  // Return 'その他' for uncategorized tags
  return 'その他';
};

/**
 * Organize tags by category
 */
export const organizeTags = (
  text: string,
  language: 'en' | 'ja' = 'en'
): ClassifiedTags => {
  const tags = parseTags(text);
  const classified: ClassifiedTags = {};

  // Initialize all categories
  CATEGORY_ORDER.forEach(category => {
    classified[category] = [];
  });

  // Classify each tag
  tags.forEach(tag => {
    const category = classifyTag(tag, language);
    if (!classified[category]) {
      classified[category] = [];
    }
    classified[category].push(tag);
  });

  return classified;
};

/**
 * Format organized tags with line breaks
 * カテゴリごとに改行で区切ってフォーマット
 */
export const formatOrganizedTags = (
  classifiedTags: ClassifiedTags,
  options: {
    includeEmptyCategories?: boolean;
    includeCategoryLabels?: boolean;
  } = {}
): string => {
  const {
    includeEmptyCategories = false,
    includeCategoryLabels = false,
  } = options;

  const lines: string[] = [];

  CATEGORY_ORDER.forEach(category => {
    const tags = classifiedTags[category] || [];

    // Skip empty categories if not including them
    if (!includeEmptyCategories && tags.length === 0) {
      return;
    }

    // Add category label if requested
    if (includeCategoryLabels && tags.length > 0) {
      lines.push(`# ${category}`);
    }

    // Add tags for this category
    if (tags.length > 0) {
      lines.push(tags.join(', '));
    }
  });

  return lines.join('\n\n');
};

/**
 * Main function: Organize and format tags with line breaks
 * 翻訳されたテキストを整理してフォーマット
 *
 * @param text - Comma-separated tags
 * @param language - Language of the tags ('en' or 'ja')
 * @param includeCategoryLabels - Whether to include category labels (default: false)
 * @returns Formatted text with line breaks between categories
 */
export const organizeAndFormatTags = (
  text: string,
  language: 'en' | 'ja' = 'en',
  includeCategoryLabels: boolean = false
): string => {
  if (!text || text.trim() === '') {
    return '';
  }

  const classified = organizeTags(text, language);
  return formatOrganizedTags(classified, {
    includeEmptyCategories: false,
    includeCategoryLabels,
  });
};
