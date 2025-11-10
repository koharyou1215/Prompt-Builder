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
  '8K解像度',
  '超高精細',
  'アニメスタイル',
  '美しい照明',
  '鮮やかな色彩',
  'シネマティックシェーディング',
  '高解像度',
  'シャープな線',
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
 * Remove weight syntax from tags (e.g., "(tag:1.3)" -> "tag")
 * 重み構文を削除（例：(tag:1.3) -> tag）
 */
const removeWeightSyntax = (tag: string): string => {
  // Remove outer parentheses and weight values like (tag:1.3)
  let cleaned = tag.replace(/^\(([^)]+):[0-9.]+\)$/, '$1');

  // Remove just parentheses if no weight
  cleaned = cleaned.replace(/^\(([^)]+)\)$/, '$1');

  return cleaned.trim();
};

/**
 * Parse comma-separated tags into array
 */
const parseTags = (text: string): string[] => {
  return text
    .split(',')
    .map(tag => removeWeightSyntax(tag.trim()))
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
 * Calculate similarity between two strings for fuzzy matching
 * 類似度を計算（あいまいマッチング用）
 */
const calculateSimilarity = (str1: string, str2: string): number => {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) {
    return 1.0;
  }

  // Check if shorter is contained in longer (high similarity)
  if (longer.includes(shorter)) {
    return shorter.length / longer.length;
  }

  return 0;
};

/**
 * Classify tag by pattern matching for common Japanese tags
 * 一般的な日本語タグのパターンマッチング分類
 */
const classifyByPattern = (tag: string): string | null => {
  // Expression keywords - 表情 (check first for higher priority)
  if (tag.includes('顔') || tag.includes('表情') || tag.includes('笑') || tag.includes('泣') ||
      tag.includes('呼吸') || tag.includes('息切れ') || tag.includes('あえぎ') ||
      tag.includes('食いしばった歯') || tag.includes('眉をひそめた') ||
      tag.includes('ウィンク') || tag.includes('ウインク') ||
      tag.includes('閉じた目') || tag.includes('見開') || tag.includes('半目') ||
      tag.includes('開いた口') || tag.includes('口を')) {
    return '表情';
  }

  // Hair keywords - 髪型・髪色
  if (tag.includes('髪') || tag.includes('ヘア') || tag.includes('ツイン') ||
      tag.includes('ポニーテール') || tag.includes('お団子')) {
    return 'キャラクター';
  }

  // Eyes - 目・瞳 (after checking expression patterns)
  if (tag.includes('目') || tag.includes('瞳')) {
    // If not already classified as expression, it's character feature
    if (!tag.includes('閉じた') && !tag.includes('見開') && !tag.includes('半目')) {
      return 'キャラクター';
    }
    return '表情';
  }

  // Body type - キャラクター
  if (tag.includes('バスト') || tag.includes('胸') || tag.includes('乳') || tag.includes('体型') ||
      tag.includes('ぺちゃ') || tag.includes('歯') || tag.includes('耳') || tag.includes('尻尾')) {
    return 'キャラクター';
  }

  // Clothing - 服装
  if (tag.includes('服') || tag.includes('衣装') || tag.includes('スカート') || tag.includes('パンティ') ||
      tag.includes('ストッキング') || tag.includes('靴') || tag.includes('ベルト') ||
      tag.includes('ガーター') || tag.includes('コスチューム') || tag.includes('コスプレ') ||
      tag.includes('メイク') || tag.includes('ジュエリー') || tag.includes('イヤリング') ||
      tag.includes('アクセサリー') || tag.includes('ヘアクリップ') ||
      tag.includes('ギャル') || tag.includes('フレア')) {
    return '服装';
  }

  // Pose keywords - ポーズ
  if (tag.includes('ポーズ') ||
      tag.includes('立ちポーズ') || tag.includes('立ち') || tag.includes('座') || tag.includes('寝') ||
      tag.includes('腕を') || tag.includes('足を') || tag.includes('脚を') || tag.includes('手を') ||
      tag.includes('拘束') || tag.includes('縛') || tag.includes('ボンデージ') ||
      tag.includes('ロープ') || tag.includes('吊り下げ') || tag.includes('組む') ||
      tag.includes('後ろで組む') || tag.includes('背中の後ろ') ||
      tag.includes('指差し') || tag.includes('指を') || tag.includes('わずかに開いた')) {
    return 'ポーズ';
  }

  // Composition/Background - 構図・アングル・背景
  if (tag.includes('屋内') || tag.includes('屋外') || tag.includes('背景') || tag.includes('部屋') ||
      tag.includes('ショット') || tag.includes('アングル') || tag.includes('視点') ||
      tag.includes('被写界深度') || tag.includes('ぼやけた前景')) {
    return '構図・アングル・背景';
  }

  // Effects - エフェクト
  if (tag.includes('モーションブラー') || tag.includes('ブラー') || tag.includes('エフェクト') ||
      tag.includes('輝') || tag.includes('光') || tag.includes('影') || tag.includes('動きの線') ||
      tag.includes('吹き出し') || tag.includes('汗') || tag.includes('震え')) {
    return 'エフェクト';
  }

  // Character basic - キャラクター
  if (tag.includes('女') || tag.includes('男') || tag.includes('女の子') || tag.includes('少女') ||
      tag.includes('ソロ') || tag.includes('一人') || tag.includes('フォーカス') ||
      tag.includes('学生') || tag.includes('魔法少女') ||
      tag.includes('若々しい') || tag.includes('かわいい') || tag.includes('美しい')) {
    return 'キャラクター';
  }

  return null;
};

/**
 * Classify English tags by pattern
 */
const classifyEnglishByPattern = (tag: string): string | null => {
  const lower = tag.toLowerCase();

  // Hair colors and styles
  if (lower.includes('hair') || lower.includes('blonde') || lower.includes('brunette') ||
      lower.includes('ponytail') || lower.includes('twintails')) {
    return 'キャラクター';
  }

  // Expression
  if (lower.includes('wink') || lower.includes('smile') || lower.includes('crying') ||
      lower.includes('mouth') || lower.includes('eyes closed') || lower.includes('frown')) {
    return '表情';
  }

  // Body features
  if (lower.includes('breasts') || lower.includes('bust')) {
    return 'キャラクター';
  }

  // Clothing
  if (lower.includes('stocking') || lower.includes('skirt') || lower.includes('dress') ||
      lower.includes('costume') || lower.includes('earring') || lower.includes('jewelry') ||
      lower.includes('garter')) {
    return '服装';
  }

  // Pose
  if (lower.includes('pose') || lower.includes('standing') || lower.includes('sitting') ||
      lower.includes('arms') || lower.includes('legs') || lower.includes('bondage') ||
      lower.includes('restrained') || lower.includes('tied') || lower.includes('bound')) {
    return 'ポーズ';
  }

  // Background/composition
  if (lower.includes('indoor') || lower.includes('outdoor') || lower.includes('background') ||
      lower.includes('depth of field') || lower.includes('shot')) {
    return '構図・アングル・背景';
  }

  // Effects
  if (lower.includes('blur') || lower.includes('motion') || lower.includes('glow') ||
      lower.includes('sweat') || lower.includes('trembling')) {
    return 'エフェクト';
  }

  // Character
  if (lower.includes('girl') || lower.includes('boy') || lower.includes('solo') ||
      lower.includes('focus') || lower.includes('student')) {
    return 'キャラクター';
  }

  return null;
};

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

  // Try pattern matching first (for both languages)
  if (language === 'ja') {
    const patternCategory = classifyByPattern(normalizedTag);
    if (patternCategory) {
      return patternCategory;
    }
  } else {
    const patternCategory = classifyEnglishByPattern(normalizedTag);
    if (patternCategory) {
      return patternCategory;
    }
  }

  // 1. Exact match
  const category = tagMap.get(normalizedTag);
  if (category) {
    return category;
  }

  // 2. Try partial matching with similarity scoring
  // 複雑なタグの部分一致を試行（類似度スコアリング付き）
  let bestMatch: { category: string; similarity: number } | null = null;

  for (const [registeredTag, cat] of tagMap.entries()) {
    // Skip very short tags to avoid false positives
    if (registeredTag.length < 2) continue;

    const similarity = calculateSimilarity(normalizedTag, registeredTag);

    // If similarity is high enough, consider it a match
    if (similarity > 0.6 && (!bestMatch || similarity > bestMatch.similarity)) {
      bestMatch = { category: cat, similarity };
    }
  }

  if (bestMatch) {
    return bestMatch.category;
  }

  // 3. Word-based matching for Japanese
  // 日本語の場合、単語ベースのマッチングを試行
  if (language === 'ja') {
    for (const [registeredTag, cat] of tagMap.entries()) {
      // Check if tag contains the registered keyword
      if (normalizedTag.includes(registeredTag) && registeredTag.length >= 2) {
        return cat;
      }
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

  // Debug: Log uncategorized tags in development
  const uncategorized = classified['その他'];
  if (import.meta.env.DEV && uncategorized && uncategorized.length > 0) {
    console.log('[TagOrganizer] Uncategorized tags:', uncategorized);
  }

  return formatOrganizedTags(classified, {
    includeEmptyCategories: false,
    includeCategoryLabels,
  });
};
