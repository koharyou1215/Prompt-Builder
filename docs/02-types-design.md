# TypeScript型定義設計

## ドキュメント情報

- **作成日**: 2025-10-19
- **カテゴリ**: アーキテクチャ / 型設計
- **対象ファイル**: `src/types.ts`
- **関連ドキュメント**:
  - [プロジェクト概要](./01-project-overview.md)
  - [状態管理設計](./03-state-management.md)
  - [コンポーネント設計](./04-components-design.md)

---

## 概要

このドキュメントでは、インタラクティブAIプロンプト・ビルダーで使用される全てのTypeScript型定義について説明します。型安全性を確保し、開発体験を向上させるための設計パターンとベストプラクティスを含みます。

### 設計原則

1. **Immutability（不変性）**: `readonly`を使用して予期しない変更を防止
2. **Type Safety（型安全性）**: `any`型を使用せず、明示的な型定義を徹底
3. **Documentation（文書化）**: JSDocコメントで型の意図を明確化
4. **Validation（検証）**: 実行時の型検証とコンパイル時の型チェックの両立

---

## 1. ドメインモデル型定義

### 1.1 Keyword（キーワード）

キーワードは日本語表示と英語プロンプト文字列を持つ基本的なデータ構造です。

```typescript
/**
 * キーワードの型定義
 * 日本語表示と英語のプロンプト文字列を持つ
 */
export interface Keyword {
  /** 日本語表示名 */
  readonly ja: string;
  /** 英語プロンプト文字列 */
  readonly en: string;
  /** オプション: キーワードの説明 */
  readonly description?: string;
}
```

**使用例:**
```typescript
const keyword: Keyword = {
  ja: "美しい風景",
  en: "beautiful landscape",
  description: "自然の美しさを表現するキーワード"
};
```

**設計ポイント:**
- `readonly`修飾子で不変性を保証
- 多言語対応を前提とした構造
- オプショナルな`description`でメタデータ拡張が可能

---

### 1.2 KeywordCategory（キーワードカテゴリ）

キーワードをカテゴリごとに整理するための型定義です。

```typescript
/**
 * キーワードカテゴリの型定義
 */
export interface KeywordCategory {
  /** カテゴリID（一意な識別子） */
  readonly id: string;
  /** カテゴリの日本語名 */
  readonly name: string;
  /** カテゴリに属するキーワードの配列 */
  readonly keywords: readonly Keyword[];
  /** オプション: カテゴリの表示順序 */
  readonly order?: number;
}
```

**使用例:**
```typescript
const category: KeywordCategory = {
  id: "nature",
  name: "自然",
  keywords: [
    { ja: "山", en: "mountain" },
    { ja: "海", en: "ocean" }
  ],
  order: 1
};
```

**設計ポイント:**
- `id`フィールドで一意性を保証
- ネストされた`keywords`配列も`readonly`で保護
- `order`フィールドでUI表示順序を制御可能

---

## 2. アプリケーション状態型定義

### 2.1 PromptState（プロンプト状態）

現在編集中のプロンプトを表す状態管理の中核となる型です。

```typescript
/**
 * プロンプト状態の型定義
 * 現在編集中のプロンプトを表す
 */
export interface PromptState {
  /** ポジティブプロンプト（英語） */
  positivePrompt: string;
  /** ネガティブプロンプト（英語） */
  negativePrompt: string;
}
```

**使用例:**
```typescript
const [promptState, setPromptState] = useState<PromptState>({
  positivePrompt: "beautiful landscape, high quality",
  negativePrompt: "blurry, low quality"
});
```

**設計ポイント:**
- 可変フィールド（`readonly`なし）で状態更新を許可
- シンプルな構造でReact状態管理と統合しやすい
- ポジティブ/ネガティブの二軸で構成

---

### 2.2 HistoryEntry（履歴エントリ）

保存されたプロンプトの履歴を表す型定義です。

```typescript
/**
 * 履歴エントリの型定義
 */
export interface HistoryEntry {
  /** 一意なID (UUIDまたはタイムスタンプベース) */
  readonly id: string;
  /** ポジティブプロンプト（英語） */
  readonly positivePrompt: string;
  /** ネガティブプロンプト（英語） */
  readonly negativePrompt: string;
  /** 保存日時（ISO 8601形式） */
  readonly savedAt: string;
  /** オプション: ユーザー指定の名前 */
  readonly name?: string;
  /** オプション: メモ */
  readonly memo?: string;
}
```

**使用例:**
```typescript
const historyEntry: HistoryEntry = {
  id: crypto.randomUUID(),
  positivePrompt: "anime style, detailed",
  negativePrompt: "realistic, photorealistic",
  savedAt: new Date().toISOString(),
  name: "アニメ風プロンプト",
  memo: "キャラクター生成用"
};
```

**設計ポイント:**
- `id`にUUIDまたはタイムスタンプを使用
- `savedAt`はISO 8601形式で国際化対応
- `name`と`memo`でユーザーによるカスタマイズが可能

---

## 3. サービス層型定義

### 3.1 TranslationResult（翻訳結果）

翻訳サービスのレスポンス型定義です。

```typescript
/**
 * 翻訳結果の型定義
 */
export interface TranslationResult {
  /** 翻訳された日本語テキスト */
  readonly translatedText: string;
  /** 翻訳元の言語 */
  readonly sourceLanguage: 'en' | 'ja';
  /** 翻訳先の言語 */
  readonly targetLanguage: 'en' | 'ja';
}
```

**使用例:**
```typescript
const result: TranslationResult = {
  translatedText: "美しい風景",
  sourceLanguage: 'en',
  targetLanguage: 'ja'
};
```

**設計ポイント:**
- リテラル型で言語コードを制限
- 翻訳方向を明示的に記録

---

### 3.2 TranslationDirection（翻訳方向）

翻訳の方向性を表す型定義です。

```typescript
/**
 * 翻訳方向の型
 */
export type TranslationDirection = 'en-to-ja' | 'ja-to-en';
```

**使用例:**
```typescript
const direction: TranslationDirection = 'en-to-ja';

function translate(text: string, direction: TranslationDirection): Promise<string> {
  // 実装
}
```

---

### 3.3 エラーハンドリング型

アプリケーション全体で統一されたエラー処理を実現する型定義です。

```typescript
/**
 * エラー型の定義
 */
export interface AppError {
  readonly type: 'translation' | 'storage' | 'validation' | 'unknown';
  readonly message: string;
  readonly originalError?: Error;
}

/**
 * 翻訳サービスのレスポンス型
 */
export interface TranslationServiceResponse {
  readonly success: boolean;
  readonly result?: TranslationResult;
  readonly error?: AppError;
}

/**
 * ストレージサービスのレスポンス型
 */
export interface StorageServiceResponse<T> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: AppError;
}
```

**使用例:**
```typescript
async function savePrompt(state: PromptState): Promise<StorageServiceResponse<void>> {
  try {
    await chrome.storage.local.set({ autoSave: state });
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: {
        type: 'storage',
        message: '保存に失敗しました',
        originalError: error as Error
      }
    };
  }
}
```

**設計ポイント:**
- Result型パターンで例外処理を型安全に
- `success`フラグで成功/失敗を明示
- ジェネリクス`<T>`で柔軟なデータ型に対応

---

## 4. ストレージ型定義

### 4.1 StorageKeys（ストレージキー）

Chrome Storage APIで使用するキー名を型安全に管理します。

```typescript
/**
 * ストレージキーの型定義
 * Chrome Storage APIで使用するキー名を型安全に管理
 */
export const StorageKeys = {
  /** 自動保存されたプロンプト状態 */
  AUTO_SAVE: 'autoSave',
  /** 履歴エントリの配列 */
  HISTORY: 'history',
  /** ユーザー設定 */
  SETTINGS: 'settings'
} as const;

export type StorageKey = typeof StorageKeys[keyof typeof StorageKeys];
```

**使用例:**
```typescript
// 型安全なストレージアクセス
const data = await chrome.storage.local.get(StorageKeys.AUTO_SAVE);

// 文字列リテラルでタイポを防止
const key: StorageKey = StorageKeys.HISTORY; // OK
const invalid: StorageKey = 'histoy'; // コンパイルエラー
```

---

### 4.2 StorageData（ストレージデータマップ）

ストレージキーと対応するデータ型を紐づける型定義です。

```typescript
/**
 * ストレージデータの型マップ
 */
export interface StorageData {
  [StorageKeys.AUTO_SAVE]: PromptState;
  [StorageKeys.HISTORY]: readonly HistoryEntry[];
  [StorageKeys.SETTINGS]: UserSettings;
}
```

**使用例:**
```typescript
// 型推論が効く安全なストレージ操作
function getData<K extends StorageKey>(key: K): Promise<StorageData[K]> {
  return chrome.storage.local.get(key).then(result => result[key]);
}

// 使用時に型が自動推論される
const settings: UserSettings = await getData(StorageKeys.SETTINGS);
const history: readonly HistoryEntry[] = await getData(StorageKeys.HISTORY);
```

---

### 4.3 UserSettings（ユーザー設定）

アプリケーション設定を管理する型定義です。

```typescript
/**
 * ユーザー設定の型定義
 */
export interface UserSettings {
  /** 自動翻訳を有効にするか */
  readonly autoTranslate: boolean;
  /** 翻訳のデバウンス時間（ミリ秒） */
  readonly translationDebounceMs: number;
  /** 履歴の最大保存件数 */
  readonly maxHistoryEntries: number;
  /** ダークモード */
  readonly darkMode: boolean;
}

/**
 * デフォルトのユーザー設定
 */
export const defaultUserSettings: UserSettings = {
  autoTranslate: true,
  translationDebounceMs: 500,
  maxHistoryEntries: 50,
  darkMode: false
} as const;
```

**使用例:**
```typescript
// デフォルト設定とマージ
const userSettings: UserSettings = {
  ...defaultUserSettings,
  darkMode: true
};
```

---

## 5. アクション型定義

### 5.1 KeywordAddAction（キーワード追加アクション）

キーワード追加操作を表す型定義です。

```typescript
/**
 * キーワード追加先の型
 */
export type PromptTarget = 'positive' | 'negative';

/**
 * キーワード追加アクションの型
 */
export interface KeywordAddAction {
  readonly keyword: Keyword;
  readonly target: PromptTarget;
}
```

**使用例:**
```typescript
function addKeyword(action: KeywordAddAction, state: PromptState): PromptState {
  const { keyword, target } = action;
  const promptKey = target === 'positive' ? 'positivePrompt' : 'negativePrompt';

  return {
    ...state,
    [promptKey]: state[promptKey]
      ? `${state[promptKey]}, ${keyword.en}`
      : keyword.en
  };
}
```

---

## 6. 型安全性のベストプラクティス

### 6.1 readonly修飾子の使用

```typescript
// ✅ Good: 不変性を保証
interface Config {
  readonly apiKey: string;
  readonly endpoints: readonly string[];
}

// ❌ Bad: 予期しない変更が可能
interface Config {
  apiKey: string;
  endpoints: string[];
}
```

### 6.2 リテラル型の活用

```typescript
// ✅ Good: 許可される値を制限
type Status = 'idle' | 'loading' | 'success' | 'error';

// ❌ Bad: 任意の文字列を許可
type Status = string;
```

### 6.3 ジェネリクスによる型再利用

```typescript
// ✅ Good: 型安全な汎用レスポンス型
interface ApiResponse<T> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: AppError;
}

// 使用例
type UserResponse = ApiResponse<User>;
type ListResponse = ApiResponse<readonly Item[]>;
```

### 6.4 型ガードの実装

```typescript
// 型ガード関数
function isHistoryEntry(value: unknown): value is HistoryEntry {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'positivePrompt' in value &&
    'savedAt' in value
  );
}

// 使用例
const data: unknown = await loadFromStorage();
if (isHistoryEntry(data)) {
  console.log(data.positivePrompt); // 型安全
}
```

### 6.5 Discriminated Unions

```typescript
// ✅ Good: 判別可能なユニオン型
type Result<T> =
  | { success: true; data: T }
  | { success: false; error: AppError };

function handleResult<T>(result: Result<T>): T {
  if (result.success) {
    return result.data; // TypeScriptが型を推論
  } else {
    throw result.error;
  }
}
```

---

## 7. 型定義の拡張ガイドライン

### 新しい型を追加する場合

1. **既存の型パターンに従う**: `readonly`修飾子、JSDocコメント
2. **ネーミング規則**: PascalCaseでインターフェース名、明確な意図
3. **文書化**: JSDocで用途と制約を記述
4. **デフォルト値**: 必要に応じてデフォルト設定を提供

### 型の変更時の注意点

1. **破壊的変更の影響範囲を確認**: TypeScriptコンパイラエラーで検出
2. **移行パスの提供**: 古い型から新しい型への変換関数を用意
3. **バージョニング**: 大きな変更時は型バージョンを記録

---

## 8. 関連リソース

### 内部ドキュメント
- [状態管理設計](./03-state-management.md) - Context APIでの型使用
- [サービス層設計](./05-services-design.md) - APIレスポンス型の実装
- [コンポーネント設計](./04-components-design.md) - Props型定義

### 外部参考資料
- [TypeScript Handbook - Advanced Types](https://www.typescriptlang.org/docs/handbook/2/types-from-types.html)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Chrome Extension TypeScript Guide](https://developer.chrome.com/docs/extensions/mv3/typescript/)

---

## 更新履歴

| 日付 | 変更内容 | 担当 |
|------|---------|------|
| 2025-10-19 | 初版作成 | システム |
