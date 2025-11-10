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
括弧 () や記号は必ず保持してください。
翻訳結果のみを出力し、説明は不要です。

翻訳対象: `,

  'ja-to-en': `以下の日本語テキストを、AI画像生成プロンプトに適した英語に翻訳してください。
【変換ルール】
1. タグ形式（カンマ区切り）で出力
2. 複数語は アンダースコアで結合（例: long_hair, blue_eyes）
3. 品質タグを先頭に配置（masterpiece, best quality等）
4. 括弧 () や記号は必ず保持してください（強調を表します）
5. 日本語は一切使用禁止、全て英語で出力

翻訳結果のみを出力し、説明は不要です。

翻訳対象: `
};

// ===== Helper Functions =====

/**
 * Create translation prompt
 */
const createPrompt = (text: string, direction: TranslationDirection): string => {
  const template = TRANSLATION_PROMPTS[direction];
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

// ===== Helper Functions for Translation =====

/**
 * Validate translation input
 *
 * @param text - Text to validate
 * @returns Validated text or empty string
 */
const validateTranslationInput = (text: string): string => {
  if (!text || text.trim() === '') {
    return '';
  }
  return text.trim();
};

/**
 * Build Gemini API request body
 *
 * @param prompt - Translation prompt
 * @returns Gemini request object
 */
const buildGeminiRequest = (prompt: string): GeminiRequest => {
  return {
    contents: [
      {
        parts: [{ text: prompt }]
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
};

/**
 * Map API error to user-friendly message
 *
 * @param status - HTTP status code
 * @param errorBody - Error response body
 * @param modelId - Model ID used in request
 * @returns User-friendly error message
 */
const mapApiErrorToMessage = (
  status: number,
  errorBody: string,
  modelId: string
): string => {
  try {
    const errorData = JSON.parse(errorBody);
    const apiErrorMessage = errorData?.error?.message || '';

    if (apiErrorMessage.includes('API key not valid') || apiErrorMessage.includes('API_KEY_INVALID')) {
      return 'APIキーが無効です。設定を確認してください。';
    }
    if (apiErrorMessage.includes('models/') && apiErrorMessage.includes('not found')) {
      return `指定されたモデル (${modelId}) が見つかりません。モデル名を確認してください。`;
    }

    switch (status) {
      case 400:
        return `リクエストエラー: ${apiErrorMessage || '不正なリクエストです'}`;
      case 403:
        return `アクセス拒否: ${apiErrorMessage || 'APIキーの権限を確認してください'}`;
      case 404:
        return `リソースが見つかりません: ${apiErrorMessage || 'モデルIDを確認してください'}`;
      case 429:
        return 'APIのレート制限に達しました。少し待ってから再度お試しください。';
      case 503:
        return 'APIサーバーが一時的に利用できません。';
      default:
        return `APIエラー (HTTP ${status}): ${apiErrorMessage || '不明なエラー'}`;
    }
  } catch {
    return `Gemini APIがエラーを返しました (HTTP ${status})`;
  }
};

/**
 * Execute single translation API request
 *
 * @param url - API endpoint URL
 * @param requestBody - Request body
 * @param modelId - Model ID for error messages
 * @returns Translated text
 * @throws {TranslationError} If request fails
 */
const executeTranslationApiCall = async (
  url: string,
  requestBody: GeminiRequest,
  modelId: string
): Promise<string> => {
  const response = await fetchWithTimeout(
    url,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    },
    TRANSLATION_TIMEOUT_MS
  );

  if (!response.ok) {
    let errorBody = '';
    try {
      errorBody = await response.text();
      logger.error(`API error response (HTTP ${response.status})`, { errorBody });
    } catch (e) {
      logger.error('Failed to read error response body', e);
    }

    const userMessage = mapApiErrorToMessage(response.status, errorBody, modelId);
    throw new TranslationError(
      userMessage,
      'API_HTTP_ERROR',
      response.status
    );
  }

  const data: unknown = await response.json();

  if (!isGeminiResponse(data)) {
    throw new TranslationError(
      '不正なレスポンス形式です',
      'INVALID_RESPONSE',
      500
    );
  }

  return parseGeminiResponse(data);
};

/**
 * Calculate exponential backoff delay
 *
 * @param attempt - Current attempt number (0-indexed)
 * @returns Delay in milliseconds
 */
const calculateBackoffDelay = (attempt: number): number => {
  return Math.pow(2, attempt) * 1000;
};

/**
 * Check if error is retryable
 *
 * @param error - Error to check
 * @returns true if error should trigger retry
 */
const isRetryableError = (error: unknown): boolean => {
  if (error instanceof TranslationError) {
    return error.code === 'TIMEOUT' ||
           error.statusCode === 429 ||
           error.statusCode === 503 ||
           error.statusCode === 500;
  }
  return false;
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
  translatorType: TranslatorType = 'gemini'
): Promise<string> => {
  // Route to appropriate translation service
  if (translatorType === 'google-translate') {
    return translateTextWithGoogle(text, direction);
  }

  // Default: Use Gemini API
  return translateTextWithGemini(text, direction, modelId);
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
  modelId: ApprovedModel = GEMINI_MODEL
): Promise<string> => {
  // Validate API key
  if (!GEMINI_API_KEY) {
    throw new TranslationError(
      'Gemini APIキーが設定されていません。環境変数 VITE_GEMINI_API_KEY を確認してください。',
      'MISSING_API_KEY',
      500
    );
  }

  // Validate and normalize input
  const validatedText = validateTranslationInput(text);
  if (!validatedText) {
    return '';
  }

  // Mask special prompt syntax before translation
  const { maskedText, counters } = maskPromptSyntax(validatedText);

  const totalSyntaxCount = counters.lparen + counters.lbrace + counters.lbracket + counters.weight;
  if (totalSyntaxCount > 0) {
    logger.debug('Masked special syntax', {
      originalLength: validatedText.length,
      maskedLength: maskedText.length,
      syntaxCount: totalSyntaxCount
    });
  }

  // Prepare request
  const prompt = createPrompt(maskedText, direction);
  const requestBody = buildGeminiRequest(prompt);
  const apiUrl = getApiUrl(modelId);
  const url = `${apiUrl}?key=${GEMINI_API_KEY}`;

  // Retry loop with exponential backoff
  for (let attempt = 0; attempt < TRANSLATION_MAX_RETRIES; attempt++) {
    try {
      logger.debug('Translation request initiated', {
        direction,
        modelId,
        attempt: attempt + 1,
        textLength: validatedText.length
      });

      // Execute API call
      const translatedText = await executeTranslationApiCall(url, requestBody, modelId);

      // Restore original syntax
      const restoredText = unmaskPromptSyntax(translatedText, counters);

      if (totalSyntaxCount > 0) {
        logger.debug('Restored special syntax', {
          translatedLength: translatedText.length,
          restoredLength: restoredText.length
        });
      }

      return restoredText;

    } catch (error) {
      // Check if we should retry
      const shouldRetry = attempt < TRANSLATION_MAX_RETRIES - 1 && isRetryableError(error);

      if (shouldRetry) {
        const delay = calculateBackoffDelay(attempt);

        logger.debug('Retrying after error', {
          errorType: error instanceof TranslationError ? error.code : 'unknown',
          attempt: attempt + 1,
          maxRetries: TRANSLATION_MAX_RETRIES,
          delayMs: delay
        });

        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      // Handle non-retryable errors
      if (error instanceof TranslationError) {
        throw error;
      }

      // Network error
      if (error instanceof TypeError && error.message.includes('fetch')) {
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

