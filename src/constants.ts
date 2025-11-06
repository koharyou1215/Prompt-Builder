/**
 * Application-wide constants
 *
 * Centralized configuration values for easy maintenance and consistency.
 * All magic numbers and repeated values should be defined here.
 */

// ===== Translation Configuration =====

/**
 * Debounce delay for translation requests (milliseconds)
 * Prevents excessive API calls during user typing
 */
export const TRANSLATION_DEBOUNCE_MS = 500;

/**
 * HTTP request timeout for Gemini API (milliseconds)
 */
export const TRANSLATION_TIMEOUT_MS = 30000; // 30 seconds

/**
 * Maximum retry attempts for failed translation requests
 */
export const TRANSLATION_MAX_RETRIES = 2;

/**
 * Default temperature for Gemini API generation
 * Lower values (0.0-0.5) = more deterministic
 * Higher values (0.5-1.0) = more creative
 */
export const TRANSLATION_TEMPERATURE = 0.1;

/**
 * Maximum output tokens for Gemini API response
 */
export const TRANSLATION_MAX_OUTPUT_TOKENS = 8192;

// ===== Storage Configuration =====

/**
 * Maximum number of history entries to keep
 * Older entries are automatically cleaned up
 */
export const MAX_HISTORY_ENTRIES = 50;

/**
 * Chrome Storage Local quota (bytes)
 * Standard limit is 10MB
 */
export const STORAGE_QUOTA_BYTES = 10 * 1024 * 1024; // 10MB

/**
 * Storage keys for Chrome Storage API
 */
export const STORAGE_KEYS = {
  AUTO_SAVE: 'autoSave',
  HISTORY: 'history',
  CUSTOM_KEYWORDS: 'customKeywords',
  SETTINGS: 'app-settings'
} as const;

// ===== UI Configuration =====

/**
 * Duration for toast notifications (milliseconds)
 */
export const TOAST_DURATION_MS = 3000;

/**
 * Standard animation/transition duration (milliseconds)
 */
export const ANIMATION_DURATION_MS = 200;

/**
 * Minimum touch target size for accessibility (pixels)
 * Following iOS HIG and Material Design guidelines
 */
export const MIN_TOUCH_TARGET_SIZE = 44;

// ===== ID Generation =====

/**
 * ID prefix for different entity types
 */
export const ID_PREFIXES = {
  HISTORY: 'history',
  CUSTOM_KEYWORD: 'custom'
} as const;

// ===== Validation =====

/**
 * Minimum length for custom keyword inputs
 */
export const MIN_KEYWORD_LENGTH = 1;

/**
 * Maximum length for custom keyword inputs
 */
export const MAX_KEYWORD_LENGTH = 100;

/**
 * Maximum length for prompt text
 */
export const MAX_PROMPT_LENGTH = 10000;

// ===== API Configuration =====

/**
 * Approved Gemini models (from RULES.md)
 */
export const APPROVED_GEMINI_MODELS = [
  'gemini-2.5-pro',
  'gemini-2.5-flash-preview-09-2025',
  'gemini-2.5-flash-lite-preview-09-2025'
] as const;

/**
 * Default Gemini model
 */
export const DEFAULT_GEMINI_MODEL = 'gemini-2.5-pro' as const;

/**
 * Gemini API base URL
 */
export const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

// ===== Safety Settings =====

/**
 * Gemini API safety settings categories
 */
export const SAFETY_CATEGORIES = [
  'HARM_CATEGORY_HATE_SPEECH',
  'HARM_CATEGORY_SEXUALLY_EXPLICIT',
  'HARM_CATEGORY_DANGEROUS_CONTENT',
  'HARM_CATEGORY_HARASSMENT'
] as const;

/**
 * Default safety threshold (no blocking for prompt generation use case)
 */
export const DEFAULT_SAFETY_THRESHOLD = 'BLOCK_NONE' as const;

// ===== User-Friendly Error Messages =====

/**
 * Translation error messages (user-facing)
 */
export const TRANSLATION_ERROR_MESSAGES = {
  MISSING_API_KEY: 'APIキーが設定されていません。設定を確認してください。',
  TIMEOUT: 'リクエストがタイムアウトしました。もう一度お試しください。',
  NETWORK_ERROR: 'ネットワーク接続を確認してください。',
  API_HTTP_ERROR: 'APIサーバーにエラーが発生しました。',
  INVALID_RESPONSE: 'APIレスポンスが不正です。',
  BLOCKED_CONTENT: '不適切なコンテンツとして判定されました。',
  MAX_TOKENS: 'テキストが長すぎます。短く分割してください。',
  UNEXPECTED_ERROR: '予期しないエラーが発生しました。',
  API_KEY_INVALID: 'APIキーが無効です。設定を確認してください。',
  RATE_LIMIT: 'APIのレート制限に達しました。少し待ってから再度お試しください。',
  SERVICE_UNAVAILABLE: 'APIサーバーが一時的に利用できません。',
  BAD_REQUEST: 'リクエストエラーが発生しました。',
  FORBIDDEN: 'アクセスが拒否されました。APIキーの権限を確認してください。',
  NOT_FOUND: 'リソースが見つかりません。モデルIDを確認してください。'
} as const;

/**
 * Storage error messages (user-facing)
 */
export const STORAGE_ERROR_MESSAGES = {
  LOAD_FAILED: 'データの読み込みに失敗しました。',
  SAVE_FAILED: 'データの保存に失敗しました。',
  REMOVE_FAILED: 'データの削除に失敗しました。',
  CLEAR_FAILED: 'データのクリアに失敗しました。'
} as const;

// ===== Category Color Configuration =====

/**
 * Default color palette for category color settings
 * Following Tailwind CSS color scheme for consistency
 */
export const DEFAULT_CATEGORY_COLORS: ReadonlyArray<string> = [
  '#EF4444', // red-500
  '#F59E0B', // amber-500
  '#10B981', // emerald-500
  '#3B82F6', // blue-500
  '#8B5CF6', // violet-500
  '#EC4899', // pink-500
  '#06B6D4', // cyan-500
  '#84CC16', // lime-500
] as const;
