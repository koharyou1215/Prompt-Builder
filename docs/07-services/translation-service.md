# 翻訳サービス設計

> **ドキュメント情報**
> 作成日: 2025-10-19
> カテゴリ: サービス層
> 関連: [GASデプロイ](../08-deployment/gas-deployment.md) | [useTranslation](../05-hooks/useTranslation.md) | [型定義](../02-types-design.md)

---

## 📖 概要

翻訳サービス（`translationService.ts`）は、Google Apps Script（GAS）翻訳APIとの通信を担当するサービス層のモジュールです。

### 主な責務

- **API通信**: GAS翻訳APIへのHTTPリクエスト
- **エラーハンドリング**: ネットワークエラー、APIエラーの処理
- **型安全性**: TypeScriptによる完全な型付け
- **環境変数管理**: APIエンドポイントURLの外部化

---

## 🏗️ アーキテクチャ

```
React Component
     ↓
useTranslation Hook
     ↓
translationService.ts ← このレイヤー
     ↓
Google Apps Script API
     ↓
Google Translation API
```

---

## 📝 型定義

### TranslationDirection

```typescript
export type TranslationDirection = 'en-to-ja' | 'ja-to-en';
```

### TranslationRequest

```typescript
interface TranslationRequest {
  readonly text: string;
  readonly direction: TranslationDirection;
}
```

### TranslationResponse

```typescript
interface TranslationResponse {
  readonly success: boolean;
  readonly data?: {
    readonly translatedText: string;
    readonly originalText: string;
    readonly direction: TranslationDirection;
    readonly timestamp: string;
  };
  readonly error?: {
    readonly code: string;
    readonly message: string;
    readonly statusCode: number;
  };
}
```

---

## 💻 実装

### 環境変数設定（`.env`）

```env
# GAS翻訳APIエンドポイント
VITE_TRANSLATION_API_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec

# オプション: APIキー（セキュリティ強化時）
VITE_TRANSLATION_API_KEY=your_secret_api_key
```

### サービス実装（`src/services/translationService.ts`）

```typescript
/**
 * 翻訳サービス
 * Google Apps Script（GAS）翻訳APIとの通信を担当
 */

import { TranslationDirection } from '../types';

/**
 * 翻訳APIのエンドポイントURL
 * 環境変数から読み込み
 */
const TRANSLATION_API_URL = import.meta.env.VITE_TRANSLATION_API_URL;

/**
 * オプション: APIキー（セキュリティ強化時）
 */
const API_KEY = import.meta.env.VITE_TRANSLATION_API_KEY;

/**
 * リクエストタイムアウト（ミリ秒）
 */
const REQUEST_TIMEOUT = 10000; // 10秒

/**
 * 翻訳リクエストの型定義
 */
interface TranslationRequest {
  readonly text: string;
  readonly direction: TranslationDirection;
  readonly apiKey?: string;
}

/**
 * 翻訳レスポンスの型定義
 */
interface TranslationResponse {
  readonly success: boolean;
  readonly data?: {
    readonly translatedText: string;
    readonly originalText: string;
    readonly direction: TranslationDirection;
    readonly timestamp: string;
  };
  readonly error?: {
    readonly code: string;
    readonly message: string;
    readonly statusCode: number;
  };
}

/**
 * 翻訳エラーのカスタムクラス
 */
export class TranslationError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode?: number
  ) {
    super(message);
    this.name = 'TranslationError';
  }
}

/**
 * タイムアウト付きfetchのラッパー
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
 * テキストを翻訳する関数
 *
 * @param text - 翻訳するテキスト
 * @param direction - 翻訳方向（'en-to-ja' または 'ja-to-en'）
 * @returns 翻訳されたテキスト
 * @throws {TranslationError} 翻訳に失敗した場合
 *
 * @example
 * ```typescript
 * const result = await translateText('Hello, world!', 'en-to-ja');
 * console.log(result); // "こんにちは、世界！"
 * ```
 */
export const translateText = async (
  text: string,
  direction: TranslationDirection
): Promise<string> => {
  // 環境変数チェック
  if (!TRANSLATION_API_URL) {
    throw new TranslationError(
      '翻訳APIのURLが設定されていません。環境変数 VITE_TRANSLATION_API_URL を確認してください。',
      'MISSING_API_URL',
      500
    );
  }

  // 空文字列チェック
  if (!text || text.trim() === '') {
    return '';
  }

  try {
    // リクエストボディの作成
    const requestBody: TranslationRequest = {
      text,
      direction,
      ...(API_KEY && { apiKey: API_KEY })
    };

    // GAS APIにPOSTリクエスト
    const response = await fetchWithTimeout(
      TRANSLATION_API_URL,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      },
      REQUEST_TIMEOUT
    );

    // HTTPステータスコードチェック
    if (!response.ok) {
      throw new TranslationError(
        `翻訳APIがエラーを返しました（HTTP ${response.status}）`,
        'API_HTTP_ERROR',
        response.status
      );
    }

    // JSONパース
    const data: TranslationResponse = await response.json();

    // レスポンス検証
    if (!data.success) {
      const errorMessage = data.error?.message || '翻訳に失敗しました';
      const errorCode = data.error?.code || 'UNKNOWN_ERROR';
      const statusCode = data.error?.statusCode || 500;

      throw new TranslationError(errorMessage, errorCode, statusCode);
    }

    // 翻訳結果の取得
    if (!data.data || !data.data.translatedText) {
      throw new TranslationError(
        '翻訳結果が不正な形式です',
        'INVALID_RESPONSE',
        500
      );
    }

    return data.data.translatedText;
  } catch (error) {
    // TranslationErrorはそのまま再スロー
    if (error instanceof TranslationError) {
      throw error;
    }

    // ネットワークエラー
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new TranslationError(
        'ネットワークエラーが発生しました。インターネット接続を確認してください。',
        'NETWORK_ERROR',
        0
      );
    }

    // その他の予期しないエラー
    throw new TranslationError(
      `予期しないエラーが発生しました: ${error instanceof Error ? error.message : String(error)}`,
      'UNEXPECTED_ERROR',
      500
    );
  }
};

/**
 * 翻訳APIのヘルスチェック
 *
 * @returns APIが正常に動作している場合はtrue
 */
export const checkTranslationApiHealth = async (): Promise<boolean> => {
  if (!TRANSLATION_API_URL) {
    return false;
  }

  try {
    const response = await fetchWithTimeout(
      TRANSLATION_API_URL,
      { method: 'GET' },
      5000
    );

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.status === 'running';
  } catch {
    return false;
  }
};
```

---

## 🛡️ エラーハンドリング

### エラータイプ

| エラーコード | 説明 | HTTPステータス |
|-------------|------|----------------|
| `MISSING_API_URL` | 環境変数未設定 | 500 |
| `TIMEOUT` | リクエストタイムアウト | 408 |
| `NETWORK_ERROR` | ネットワークエラー | 0 |
| `API_HTTP_ERROR` | APIのHTTPエラー | APIによる |
| `INVALID_RESPONSE` | 不正なレスポンス | 500 |
| `UNEXPECTED_ERROR` | 予期しないエラー | 500 |

### 使用例

```typescript
import { translateText, TranslationError } from './services/translationService';

try {
  const translated = await translateText('Hello', 'en-to-ja');
  console.log(translated);
} catch (error) {
  if (error instanceof TranslationError) {
    console.error(`翻訳エラー [${error.code}]: ${error.message}`);

    // エラータイプごとの処理
    switch (error.code) {
      case 'NETWORK_ERROR':
        // ネットワークエラー時の処理
        showNetworkErrorNotification();
        break;
      case 'TIMEOUT':
        // タイムアウト時の処理
        showTimeoutNotification();
        break;
      default:
        // その他のエラー
        showGenericErrorNotification(error.message);
    }
  }
}
```

---

## ⚡ パフォーマンス最適化

### 推奨される拡張

1. **翻訳結果のキャッシング**

```typescript
const translationCache = new Map<string, string>();

export const translateTextWithCache = async (
  text: string,
  direction: TranslationDirection
): Promise<string> => {
  const cacheKey = `${direction}:${text}`;

  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }

  const result = await translateText(text, direction);
  translationCache.set(cacheKey, result);

  return result;
};
```

2. **リトライロジック**

```typescript
const translateTextWithRetry = async (
  text: string,
  direction: TranslationDirection,
  maxRetries = 3
): Promise<string> => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await translateText(text, direction);
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;

      // 指数バックオフ
      await new Promise(resolve =>
        setTimeout(resolve, Math.pow(2, attempt) * 1000)
      );
    }
  }

  throw new Error('Unreachable');
};
```

---

## 📚 関連ドキュメント

- [GASデプロイ設定](../08-deployment/gas-deployment.md) - API URLの取得方法
- [useTranslationフック](../05-hooks/useTranslation.md) - サービスの使用例
- [型定義設計](../02-types-design.md) - TranslationDirection型の定義
- [環境変数管理](../08-deployment/build-config.md) - .env設定

---

## 🔄 次のステップ

1. `.env`ファイルに`VITE_TRANSLATION_API_URL`を設定
2. GAS翻訳APIをデプロイ（[GASデプロイ](../08-deployment/gas-deployment.md)参照）
3. `useTranslation`フックで翻訳サービスを統合
