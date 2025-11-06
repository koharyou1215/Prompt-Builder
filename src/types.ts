/**
 * Type definitions for Interactive AI Prompt Builder
 *
 * Rule: No 'any' type allowed - strict type safety enforced
 */

// ===== Translation Types =====

/**
 * Translation direction
 */
export type TranslationDirection = 'en-to-ja' | 'ja-to-en';

/**
 * Gemini API request body structure
 */
export interface GeminiRequest {
  readonly contents: ReadonlyArray<{
    readonly parts: ReadonlyArray<{
      readonly text: string;
    }>;
  }>;
  readonly generationConfig?: {
    readonly temperature?: number;
    readonly maxOutputTokens?: number;
  };
  readonly safetySettings?: ReadonlyArray<{
    readonly category: string;
    readonly threshold: string;
  }>;
}

/**
 * Gemini API response structure
 */
export interface GeminiResponse {
  readonly candidates?: ReadonlyArray<{
    readonly content?: {
      readonly parts?: ReadonlyArray<{
        readonly text?: string;
      }>;
    };
    readonly finishReason?: string;
  }>;
  readonly error?: {
    readonly code: number;
    readonly message: string;
    readonly status: string;
  };
}

/**
 * Translation service error types
 */
export type TranslationErrorCode =
  | 'MISSING_API_KEY'
  | 'TIMEOUT'
  | 'NETWORK_ERROR'
  | 'API_HTTP_ERROR'
  | 'INVALID_RESPONSE'
  | 'BLOCKED_CONTENT'
  | 'MAX_TOKENS'
  | 'UNEXPECTED_ERROR';

/**
 * Translation service error with retry information
 */
export class TranslationError extends Error {
  constructor(
    message: string,
    public readonly code: TranslationErrorCode,
    public readonly statusCode?: number,
    public readonly retryCount?: number,
    public readonly maxRetries?: number
  ) {
    super(message);
    this.name = 'TranslationError';
  }

  /**
   * Get user-friendly error message with retry information
   */
  getUserMessage(): string {
    if (this.retryCount !== undefined && this.maxRetries !== undefined) {
      if (this.retryCount >= this.maxRetries) {
        return `${this.message}（${this.maxRetries}回リトライしましたが失敗しました）`;
      }
      return `${this.message}（リトライ中: ${this.retryCount}/${this.maxRetries}）`;
    }
    return this.message;
  }

  /**
   * Check if error is retryable
   */
  isRetryable(): boolean {
    return (
      this.code === 'API_HTTP_ERROR' &&
      (this.statusCode === 429 || this.statusCode === 503 || this.statusCode === 500)
    ) || this.code === 'TIMEOUT' || this.code === 'NETWORK_ERROR';
  }
}

// ===== Keyword Types =====

/**
 * Keyword with Japanese display and English value
 */
export interface Keyword {
  readonly ja: string;  // Japanese display text
  readonly en: string;  // English prompt keyword
}

/**
 * Keyword category
 */
export interface KeywordCategory {
  readonly categoryName: string;
  readonly keywords: ReadonlyArray<Keyword>;
}

// ===== Prompt State Types =====

/**
 * Prompt target type (positive or negative)
 */
export type PromptTarget = 'positive' | 'negative';

/**
 * Current prompt state
 */
export interface PromptState {
  readonly positive: string;      // English positive prompt
  readonly negative: string;      // English negative prompt
  readonly positiveJa?: string;   // Japanese translation of positive
  readonly negativeJa?: string;   // Japanese translation of negative
  readonly originalPositive?: string;  // Original English before reverse translation
  readonly originalNegative?: string;  // Original English before reverse translation
}

// ===== History Types =====

/**
 * Prompt history entry
 */
export interface HistoryEntry {
  readonly id: string;
  readonly positive: string;      // English positive prompt
  readonly negative: string;      // English negative prompt
  readonly positiveJa: string;    // Japanese translation of positive
  readonly negativeJa: string;    // Japanese translation of negative
  readonly timestamp: number;
  readonly name?: string;
}

// ===== Custom Keyword Types =====

/**
 * Custom keyword added by user
 */
export interface CustomKeyword {
  readonly id: string;
  readonly categoryName: string;  // Category to add to
  readonly ja: string;            // Japanese display text
  readonly en: string;            // English prompt keyword
  readonly createdAt: number;     // Timestamp when created
}

/**
 * Custom category created by user
 */
export interface CustomCategory {
  readonly id: string;
  readonly categoryName: string;  // Category name
  readonly order: number;         // Display order
  readonly createdAt: number;     // Timestamp when created
}

// ===== Category Color Types =====

/**
 * Category color configuration
 */
export interface CategoryColorConfig {
  readonly categoryName: string;  // Category name
  readonly color: string;         // CSS color value (hex, rgb, etc.)
  readonly isCustom: boolean;     // User-defined or default
}

// ===== Storage Types =====

/**
 * Storage keys (constants)
 */
export const StorageKeys = {
  AUTO_SAVE: 'autoSave',
  HISTORY: 'history',
  CUSTOM_KEYWORDS: 'customKeywords',
  CUSTOM_CATEGORIES: 'customCategories',
  CATEGORY_COLORS: 'categoryColors'
} as const;

export type StorageKey = typeof StorageKeys[keyof typeof StorageKeys];

/**
 * Chrome Storage data structure (key-value mapping)
 */
export interface StorageData {
  [StorageKeys.AUTO_SAVE]: PromptState;
  [StorageKeys.HISTORY]: ReadonlyArray<HistoryEntry>;
  [StorageKeys.CUSTOM_KEYWORDS]: ReadonlyArray<CustomKeyword>;
  [StorageKeys.CUSTOM_CATEGORIES]: ReadonlyArray<CustomCategory>;
  [StorageKeys.CATEGORY_COLORS]: ReadonlyArray<CategoryColorConfig>;
}

/**
 * Application error type
 */
export interface AppError {
  readonly type: 'storage' | 'translation' | 'validation' | 'unknown';
  readonly message: string;
  readonly originalError?: Error;
}

/**
 * Storage service response wrapper
 */
export interface StorageServiceResponse<T> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: AppError;
}

// ===== Category Management Types =====

/**
 * Keyword within a category with metadata
 */
export interface CategorizedKeywordItem {
  readonly keyword: string;        // English keyword (e.g., "1girl")
  readonly ja: string;              // Japanese display (e.g., "女の子1人")
  readonly categoryName: string;    // Category it belongs to
  readonly isCustom: boolean;       // Is it a custom keyword?
  readonly order: number;           // Display order within category
  readonly weight?: string;         // Weight if specified (e.g., ":1.2")
}

/**
 * Extended keyword with color information
 */
export interface ColoredKeywordItem extends CategorizedKeywordItem {
  readonly color?: string;          // Category color if configured (CSS color value)
}

/**
 * Category with its keywords
 */
export interface CategoryGroup {
  readonly categoryName: string;
  readonly keywords: ReadonlyArray<CategorizedKeywordItem>;
  readonly isExpanded: boolean;     // For accordion UI
}

/**
 * Categorized prompt state (replaces simple string)
 */
export interface CategorizedPromptState {
  readonly positive: ReadonlyArray<CategoryGroup>;
  readonly negative: ReadonlyArray<CategoryGroup>;
  readonly uncategorized: ReadonlyArray<string>;  // Keywords that couldn't be categorized
}

/**
 * Prompt mode - determines how prompts are edited
 */
export type PromptMode = 'text' | 'category';

/**
 * Extended prompt context state
 */
export interface ExtendedPromptState {
  readonly mode: PromptMode;
  readonly textMode: PromptState;                   // Original flat text mode
  readonly categoryMode: CategorizedPromptState;    // New category mode
}

// ===== Validation Helpers =====

/**
 * Type guard for GeminiResponse
 */
export const isGeminiResponse = (data: unknown): data is GeminiResponse => {
  if (typeof data !== 'object' || data === null) return false;

  const obj = data as Record<string, unknown>;

  // Check for error property
  if ('error' in obj) {
    return typeof obj.error === 'object' && obj.error !== null;
  }

  // Check for candidates property
  if ('candidates' in obj) {
    return Array.isArray(obj.candidates);
  }

  return false;
};
