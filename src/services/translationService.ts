/**
 * Translation Service (Multi-Provider Support)
 *
 * Supports both Gemini API and Google Translate:
 * - Gemini API: Direct API call to Google Generative Language API
 * - Google Translate: Free unofficial API via translate-google library
 *
 * Based on the reference AutoHotkey script pattern
 * Reference: GeminiAPI3_optimized.ahk
 */

import type {
  TranslationDirection,
  GeminiRequest,
  GeminiResponse,
  TranslationErrorCode
} from '../types';
import { TranslationError, isGeminiResponse } from '../types';
import type { TranslatorType } from '../contexts/SettingsContext';
import { translateTextWithGoogle } from './googleTranslateService';
import {
  APPROVED_GEMINI_MODELS,
  DEFAULT_GEMINI_MODEL,
  GEMINI_API_BASE_URL,
  TRANSLATION_TIMEOUT_MS,
  TRANSLATION_MAX_RETRIES,
  TRANSLATION_TEMPERATURE,
  TRANSLATION_MAX_OUTPUT_TOKENS,
  SAFETY_CATEGORIES,
  DEFAULT_SAFETY_THRESHOLD
} from '../constants';
import { createScopedLogger } from '../utils/logger';
import { maskPromptSyntax, unmaskPromptSyntax } from '../utils/promptSyntaxProtector';

// ===== Logger =====

const logger = createScopedLogger('TranslationService');

// ===== Constants =====

/**
 * Approved Gemini model type (imported from constants.ts)
 */
type ApprovedModel = typeof APPROVED_GEMINI_MODELS[number];

/**
 * Gemini API configuration
 */
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_MODEL: ApprovedModel = (import.meta.env.VITE_GEMINI_MODEL || DEFAULT_GEMINI_MODEL) as ApprovedModel;

/**
 * Validate model ID against approved list
 */
const validateModelId = (modelId: string): modelId is ApprovedModel => {
  return APPROVED_GEMINI_MODELS.includes(modelId as ApprovedModel);
};

/**
 * Get API endpoint URL
 */
const getApiUrl = (modelId: ApprovedModel = GEMINI_MODEL): string => {
  if (!validateModelId(modelId)) {
    throw new TranslationError(
      `Invalid model ID: ${modelId}. Use approved models only.`,
      'INVALID_RESPONSE',
      500
    );
  }

  return `${GEMINI_API_BASE_URL}/models/${modelId}:generateContent`;
};

// ===== Prompt Templates =====

/**
 * Translation prompts optimized for AI image generation context
 * Based on reference script's prompt patterns
 */
const TRANSLATION_PROMPTS: Record<TranslationDirection, string> = {
  'en-to-ja': `以下の英語のAI画像生成プロンプトを、日本語に翻訳してください。
意味とニュアンスを正確に保持し、タグ形式（カンマ区切り）を維持してください。
【重要】括弧内のテキストも翻訳してください。ただし、括弧の構造と重み値（:1.3など）は必ず保持してください。
例: (beautiful eyes:1.2) → (美しい目:1.2)
翻訳結果のみを出力し、説明は不要です。

翻訳対象: `,

  'ja-to-en': `以下の日本語テキストを、AI画像生成プロンプトに適した英語に翻訳してください。
【変換ルール】
1. タグ形式（カンマ区切り）で出力
2. 複数語は アンダースコアで結合（例: long_hair, blue_eyes）
3. 品質タグを先頭に配置（masterpiece, best quality等）
4. 【重要】括弧内のテキストも翻訳してください。ただし、括弧の構造と重み値（:1.3など）は必ず保持してください。
   例: (美しい目:1.2) → (beautiful_eyes:1.2)
5. 日本語は一切使用禁止、全て英語で出力

翻訳結果のみを出力し、説明は不要です。

翻訳対象: `
};

/**
 * Translation prompts with category organization
 * カテゴリ別整理付き翻訳プロンプト
 */
const ORGANIZED_TRANSLATION_PROMPTS: Record<TranslationDirection, string> = {
  'en-to-ja': `以下の英語のAI画像生成プロンプトを、日本語に翻訳し、カテゴリ別に整理してください。

【翻訳ルール】
- 意味とニュアンスを正確に保持
- タグ形式（カンマ区切り）を維持
- 括弧内のテキストも翻訳し、括弧の構造と重み値（:1.3など）は必ず保持
  例: (beautiful eyes:1.2) → (美しい目:1.2)

【カテゴリ整理ルール】
以下の順序でタグをカテゴリ別に分類し、各カテゴリを空行（改行2つ）で区切ってください。
カテゴリ名は出力せず、タグのみを出力してください。

1. 品質: masterpiece, best quality, 8Kなどの画質・品質関連
2. キャラクター: 髪型、髪色、目、体型、人物の特徴
3. 表情: 笑顔、ウィンク、口の状態、感情表現
4. 服装: 衣装、アクセサリー、装飾品
5. ポーズ: 姿勢、手足の配置、動作
6. シチュエーション: 状況、行動、関係性
7. 構図・アングル・背景: カメラアングル、背景、場所
8. エフェクト: 視覚効果、ライティング、モーションブラー

分類できないタグは最後にまとめてください。
翻訳結果のみを出力し、説明は不要です。

翻訳対象: `,

  'ja-to-en': `以下の日本語テキストを、AI画像生成プロンプトに適した英語に翻訳し、カテゴリ別に整理してください。

【翻訳ルール】
1. タグ形式（カンマ区切り）で出力
2. 複数語はアンダースコアで結合（例: long_hair, blue_eyes）
3. 括弧内のテキストも翻訳し、括弧の構造と重み値（:1.3など）は必ず保持
   例: (美しい目:1.2) → (beautiful_eyes:1.2)
4. 日本語は一切使用禁止、全て英語で出力

【カテゴリ整理ルール】
以下の順序でタグをカテゴリ別に分類し、各カテゴリを空行（改行2つ）で区切ってください。
カテゴリ名は出力せず、タグのみを出力してください。

1. Quality: masterpiece, best quality, 8K resolution, etc.
2. Character: hair style, hair color, eyes, body type, character features
3. Expression: smile, wink, mouth state, emotions
4. Clothing: costumes, accessories, ornaments
5. Pose: posture, limb placement, actions
6. Situation: context, activities, relationships
7. Composition/Angle/Background: camera angle, background, location
8. Effects: visual effects, lighting, motion blur

Unclassified tags should be grouped at the end.
翻訳結果のみを出力し、説明は不要です。

翻訳対象: `
};


// ===== Helper Functions =====

/**
 * Create translation prompt
 */
const createPrompt = (
  text: string,
  direction: TranslationDirection,
  organizeByCategory: boolean = false
): string => {
  const template = organizeByCategory
    ? ORGANIZED_TRANSLATION_PROMPTS[direction]
    : TRANSLATION_PROMPTS[direction];
  return template + text;
};

/**
 * Fetch with timeout wrapper
 */
const fetchWithTimeout = async (
  url: string,
  options: RequestInit,
  timeout: number
): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === 'AbortError') {
      throw new TranslationError(
        'リクエストがタイムアウトしました',
        'TIMEOUT',
        408
      );
    }

    throw error;
  }
};

/**
 * Parse Gemini API response
 */
const parseGeminiResponse = (data: GeminiResponse): string => {
  // Check for API error
  if (data.error) {
    throw new TranslationError(
      `Gemini APIエラー: ${data.error.message}`,
      'API_HTTP_ERROR',
      data.error.code
    );
  }

  // Check for candidates
  if (!data.candidates || data.candidates.length === 0) {
    throw new TranslationError(
      '翻訳結果が空です',
      'INVALID_RESPONSE',
      500
    );
  }

  const candidate = data.candidates[0];

  // Check finish reason
  if (candidate?.finishReason && candidate.finishReason !== 'STOP') {
    const reason = candidate.finishReason;

    let errorCode: TranslationErrorCode = 'UNEXPECTED_ERROR';
    let errorMessage = `翻訳が中断されました: ${reason}`;

    if (reason === 'MAX_TOKENS') {
      errorCode = 'MAX_TOKENS';
      errorMessage = 'テキストが長すぎます。短く分割してください。';
    } else if (reason === 'SAFETY' || reason === 'RECITATION') {
      errorCode = 'BLOCKED_CONTENT';
      errorMessage = '不適切なコンテンツとして判定されました。';
    }

    throw new TranslationError(errorMessage, errorCode, 400);
  }

  // Extract text
  const text = candidate?.content?.parts?.[0]?.text;

  if (!text || text.trim() === '') {
    throw new TranslationError(
      '翻訳結果のテキストが空です',
      'INVALID_RESPONSE',
      500
    );
  }

  return text.trim();
};

// ===== Main Translation Function =====

/**
 * Translate text using selected translation service
 *
 * @param text - Text to translate
 * @param direction - Translation direction
 * @param modelId - Gemini model to use (optional, defaults to GEMINI_MODEL)
 * @param translatorType - Translation service to use ('gemini' or 'google-translate')
 * @returns Translated text
 * @throws {TranslationError} If translation fails
 *
 * @example
 * ```typescript
 * const result = await translateText('Hello, world!', 'en-to-ja', 'gemini-2.5-pro', 'gemini');
 * console.log(result); // "こんにちは、世界！"
 * ```
 */
export const translateText = async (
  text: string,
  direction: TranslationDirection,
  modelId: ApprovedModel = GEMINI_MODEL,
  translatorType: TranslatorType = 'gemini',
  organizeByCategory: boolean = false
): Promise<string> => {
  // Route to appropriate translation service
  if (translatorType === 'google-translate') {
    // Note: Google Translate doesn't support category organization
    // If organizeByCategory is true but using Google Translate,
    // the organization will be handled client-side
    return translateTextWithGoogle(text, direction);
  }

  // Default: Use Gemini API (with optional category organization)
  return translateTextWithGemini(text, direction, modelId, organizeByCategory);
};

/**
 * Translate text using Gemini API
 *
 * @param text - Text to translate
 * @param direction - Translation direction
 * @param modelId - Gemini model to use (optional, defaults to GEMINI_MODEL)
 * @returns Translated text
 * @throws {TranslationError} If translation fails
 *
 * @example
 * ```typescript
 * const result = await translateTextWithGemini('Hello, world!', 'en-to-ja');
 * console.log(result); // "こんにちは、世界！"
 * ```
 */
export const translateTextWithGemini = async (
  text: string,
  direction: TranslationDirection,
  modelId: ApprovedModel = GEMINI_MODEL,
  organizeByCategory: boolean = false
): Promise<string> => {
  // Validation: API key
  if (!GEMINI_API_KEY) {
    throw new TranslationError(
      'Gemini APIキーが設定されていません。環境変数 VITE_GEMINI_API_KEY を確認してください。',
      'MISSING_API_KEY',
      500
    );
  }

  // Validation: Empty text
  if (!text || text.trim() === '') {
    return '';
  }

  // Mask special prompt syntax before translation
  const { maskedText, mappings } = maskPromptSyntax(text);

  // Log masking details in development mode
  if (mappings.length > 0) {
    logger.debug('Masked special syntax', {
      originalLength: text.length,
      maskedLength: maskedText.length,
      syntaxCount: mappings.length
    });
  }

  // Create prompt with masked text
  const prompt = createPrompt(maskedText, direction, organizeByCategory);

  // Build request body
  const requestBody: GeminiRequest = {
    contents: [
      {
        parts: [
          {
            text: prompt
          }
        ]
      }
    ],
    generationConfig: {
      temperature: TRANSLATION_TEMPERATURE,
      maxOutputTokens: TRANSLATION_MAX_OUTPUT_TOKENS
    },
    safetySettings: SAFETY_CATEGORIES.map((category) => ({
      category,
      threshold: DEFAULT_SAFETY_THRESHOLD
    }))
  };

  // Retry loop
  for (let attempt = 0; attempt < TRANSLATION_MAX_RETRIES; attempt++) {
    try {
      const apiUrl = getApiUrl(modelId);
      const url = `${apiUrl}?key=${GEMINI_API_KEY}`;

      // Log request details in development mode (API key excluded for security)
      logger.debug('Translation request initiated', {
        direction,
        modelId,
        attempt: attempt + 1,
        textLength: text.length
      });

      // Send request
      const response = await fetchWithTimeout(
        url,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        },
        TRANSLATION_TIMEOUT_MS
      );

      // Check HTTP status
      if (!response.ok) {
        // Get error response body for detailed logging
        let errorBody = '';
        try {
          errorBody = await response.text();
          logger.error(`API error response (HTTP ${response.status})`, { errorBody });
        } catch (e) {
          logger.error('Failed to read error response body', e);
        }

        // Retry on 429 (rate limit), 503 (service unavailable), or 500 (server error)
        if ((response.status === 429 || response.status === 503 || response.status === 500) && attempt < TRANSLATION_MAX_RETRIES - 1) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff

          // Log retry attempt
          logger.debug(`Retrying after HTTP ${response.status} error`, {
            attempt: attempt + 1,
            maxRetries: TRANSLATION_MAX_RETRIES,
            delayMs: delay
          });

          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        // Parse error details for user-friendly message
        let userMessage = '';
        try {
          const errorData = JSON.parse(errorBody);
          const apiErrorMessage = errorData?.error?.message || '';

          // Check for specific error patterns
          if (apiErrorMessage.includes('API key not valid') || apiErrorMessage.includes('API_KEY_INVALID')) {
            userMessage = 'APIキーが無効です。設定を確認してください。';
          } else if (apiErrorMessage.includes('models/') && apiErrorMessage.includes('not found')) {
            userMessage = `指定されたモデル (${modelId}) が見つかりません。モデル名を確認してください。`;
          } else if (response.status === 429) {
            userMessage = 'APIのレート制限に達しました。少し待ってから再度お試しください。';
          } else if (response.status === 503) {
            userMessage = 'APIサーバーが一時的に利用できません。';
          } else if (response.status === 400) {
            userMessage = `リクエストエラー: ${apiErrorMessage || '不正なリクエストです'}`;
          } else if (response.status === 403) {
            userMessage = `アクセス拒否: ${apiErrorMessage || 'APIキーの権限を確認してください'}`;
          } else if (response.status === 404) {
            userMessage = `リソースが見つかりません: ${apiErrorMessage || 'モデルIDを確認してください'}`;
          } else {
            userMessage = `APIエラー (HTTP ${response.status}): ${apiErrorMessage || '不明なエラー'}`;
          }
        } catch (e) {
          userMessage = `Gemini APIがエラーを返しました (HTTP ${response.status})`;
        }

        throw new TranslationError(
          userMessage,
          'API_HTTP_ERROR',
          response.status,
          attempt + 1,
          TRANSLATION_MAX_RETRIES
        );
      }

      // Parse JSON
      const data: unknown = await response.json();

      // Validate response structure
      if (!isGeminiResponse(data)) {
        throw new TranslationError(
          '不正なレスポンス形式です',
          'INVALID_RESPONSE',
          500
        );
      }

      // Parse result
      const translatedText = parseGeminiResponse(data);

      // Restore original syntax
      const restoredText = unmaskPromptSyntax(translatedText, mappings);

      // Log restoration in development mode
      if (mappings.length > 0) {
        logger.debug('Restored special syntax', {
          translatedLength: translatedText.length,
          restoredLength: restoredText.length
        });
      }

      return restoredText;

    } catch (error) {
      // Re-throw TranslationError
      if (error instanceof TranslationError) {
        // Retry on timeout
        if (error.code === 'TIMEOUT' && attempt < TRANSLATION_MAX_RETRIES - 1) {
          const delay = Math.pow(2, attempt) * 1000;

          // Log retry attempt
          logger.debug('Retrying after timeout', {
            attempt: attempt + 1,
            maxRetries: TRANSLATION_MAX_RETRIES,
            delayMs: delay
          });

          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        throw error;
      }

      // Network error
      if (error instanceof TypeError && error.message.includes('fetch')) {
        // Retry on network error
        if (attempt < TRANSLATION_MAX_RETRIES - 1) {
          const delay = Math.pow(2, attempt) * 1000;

          // Log retry attempt
          logger.debug('Retrying after network error', {
            attempt: attempt + 1,
            maxRetries: TRANSLATION_MAX_RETRIES,
            delayMs: delay
          });

          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        throw new TranslationError(
          'ネットワークエラーが発生しました。インターネット接続を確認してください。',
          'NETWORK_ERROR',
          0,
          attempt + 1,
          TRANSLATION_MAX_RETRIES
        );
      }

      // Unexpected error
      throw new TranslationError(
        `予期しないエラーが発生しました: ${error instanceof Error ? error.message : String(error)}`,
        'UNEXPECTED_ERROR',
        500,
        attempt + 1,
        TRANSLATION_MAX_RETRIES
      );
    }
  }

  // Max retries exceeded
  throw new TranslationError(
    '最大リトライ回数を超えました',
    'TIMEOUT',
    408,
    TRANSLATION_MAX_RETRIES,
    TRANSLATION_MAX_RETRIES
  );
};

// ===== Health Check =====

/**
 * Check if Gemini API is accessible
 *
 * @returns true if API is accessible
 */
export const checkApiHealth = async (): Promise<boolean> => {
  if (!GEMINI_API_KEY) {
    return false;
  }

  try {
    await translateText('test', 'en-to-ja');
    return true;
  } catch {
    return false;
  }
};
