/**
 * Background Service Worker for Chrome Extension
 *
 * Handles:
 * - Extension installation
 * - Action button clicks (open side panel)
 * - Storage management
 * - Google Translate API calls (to avoid CORS)
 */

/**
 * Google Translate API endpoint
 */
const GOOGLE_TRANSLATE_API = 'https://translate.googleapis.com/translate_a/single';

/**
 * Translation message types
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
 * Installation handler
 * Called when the extension is first installed or updated
 */
chrome.runtime.onInstalled.addListener(() => {
  console.log('インタラクティブAIプロンプト・ビルダーがインストールされました');
});

/**
 * Message handler for translation requests
 */
chrome.runtime.onMessage.addListener(
  (message: unknown, _sender, sendResponse: (response: TranslateResponse) => void) => {
    console.log('[Background] Received message:', message);

    // Type guard to check if message is a TranslateMessage
    if (
      typeof message === 'object' &&
      message !== null &&
      'type' in message &&
      (message as { type: string }).type === 'TRANSLATE_GOOGLE'
    ) {
      const translateMsg = message as TranslateMessage;
      console.log('[Background] Processing translation request:', {
        from: translateMsg.from,
        to: translateMsg.to,
        textLength: translateMsg.text?.length || 0
      });

      // Handle translation in background to avoid CORS
      translateInBackground(translateMsg.text, translateMsg.from, translateMsg.to)
        .then((result) => {
          console.log('[Background] Translation successful, result length:', result.length);
          sendResponse({ success: true, result });
        })
        .catch((error: unknown) => {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.error('[Background] Translation failed:', errorMessage);
          sendResponse({ success: false, error: errorMessage });
        });

      // Return true to indicate we'll send response asynchronously
      return true;
    }

    console.log('[Background] Unknown message type, ignoring');
    return false;
  }
);

/**
 * Perform translation using Google Translate API
 */
async function translateInBackground(text: string, from: string, to: string): Promise<string> {
  const params = new URLSearchParams({
    client: 'gtx',
    sl: from,
    tl: to,
    dt: 't',
    q: text
  });

  const url = `${GOOGLE_TRANSLATE_API}?${params.toString()}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json() as unknown;

    // Response format: [[["translated text 1", "original text 1", ...], ["translated text 2", ...], ...]]
    if (!Array.isArray(data) || !Array.isArray(data[0])) {
      throw new Error('Invalid response format');
    }

    // Concatenate all translation segments
    const segments = data[0];
    const translatedParts: string[] = [];

    for (const segment of segments) {
      if (Array.isArray(segment) && typeof segment[0] === 'string') {
        translatedParts.push(segment[0]);
      }
    }

    const translatedText = translatedParts.join('');

    if (!translatedText.trim()) {
      throw new Error('Empty translation result');
    }

    return translatedText;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Translation timeout');
    }

    throw error;
  }
}

/**
 * Action button click handler
 * Opens the side panel when user clicks the extension icon
 */
chrome.action.onClicked.addListener(async (tab) => {
  if (tab.id === undefined) {
    console.error('Tab ID is undefined');
    return;
  }

  try {
    // Open side panel
    await chrome.sidePanel.open({ tabId: tab.id });
  } catch (error) {
    console.error('Failed to open side panel:', error);
  }
});

/**
 * Optional: Set up side panel behavior
 * Enable side panel for all tabs
 */
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error: Error) => console.error('Failed to set panel behavior:', error));

export {};
