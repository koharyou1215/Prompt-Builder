/**
 * Google Translate Service (Chrome Extension Background Worker)
 *
 * Uses chrome.runtime messaging to call translation via background worker
 * This avoids CORS issues by executing fetch in the service worker context
 * No API key required
 */

import type { TranslationDirection } from '../types';
import { TranslationError } from '../types';
import { TRANSLATION_MAX_RETRIES } from '../constants';
import { maskPromptSyntax, unmaskPromptSyntax } from '../utils/promptSyntaxProtector';

/**
 * Language codes for Google Translate
 */
const LANGUAGE_MAP: Record<TranslationDirection, { from: string; to: string }> = {
  'en-to-ja': { from: 'en', to: 'ja' },
  'ja-to-en': { from: 'ja', to: 'en' }
};

/**
 * Message types for background worker communication
 */
interface TranslateMessage {
  type: 'TRANSLATE_GOOGLE';
  text: string;
  from: string;
  to: string;
}

interface TranslateResponse {
  success: boolean;
  result?: string;
  error?: string;
}

/**
 * Send translation request to background worker
 */
async function translateViaBackground(text: string, from: string, to: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const message: TranslateMessage = {
      type: 'TRANSLATE_GOOGLE',
      text,
      from,
      to
    };

    console.log('[GoogleTranslate] Sending message to background:', { from, to, textLength: text.length });

    try {
      chrome.runtime.sendMessage(message, (response: TranslateResponse | undefined) => {
        console.log('[GoogleTranslate] Received response:', response);
        console.log('[GoogleTranslate] Last error:', chrome.runtime.lastError);

        if (chrome.runtime.lastError) {
          const error = chrome.runtime.lastError.message || 'Unknown error';
          console.error('[GoogleTranslate] Runtime error:', error);
          reject(new Error(error));
          return;
        }

        if (!response) {
          console.error('[GoogleTranslate] No response received');
          reject(new Error('No response from background worker'));
          return;
        }

        if (response.success && response.result) {
          console.log('[GoogleTranslate] Translation successful');
          resolve(response.result);
        } else {
          console.error('[GoogleTranslate] Translation failed:', response.error);
          reject(new Error(response.error || 'Translation failed'));
        }
      });
    } catch (error) {
      console.error('[GoogleTranslate] Exception while sending message:', error);
      reject(error);
    }
  });
}

/**
 * Translate text using Google Translate (via background worker)
 *
 * @param text - Text to translate
 * @param direction - Translation direction
 * @returns Translated text
 * @throws {TranslationError} If translation fails
 *
 * @example
 * ```typescript
 * const result = await translateTextWithGoogle('Hello, world!', 'en-to-ja');
 * console.log(result); // "こんにちは、世界！"
 * ```
 */
export const translateTextWithGoogle = async (
  text: string,
  direction: TranslationDirection
): Promise<string> => {
  // Validation: Empty text
  if (!text || text.trim() === '') {
    return '';
  }

  // Mask special prompt syntax before translation
  const { maskedText, counters } = maskPromptSyntax(text);

  // Log masking details in development mode
  const totalSyntaxCount = counters.lparen + counters.lbrace + counters.lbracket + counters.weight;
  if (import.meta.env.DEV && totalSyntaxCount > 0) {
    console.log('[Google Translate] Masked special syntax', {
      originalLength: text.length,
      maskedLength: maskedText.length,
      syntaxCount: totalSyntaxCount
    });
  }

  const { from, to } = LANGUAGE_MAP[direction];

  // Retry loop
  for (let attempt = 0; attempt < TRANSLATION_MAX_RETRIES; attempt++) {
    try {
      // Log request details in development mode
      if (import.meta.env.DEV) {
        console.log(`[Google Translate] Request:`, {
          direction,
          from,
          to,
          attempt: attempt + 1,
          textLength: maskedText.length
        });
      }

      // Send translation request to background worker with masked text
      const translatedText = await translateViaBackground(maskedText, from, to);

      // Restore original syntax
      const restoredText = unmaskPromptSyntax(translatedText, counters);

      // Log success in development mode
      if (import.meta.env.DEV) {
        console.log(`[Google Translate] Success:`, {
          translatedLength: translatedText.length,
          restoredLength: restoredText.length
        });
      }

      return restoredText;

    } catch (error) {
      // Retry on error
      if (attempt < TRANSLATION_MAX_RETRIES - 1) {
        const delay = Math.pow(2, attempt) * 1000;

        // Log retry attempt in development mode
        if (import.meta.env.DEV) {
          console.log(`[Google Translate] Retrying after error (attempt ${attempt + 1}/${TRANSLATION_MAX_RETRIES}), waiting ${delay}ms`);
        }

        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      // Max retries exceeded
      throw new TranslationError(
        `Google翻訳でエラーが発生しました: ${error instanceof Error ? error.message : String(error)}`,
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

