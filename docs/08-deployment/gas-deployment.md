# Google Apps Script 翻訳API デプロイメントガイド

## ドキュメント情報

| 項目 | 内容 |
|------|------|
| **作成日** | 2025-10-19 |
| **対象バージョン** | 1.0.0 |
| **対象環境** | Google Apps Script |
| **セキュリティレベル** | 要注意 - 公開API |
| **関連ドキュメント** | [アーキテクチャ概要](../01-architecture.md), [サービス層設計](../07-services/README.md) |

---

## 目次

1. [概要](#概要)
2. [完全なコード実装](#完全なコード実装)
3. [デプロイ手順](#デプロイ手順)
4. [動作確認](#動作確認)
5. [セキュリティ強化](#セキュリティ強化)
6. [トラブルシューティング](#トラブルシューティング)
7. [React統合](#react統合)
8. [更新とバージョン管理](#更新とバージョン管理)

---

## 概要

### GAS翻訳APIとは

インタラクティブAIプロンプト・ビルダーで使用する翻訳機能を提供するRESTful APIです。Google Apps Script (GAS) で実装され、Google翻訳APIを活用して英語⇔日本語の双方向翻訳を行います。

### 主な機能

- **双方向翻訳**: 英語→日本語、日本語→英語の両方向に対応
- **RESTful API**: POST/GETリクエストによる標準的なHTTP API
- **エラーハンドリング**: 詳細なエラーコードとメッセージ
- **CORS対応**: ブラウザからの直接アクセスが可能
- **ヘルスチェック**: APIの稼働状態確認機能

### 技術スタック

- **実行環境**: Google Apps Script (V8 Runtime)
- **翻訳エンジン**: Google LanguageApp API
- **API形式**: JSON over HTTP/HTTPS
- **認証**: なし（オプションで追加可能）

---

## 🚨 セキュリティ警告

### 重要な注意事項

このGAS翻訳APIは**認証なし**でデプロイすると、URLを知っている人なら誰でもアクセス可能になります。

#### リスク

- **無制限の使用**: 第三者による大量リクエストの可能性
- **クォータ消費**: Googleアカウントの翻訳APIクォータが消費される
- **コスト**: クォータ超過時に課金が発生する可能性
- **悪用**: ボットやスクレイパーによる悪用

#### 推奨対策

1. **APIキー認証**を実装する（[セキュリティ強化](#セキュリティ強化)参照）
2. **レート制限**を設定する
3. **環境変数**でAPIキーを管理する
4. **モニタリング**を有効にして異常なアクセスを検知する
5. 本番環境では専用の翻訳APIサービスの使用を検討する

---

## 完全なコード実装

### コード.gs

以下のコードをGoogle Apps Scriptプロジェクトに貼り付けてください。

```javascript
/**
 * プロンプトビルダー用 翻訳API
 * Google Apps Script (GAS) で実装
 *
 * 機能:
 * - 英語⇔日本語の双方向翻訳
 * - RESTful API（POST）
 * - エラーハンドリング
 * - CORS対応
 */

/**
 * 翻訳方向の定義
 */
const TRANSLATION_DIRECTIONS = {
  EN_TO_JA: 'en-to-ja',
  JA_TO_EN: 'ja-to-en'
};

/**
 * 言語コードのマッピング
 */
const LANGUAGE_CODES = {
  ENGLISH: 'en',
  JAPANESE: 'ja'
};

/**
 * エラーコードの定義
 */
const ERROR_CODES = {
  INVALID_REQUEST: 'INVALID_REQUEST',
  MISSING_PARAMETERS: 'MISSING_PARAMETERS',
  INVALID_DIRECTION: 'INVALID_DIRECTION',
  TRANSLATION_FAILED: 'TRANSLATION_FAILED',
  INTERNAL_ERROR: 'INTERNAL_ERROR'
};

/**
 * POSTリクエストを処理するメイン関数
 *
 * @param {Object} e - イベントオブジェクト
 * @param {string} e.postData.contents - リクエストボディ（JSON文字列）
 * @param {string} e.postData.type - コンテンツタイプ
 * @returns {ContentService.TextOutput} JSON形式のレスポンス
 */
function doPost(e) {
  try {
    // リクエストの検証
    if (!e || !e.postData || !e.postData.contents) {
      return createErrorResponse(
        ERROR_CODES.INVALID_REQUEST,
        'リクエストボディが空です',
        400
      );
    }

    // JSONのパース
    let requestData;
    try {
      requestData = JSON.parse(e.postData.contents);
    } catch (parseError) {
      return createErrorResponse(
        ERROR_CODES.INVALID_REQUEST,
        'JSONのパースに失敗しました: ' + parseError.message,
        400
      );
    }

    // パラメータの検証
    const { text, direction } = requestData;

    if (!text) {
      return createErrorResponse(
        ERROR_CODES.MISSING_PARAMETERS,
        'textパラメータが必要です',
        400
      );
    }

    if (!direction) {
      return createErrorResponse(
        ERROR_CODES.MISSING_PARAMETERS,
        'directionパラメータが必要です',
        400
      );
    }

    // 翻訳方向の検証
    if (direction !== TRANSLATION_DIRECTIONS.EN_TO_JA &&
        direction !== TRANSLATION_DIRECTIONS.JA_TO_EN) {
      return createErrorResponse(
        ERROR_CODES.INVALID_DIRECTION,
        `無効な翻訳方向です。${TRANSLATION_DIRECTIONS.EN_TO_JA} または ${TRANSLATION_DIRECTIONS.JA_TO_EN} を指定してください`,
        400
      );
    }

    // 翻訳の実行
    const translatedText = performTranslation(text, direction);

    // 成功レスポンスの返却
    return createSuccessResponse({
      translatedText: translatedText,
      originalText: text,
      direction: direction,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    // 予期しないエラーのハンドリング
    Logger.log('Unexpected error: ' + error.toString());
    return createErrorResponse(
      ERROR_CODES.INTERNAL_ERROR,
      'サーバー内部エラーが発生しました: ' + error.message,
      500
    );
  }
}

/**
 * GETリクエストを処理する関数（ヘルスチェック用）
 *
 * @returns {ContentService.TextOutput} JSON形式のレスポンス
 */
function doGet() {
  return createSuccessResponse({
    service: 'Prompt Builder Translation API',
    version: '1.0.0',
    status: 'running',
    supportedDirections: [
      TRANSLATION_DIRECTIONS.EN_TO_JA,
      TRANSLATION_DIRECTIONS.JA_TO_EN
    ],
    timestamp: new Date().toISOString()
  });
}

/**
 * 翻訳を実行する関数
 *
 * @param {string} text - 翻訳するテキスト
 * @param {string} direction - 翻訳方向
 * @returns {string} 翻訳されたテキスト
 * @throws {Error} 翻訳に失敗した場合
 */
function performTranslation(text, direction) {
  try {
    // 空文字列チェック
    if (!text || text.trim() === '') {
      return '';
    }

    // 翻訳方向に応じて言語コードを設定
    let sourceLang, targetLang;

    if (direction === TRANSLATION_DIRECTIONS.EN_TO_JA) {
      sourceLang = LANGUAGE_CODES.ENGLISH;
      targetLang = LANGUAGE_CODES.JAPANESE;
    } else if (direction === TRANSLATION_DIRECTIONS.JA_TO_EN) {
      sourceLang = LANGUAGE_CODES.JAPANESE;
      targetLang = LANGUAGE_CODES.ENGLISH;
    } else {
      throw new Error('無効な翻訳方向: ' + direction);
    }

    // Google翻訳APIを使用して翻訳
    const translatedText = LanguageApp.translate(text, sourceLang, targetLang);

    // 翻訳結果のログ記録（デバッグ用）
    Logger.log(`Translation: "${text}" (${sourceLang}) -> "${translatedText}" (${targetLang})`);

    return translatedText;

  } catch (error) {
    Logger.log('Translation error: ' + error.toString());
    throw new Error('翻訳処理に失敗しました: ' + error.message);
  }
}

/**
 * 成功レスポンスを作成する関数
 *
 * @param {Object} data - レスポンスデータ
 * @returns {ContentService.TextOutput} JSON形式のレスポンス
 */
function createSuccessResponse(data) {
  const response = {
    success: true,
    data: data
  };

  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

/**
 * エラーレスポンスを作成する関数
 *
 * @param {string} code - エラーコード
 * @param {string} message - エラーメッセージ
 * @param {number} statusCode - HTTPステータスコード
 * @returns {ContentService.TextOutput} JSON形式のレスポンス
 */
function createErrorResponse(code, message, statusCode = 500) {
  const response = {
    success: false,
    error: {
      code: code,
      message: message,
      statusCode: statusCode,
      timestamp: new Date().toISOString()
    }
  };

  Logger.log(`Error response: ${code} - ${message}`);

  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

/**
 * OPTIONSリクエストを処理する関数（CORS プリフライト対応）
 *
 * @returns {ContentService.TextOutput} 空のレスポンス
 */
function doOptions() {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type')
    .setHeader('Access-Control-Max-Age', '86400');
}

/**
 * テスト用関数（GASエディタから直接実行可能）
 */
function testTranslation() {
  // 英語→日本語のテスト
  const testEnToJa = {
    postData: {
      contents: JSON.stringify({
        text: 'beautiful landscape',
        direction: 'en-to-ja'
      })
    }
  };

  const resultEnToJa = doPost(testEnToJa);
  Logger.log('EN→JA Result: ' + resultEnToJa.getContent());

  // 日本語→英語のテスト
  const testJaToEn = {
    postData: {
      contents: JSON.stringify({
        text: '美しい風景',
        direction: 'ja-to-en'
      })
    }
  };

  const resultJaToEn = doPost(testJaToEn);
  Logger.log('JA→EN Result: ' + resultJaToEn.getContent());
}

/**
 * バッチ翻訳用関数（複数テキストの一括翻訳）
 *
 * @param {Array<string>} texts - 翻訳するテキストの配列
 * @param {string} direction - 翻訳方向
 * @returns {Array<string>} 翻訳されたテキストの配列
 */
function batchTranslate(texts, direction) {
  if (!Array.isArray(texts)) {
    throw new Error('textsは配列である必要があります');
  }

  return texts.map(text => {
    try {
      return performTranslation(text, direction);
    } catch (error) {
      Logger.log(`Batch translation error for "${text}": ${error.message}`);
      return text; // エラー時は元のテキストを返す
    }
  });
}
```

---

## デプロイ手順

### ステップ1: GASプロジェクトの作成

1. **Google Apps Script を開く**
   - https://script.google.com/ にアクセス
   - Googleアカウントでログイン
   - 「新しいプロジェクト」をクリック

2. **コードを貼り付け**
   - 上記の `コード.gs` の内容を全てコピー
   - デフォルトの `function myFunction() {}` を削除
   - コピーしたコードを貼り付け

3. **プロジェクト名を設定**
   - 左上の「無題のプロジェクト」をクリック
   - 「プロンプトビルダー翻訳API」などの名前を入力
   - 「名前を変更」をクリック

### ステップ2: テスト実行

1. **関数を選択**
   - 上部のドロップダウンメニューから `testTranslation` を選択

2. **実行**
   - 「実行」ボタン（▶️）をクリック
   - 初回実行時は権限の承認が必要です：
     - 「権限を確認」をクリック
     - Googleアカウントを選択
     - 「詳細」→「プロンプトビルダー翻訳API（安全ではないページ）に移動」をクリック
     - 「許可」をクリック

3. **ログを確認**
   - 下部の「実行ログ」をクリック
   - 以下のような翻訳結果が表示されることを確認：
     ```
     EN→JA Result: {"success":true,"data":{"translatedText":"美しい風景",...}}
     JA→EN Result: {"success":true,"data":{"translatedText":"beautiful landscape",...}}
     ```

### ステップ3: Webアプリとしてデプロイ

1. **デプロイを開始**
   - 右上の「デプロイ」ボタンをクリック
   - 「新しいデプロイ」を選択

2. **デプロイタイプを選択**
   - 「種類の選択」（⚙️ギアアイコン）をクリック
   - 「ウェブアプリ」を選択

3. **デプロイ設定**
   - **説明**: 「初回デプロイ」など任意の説明を入力
   - **次のユーザーとして実行**: 「自分」を選択
   - **アクセスできるユーザー**: 「全員」を選択
     - ⚠️ これにより、URLを知っている人なら誰でもアクセス可能になります
     - セキュリティが心配な場合は、[セキュリティ強化](#セキュリティ強化)を参照

4. **デプロイ実行**
   - 「デプロイ」ボタンをクリック
   - 再度権限の承認が必要な場合があります（ステップ2と同様）

5. **URLを取得**
   - デプロイが完了すると、「ウェブアプリ」のURLが表示されます
   - 例: `https://script.google.com/macros/s/AKfycbx.../exec`
   - このURLをコピーして保存してください
   - ⚠️ このURLは外部に公開しないでください

---

## 動作確認

### 方法1: curlでのテスト

ターミナル（コマンドプロンプト）で以下を実行：

```bash
# 英語→日本語
curl -X POST "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec" \
  -H "Content-Type: application/json" \
  -d '{"text":"beautiful landscape","direction":"en-to-ja"}'

# 日本語→英語
curl -X POST "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec" \
  -H "Content-Type: application/json" \
  -d '{"text":"美しい風景","direction":"ja-to-en"}'

# ヘルスチェック
curl "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec"
```

**期待されるレスポンス:**

```json
{
  "success": true,
  "data": {
    "translatedText": "美しい風景",
    "originalText": "beautiful landscape",
    "direction": "en-to-ja",
    "timestamp": "2025-10-19T12:34:56.789Z"
  }
}
```

### 方法2: ブラウザコンソールでのテスト

ブラウザの開発者ツール（F12）のコンソールで以下を実行：

```javascript
fetch('https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: 'beautiful landscape',
    direction: 'en-to-ja'
  })
})
.then(res => res.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
```

### 方法3: Postmanでのテスト

1. Postmanを開く
2. 新しいリクエストを作成
3. メソッド: POST
4. URL: デプロイしたGAS APIのURL
5. Headers: `Content-Type: application/json`
6. Body (raw, JSON):
   ```json
   {
     "text": "beautiful landscape",
     "direction": "en-to-ja"
   }
   ```
7. 「Send」をクリック

---

## セキュリティ強化

### 1. APIキー認証の追加

**コード.gs に追加:**

```javascript
// スクリプトプロパティにAPIキーを保存（推奨）
// GASエディタで: プロジェクトの設定 → スクリプトプロパティ → プロパティを追加
// キー: API_KEY, 値: your-secret-api-key-here

function doPost(e) {
  try {
    // APIキーの検証
    const requestData = JSON.parse(e.postData.contents);
    const scriptProperties = PropertiesService.getScriptProperties();
    const validApiKey = scriptProperties.getProperty('API_KEY');

    if (!requestData.apiKey || requestData.apiKey !== validApiKey) {
      return createErrorResponse(
        'UNAUTHORIZED',
        '無効なAPIキーです',
        401
      );
    }

    // 以降は既存のコード...
    const { text, direction } = requestData;

    // ... 既存の処理 ...

  } catch (error) {
    // エラーハンドリング
  }
}
```

**React側の修正:**

```typescript
const response = await fetch(GAS_API_ENDPOINT, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    text,
    direction,
    apiKey: process.env.NEXT_PUBLIC_GAS_API_KEY, // 環境変数から取得
  }),
});
```

### 2. レート制限の追加

**コード.gs に追加:**

```javascript
const RATE_LIMIT = 100; // 1日あたりの最大リクエスト数
const RATE_LIMIT_WINDOW = 86400; // 24時間（秒）

function checkRateLimit(userId) {
  const cache = CacheService.getScriptCache();
  const key = `rate_limit_${userId}`;
  const count = parseInt(cache.get(key) || '0');

  if (count >= RATE_LIMIT) {
    throw new Error(`レート制限を超えました。1日あたり${RATE_LIMIT}リクエストまでです。`);
  }

  cache.put(key, (count + 1).toString(), RATE_LIMIT_WINDOW);
  return true;
}

function doPost(e) {
  try {
    // ユーザーIDの取得（IPアドレスやAPIキーなど）
    const userId = e.parameter.userId || 'anonymous';

    // レート制限チェック
    try {
      checkRateLimit(userId);
    } catch (rateLimitError) {
      return createErrorResponse(
        'RATE_LIMIT_EXCEEDED',
        rateLimitError.message,
        429
      );
    }

    // 以降は既存のコード...
  } catch (error) {
    // エラーハンドリング
  }
}
```

### 3. リファラーチェックの追加

特定のドメインからのアクセスのみを許可：

```javascript
const ALLOWED_ORIGINS = [
  'https://your-app-domain.com',
  'http://localhost:3000', // 開発環境
];

function doPost(e) {
  try {
    // リファラーチェック
    const referer = e.parameter.referer || '';
    const isAllowed = ALLOWED_ORIGINS.some(origin => referer.startsWith(origin));

    if (!isAllowed) {
      return createErrorResponse(
        'FORBIDDEN',
        'このドメインからのアクセスは許可されていません',
        403
      );
    }

    // 以降は既存のコード...
  } catch (error) {
    // エラーハンドリング
  }
}
```

### 4. ロギングとモニタリング

```javascript
function logRequest(requestData, response, duration) {
  const sheet = SpreadsheetApp.openById('YOUR_SPREADSHEET_ID').getActiveSheet();
  sheet.appendRow([
    new Date(),
    requestData.text.substring(0, 50), // 最初の50文字のみ
    requestData.direction,
    response.success,
    duration,
    Session.getActiveUser().getEmail()
  ]);
}

function doPost(e) {
  const startTime = new Date();

  try {
    // ... 既存の処理 ...

    const duration = new Date() - startTime;
    logRequest(requestData, response, duration);

  } catch (error) {
    // エラーハンドリング
  }
}
```

---

## トラブルシューティング

### よくある問題と解決方法

| 問題 | 原因 | 解決方法 |
|------|------|----------|
| **403 Forbidden** | アクセス権限の設定ミス | デプロイ設定で「アクセスできるユーザー」を「全員」に設定 |
| **CORS エラー** | ヘッダー設定の不足 | `doOptions()` 関数が正しく実装されているか確認 |
| **翻訳結果が空** | テキストが空文字列 | リクエストボディの `text` パラメータを確認 |
| **タイムアウト** | 長すぎるテキスト | テキストを分割して複数回送信 |
| **JSONパースエラー** | リクエストボディの形式が不正 | `Content-Type: application/json` ヘッダーを確認 |
| **INVALID_DIRECTION エラー** | direction パラメータが不正 | `en-to-ja` または `ja-to-en` を使用 |

### デバッグ方法

#### 1. GASのログを確認

```javascript
// コード内にログを追加
Logger.log('Debug - Request data: ' + JSON.stringify(requestData));
Logger.log('Debug - Translation result: ' + translatedText);
```

GASエディタで確認:
- 「表示」→「ログ」（Ctrl+Enter）

#### 2. 実行ログを確認

- GASエディタの下部に実行ログが表示されます
- エラーメッセージ、スタックトレースを確認できます

#### 3. エラーレスポンスの詳細確認

```javascript
// React側でエラーの詳細をログ出力
try {
  const response = await fetch(GAS_API_ENDPOINT, { /* ... */ });
  const data = await response.json();

  if (!data.success) {
    console.error('API Error:', {
      code: data.error.code,
      message: data.error.message,
      statusCode: data.error.statusCode,
      timestamp: data.error.timestamp
    });
  }
} catch (error) {
  console.error('Network Error:', error);
}
```

#### 4. ヘルスチェックで稼働状態確認

```bash
curl "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec"
```

正常な場合の出力:
```json
{
  "success": true,
  "data": {
    "service": "Prompt Builder Translation API",
    "version": "1.0.0",
    "status": "running",
    "supportedDirections": ["en-to-ja", "ja-to-en"],
    "timestamp": "2025-10-19T12:34:56.789Z"
  }
}
```

---

## React統合

### ステップ1: 環境変数の設定

`.env.local` ファイルを作成：

```env
# GAS翻訳API
NEXT_PUBLIC_GAS_API_ENDPOINT=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec

# APIキー認証を有効にした場合
NEXT_PUBLIC_GAS_API_KEY=your-secret-api-key-here
```

### ステップ2: 翻訳API関数の実装

`src/utils/translationApi.ts`:

```typescript
/**
 * 翻訳方向の型定義
 */
export type TranslationDirection = 'en-to-ja' | 'ja-to-en';

/**
 * GAS翻訳APIのレスポンス型
 */
interface GASTranslationResponse {
  success: boolean;
  data?: {
    translatedText: string;
    originalText: string;
    direction: TranslationDirection;
    timestamp: string;
  };
  error?: {
    code: string;
    message: string;
    statusCode: number;
    timestamp: string;
  };
}

/**
 * GAS翻訳APIのエンドポイント
 */
const GAS_API_ENDPOINT = process.env.NEXT_PUBLIC_GAS_API_ENDPOINT;
const GAS_API_KEY = process.env.NEXT_PUBLIC_GAS_API_KEY;

/**
 * GAS翻訳APIを使用して翻訳を実行
 *
 * @param text - 翻訳するテキスト
 * @param direction - 翻訳方向
 * @returns 翻訳されたテキスト
 * @throws APIエラーまたはネットワークエラー
 */
export async function translateWithGAS(
  text: string,
  direction: TranslationDirection
): Promise<string> {
  if (!GAS_API_ENDPOINT) {
    throw new Error('GAS_API_ENDPOINT が設定されていません');
  }

  if (!text || text.trim() === '') {
    return '';
  }

  try {
    const response = await fetch(GAS_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        direction,
        ...(GAS_API_KEY && { apiKey: GAS_API_KEY }), // APIキーが設定されている場合のみ送信
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: GASTranslationResponse = await response.json();

    if (!data.success) {
      throw new Error(
        data.error?.message || '翻訳に失敗しました'
      );
    }

    return data.data?.translatedText || '';
  } catch (error) {
    console.error('Translation API error:', error);
    throw error;
  }
}

/**
 * バッチ翻訳（複数テキストの一括翻訳）
 *
 * @param texts - 翻訳するテキストの配列
 * @param direction - 翻訳方向
 * @returns 翻訳されたテキストの配列
 */
export async function batchTranslate(
  texts: string[],
  direction: TranslationDirection
): Promise<string[]> {
  return Promise.all(
    texts.map(text => translateWithGAS(text, direction))
  );
}
```

### ステップ3: コンポーネントでの使用

```typescript
import { useState } from 'react';
import { translateWithGAS } from '@/utils/translationApi';

export function TranslationExample() {
  const [text, setText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTranslate = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await translateWithGAS(text, 'en-to-ja');
      setTranslatedText(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '翻訳エラー');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="翻訳するテキストを入力"
      />
      <button onClick={handleTranslate} disabled={loading}>
        {loading ? '翻訳中...' : '翻訳'}
      </button>
      {error && <p className="error">{error}</p>}
      {translatedText && <p className="result">{translatedText}</p>}
    </div>
  );
}
```

---

## 更新とバージョン管理

### 新しいバージョンのデプロイ

1. **コードを修正**
   - GASエディタでコードを編集
   - `testTranslation()` 関数で動作確認

2. **デプロイを管理**
   - 「デプロイ」→「デプロイを管理」をクリック

3. **新バージョンを作成**
   - 既存のデプロイの「編集」（✏️アイコン）をクリック
   - 「バージョン」ドロップダウンから「新バージョン」を選択
   - 説明を入力（例: 「v1.1 - レート制限追加」）

4. **デプロイ**
   - 「デプロイ」ボタンをクリック
   - ⚠️ URLは変わりません（既存のURLがそのまま使えます）

### バージョン履歴の確認

1. GASエディタで「ファイル」→「バージョン履歴を表示」
2. 過去のバージョンを確認・復元可能

### ロールバック方法

1. 「デプロイ」→「デプロイを管理」
2. 該当デプロイの「編集」をクリック
3. 「バージョン」ドロップダウンから以前のバージョンを選択
4. 「デプロイ」をクリック

---

## パフォーマンス最適化

### キャッシュの活用

```javascript
function performTranslation(text, direction) {
  const cache = CacheService.getScriptCache();
  const cacheKey = `translation_${direction}_${text}`;

  // キャッシュから取得を試みる
  const cachedResult = cache.get(cacheKey);
  if (cachedResult) {
    Logger.log('Cache hit: ' + cacheKey);
    return cachedResult;
  }

  // キャッシュにない場合は翻訳実行
  const translatedText = LanguageApp.translate(text, sourceLang, targetLang);

  // キャッシュに保存（6時間）
  cache.put(cacheKey, translatedText, 21600);

  return translatedText;
}
```

### バッチ処理の最適化

大量のテキストを翻訳する場合は、GAS側でバッチ処理を実装：

```javascript
function doPost(e) {
  const requestData = JSON.parse(e.postData.contents);

  // バッチリクエストの処理
  if (requestData.batch && Array.isArray(requestData.texts)) {
    const results = batchTranslate(requestData.texts, requestData.direction);
    return createSuccessResponse({
      translatedTexts: results,
      count: results.length
    });
  }

  // 単一リクエストの処理（既存のコード）
  // ...
}
```

---

## 関連ドキュメント

- [アーキテクチャ概要](../01-architecture.md) - システム全体のアーキテクチャ
- [サービス層設計](../07-services/README.md) - API連携の設計パターン
- [型定義設計](../02-types-design.md) - TypeScript型定義
- [状態管理](../03-state-management.md) - Zustand状態管理

---

## まとめ

このドキュメントでは、GAS翻訳APIの完全な実装とデプロイ手順を説明しました。

### 重要なポイント

1. **セキュリティ**: APIキー認証とレート制限を必ず実装する
2. **エラーハンドリング**: 詳細なエラーメッセージで問題を特定しやすくする
3. **モニタリング**: ログ記録で異常なアクセスを検知する
4. **パフォーマンス**: キャッシュを活用してAPI呼び出しを削減する
5. **バージョン管理**: 変更履歴を残し、ロールバック可能にする

### 次のステップ

- [ ] GASプロジェクトの作成とデプロイ
- [ ] React統合とテスト
- [ ] APIキー認証の実装
- [ ] レート制限の設定
- [ ] モニタリングの有効化
- [ ] 本番環境用の専用翻訳APIへの移行検討

---

**最終更新日**: 2025-10-19
**バージョン**: 1.0.0
