# React Context状態管理設計

**ドキュメントバージョン**: 1.0
**最終更新**: 2025-10-19
**関連ドキュメント**: [型システム設計](./02-type-system.md) | [データ永続化](./04-data-persistence.md)

## 概要

このドキュメントでは、インタラクティブAIプロンプト・ビルダーにおける**React Context API**を使用した状態管理設計について説明します。アプリケーション全体でプロンプトの状態を共有し、自動保存機能を統合した実装を提供します。

### 主要な機能

- **グローバル状態管理**: React Contextによるアプリケーション全体の状態共有
- **自動保存機能**: プロンプト変更時の自動的なChrome Storage保存
- **型安全性**: TypeScriptによる完全な型定義とエラー検出
- **パフォーマンス最適化**: useMemo/useCallbackによる不要な再レンダリング防止
- **エラーハンドリング**: Provider外での使用を検出する安全機構

---

## PromptContext設計

### アーキテクチャ概要

```
PromptProvider
├─ State Management
│  ├─ promptState (PromptState)
│  └─ isLoading (boolean)
├─ Auto-Save Integration
│  ├─ 初期読み込み (useEffect)
│  └─ 変更検知と保存 (useEffect)
└─ API Functions
   ├─ updatePrompt()
   ├─ setPositivePrompt()
   ├─ setNegativePrompt()
   ├─ setPromptState()
   ├─ resetPrompt()
   └─ appendKeyword()
```

---

## 実装詳細

### 1. PromptContext.tsx

完全な型安全性を持つContext実装です。

```typescript
import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { PromptState, PromptTarget, StorageKeys } from '../types';
import { loadFromStorage, saveToStorage } from '../services/storageService';

/**
 * PromptContextの値の型定義
 */
interface PromptContextValue {
  /** 現在のプロンプト状態 */
  readonly promptState: PromptState;

  /** プロンプトを更新する汎用関数 */
  updatePrompt: (target: PromptTarget, value: string) => void;

  /** ポジティブプロンプトを更新 */
  setPositivePrompt: (value: string) => void;

  /** ネガティブプロンプトを更新 */
  setNegativePrompt: (value: string) => void;

  /** プロンプト全体を一括設定（履歴からの復元用） */
  setPromptState: (state: PromptState) => void;

  /** プロンプトをリセット */
  resetPrompt: () => void;

  /** キーワードを追加（既存の内容に追記） */
  appendKeyword: (target: PromptTarget, keyword: string) => void;

  /** ローディング状態 */
  readonly isLoading: boolean;
}

/**
 * デフォルトのプロンプト状態
 */
const defaultPromptState: PromptState = {
  positivePrompt: '',
  negativePrompt: ''
} as const;

/**
 * PromptContextの作成
 * 初期値はundefinedとし、Providerの外での使用を検出可能にする
 */
const PromptContext = createContext<PromptContextValue | undefined>(undefined);

/**
 * PromptContextのProvider Props
 */
interface PromptProviderProps {
  readonly children: React.ReactNode;
}

/**
 * PromptContextのProvider コンポーネント
 * アプリ全体のプロンプト状態を管理
 */
export const PromptProvider: React.FC<PromptProviderProps> = ({ children }) => {
  const [promptState, setPromptStateInternal] = useState<PromptState>(defaultPromptState);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  /**
   * 初期化：ストレージから自動保存されたプロンプトを読み込む
   */
  useEffect(() => {
    const initializePromptState = async (): Promise<void> => {
      setIsLoading(true);
      try {
        const response = await loadFromStorage<PromptState>(StorageKeys.AUTO_SAVE);

        if (response.success && response.data) {
          setPromptStateInternal(response.data);
        } else {
          // ストレージにデータがない場合はデフォルト値を使用
          setPromptStateInternal(defaultPromptState);
        }
      } catch (error) {
        console.error('Failed to load prompt state from storage:', error);
        setPromptStateInternal(defaultPromptState);
      } finally {
        setIsLoading(false);
      }
    };

    void initializePromptState();
  }, []);

  /**
   * プロンプト状態が変更されるたびに自動保存
   */
  useEffect(() => {
    // 初期ローディング中は保存しない
    if (isLoading) {
      return;
    }

    const autoSave = async (): Promise<void> => {
      try {
        await saveToStorage(StorageKeys.AUTO_SAVE, promptState);
      } catch (error) {
        console.error('Failed to auto-save prompt state:', error);
      }
    };

    void autoSave();
  }, [promptState, isLoading]);

  /**
   * 汎用的なプロンプト更新関数
   */
  const updatePrompt = useCallback((target: PromptTarget, value: string): void => {
    setPromptStateInternal((prevState) => ({
      ...prevState,
      [target === 'positive' ? 'positivePrompt' : 'negativePrompt']: value
    }));
  }, []);

  /**
   * ポジティブプロンプトを更新
   */
  const setPositivePrompt = useCallback((value: string): void => {
    updatePrompt('positive', value);
  }, [updatePrompt]);

  /**
   * ネガティブプロンプトを更新
   */
  const setNegativePrompt = useCallback((value: string): void => {
    updatePrompt('negative', value);
  }, [updatePrompt]);

  /**
   * プロンプト全体を一括設定
   * 履歴からの復元時などに使用
   */
  const setPromptState = useCallback((state: PromptState): void => {
    setPromptStateInternal(state);
  }, []);

  /**
   * プロンプトをリセット
   */
  const resetPrompt = useCallback((): void => {
    setPromptStateInternal(defaultPromptState);
  }, []);

  /**
   * キーワードを追加（カンマ区切りで追記）
   */
  const appendKeyword = useCallback((target: PromptTarget, keyword: string): void => {
    setPromptStateInternal((prevState) => {
      const targetKey = target === 'positive' ? 'positivePrompt' : 'negativePrompt';
      const currentValue = prevState[targetKey].trim();

      // 既存の内容がある場合はカンマ+スペースで連結
      const newValue = currentValue
        ? `${currentValue}, ${keyword}`
        : keyword;

      return {
        ...prevState,
        [targetKey]: newValue
      };
    });
  }, []);

  /**
   * Context値をメモ化してパフォーマンス最適化
   */
  const contextValue = useMemo<PromptContextValue>(
    () => ({
      promptState,
      updatePrompt,
      setPositivePrompt,
      setNegativePrompt,
      setPromptState,
      resetPrompt,
      appendKeyword,
      isLoading
    }),
    [
      promptState,
      updatePrompt,
      setPositivePrompt,
      setNegativePrompt,
      setPromptState,
      resetPrompt,
      appendKeyword,
      isLoading
    ]
  );

  return (
    <PromptContext.Provider value={contextValue}>
      {children}
    </PromptContext.Provider>
  );
};

/**
 * PromptContextを使用するためのカスタムフック
 * Provider外での使用時にエラーをスローして安全性を確保
 */
export const usePromptContext = (): PromptContextValue => {
  const context = useContext(PromptContext);

  if (context === undefined) {
    throw new Error('usePromptContext must be used within a PromptProvider');
  }

  return context;
};

/**
 * 個別のプロンプト値のみを取得するカスタムフック（最適化版）
 */
export const usePositivePrompt = (): string => {
  const { promptState } = usePromptContext();
  return promptState.positivePrompt;
};

export const useNegativePrompt = (): string => {
  const { promptState } = usePromptContext();
  return promptState.negativePrompt;
};
```

---

### 2. App.tsx統合

アプリケーションルートでProviderをセットアップします。

```typescript
import React from 'react';
import { PromptProvider } from './contexts/PromptContext';
import PromptEditor from './components/PromptEditor';
import KeywordSelector from './components/KeywordSelector';
import HistoryPanel from './components/HistoryPanel';
import './App.css';

/**
 * メインアプリケーションコンポーネント
 */
const App: React.FC = () => {
  return (
    <PromptProvider>
      <div className="app-container">
        <header className="app-header">
          <h1>インタラクティブAIプロンプト・ビルダー</h1>
        </header>

        <main className="app-main">
          <div className="prompt-section">
            <PromptEditor />
          </div>

          <div className="keyword-section">
            <KeywordSelector />
          </div>

          <div className="history-section">
            <HistoryPanel />
          </div>
        </main>
      </div>
    </PromptProvider>
  );
};

export default App;
```

---

## 自動保存機能

### 初期読み込み処理

アプリケーション起動時にChrome Storageから前回の状態を自動復元します。

```typescript
useEffect(() => {
  const initializePromptState = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await loadFromStorage<PromptState>(StorageKeys.AUTO_SAVE);

      if (response.success && response.data) {
        setPromptStateInternal(response.data);
      } else {
        setPromptStateInternal(defaultPromptState);
      }
    } catch (error) {
      console.error('Failed to load prompt state from storage:', error);
      setPromptStateInternal(defaultPromptState);
    } finally {
      setIsLoading(false);
    }
  };

  void initializePromptState();
}, []);
```

### 自動保存処理

プロンプトが変更されるたびに自動的にChrome Storageへ保存します。

```typescript
useEffect(() => {
  // 初期ローディング中は保存しない
  if (isLoading) {
    return;
  }

  const autoSave = async (): Promise<void> => {
    try {
      await saveToStorage(StorageKeys.AUTO_SAVE, promptState);
    } catch (error) {
      console.error('Failed to auto-save prompt state:', error);
    }
  };

  void autoSave();
}, [promptState, isLoading]);
```

**重要なポイント**:
- `isLoading`フラグにより、初期読み込み完了前の誤保存を防止
- エラーハンドリングにより、保存失敗時もアプリケーション動作継続
- 非同期処理を`void`でラップして型安全性を維持

---

## カスタムフックの使用方法

### 基本的な使用例

```typescript
import React from 'react';
import { usePromptContext } from '../contexts/PromptContext';

const ExampleComponent: React.FC = () => {
  const {
    promptState,
    setPositivePrompt,
    appendKeyword,
    isLoading
  } = usePromptContext();

  if (isLoading) {
    return <div>読み込み中...</div>;
  }

  return (
    <div>
      <textarea
        value={promptState.positivePrompt}
        onChange={(e) => setPositivePrompt(e.target.value)}
      />

      <button onClick={() => appendKeyword('positive', 'masterpiece')}>
        キーワード追加
      </button>
    </div>
  );
};

export default ExampleComponent;
```

### 最適化されたフック使用

特定の値のみが必要な場合、専用フックを使用して不要な再レンダリングを回避できます。

```typescript
import { usePositivePrompt, useNegativePrompt } from '../contexts/PromptContext';

const OptimizedComponent: React.FC = () => {
  // ポジティブプロンプトのみを監視
  const positivePrompt = usePositivePrompt();

  return <div>{positivePrompt}</div>;
};
```

---

## Storage Service連携

Context内部で使用されるストレージサービスの参照実装です。

```typescript
import { StorageKey, StorageServiceResponse, AppError } from '../types';

/**
 * Chrome Storageからデータを読み込む
 */
export const loadFromStorage = async <T>(key: StorageKey): Promise<StorageServiceResponse<T>> => {
  try {
    const result = await chrome.storage.local.get(key);

    if (result[key] !== undefined) {
      return {
        success: true,
        data: result[key] as T
      };
    }

    return {
      success: true,
      data: undefined
    };
  } catch (error) {
    const appError: AppError = {
      type: 'storage',
      message: `Failed to load data from storage: ${key}`,
      originalError: error instanceof Error ? error : undefined
    };

    return {
      success: false,
      error: appError
    };
  }
};

/**
 * Chrome Storageにデータを保存
 */
export const saveToStorage = async <T>(key: StorageKey, data: T): Promise<StorageServiceResponse<void>> => {
  try {
    await chrome.storage.local.set({ [key]: data });

    return {
      success: true
    };
  } catch (error) {
    const appError: AppError = {
      type: 'storage',
      message: `Failed to save data to storage: ${key}`,
      originalError: error instanceof Error ? error : undefined
    };

    return {
      success: false,
      error: appError
    };
  }
};
```

詳細な実装は[データ永続化設計](./04-data-persistence.md)を参照してください。

---

## API リファレンス

### PromptContextValue

| プロパティ | 型 | 説明 |
|-----------|-----|------|
| `promptState` | `PromptState` | 現在のプロンプト状態（読み取り専用） |
| `isLoading` | `boolean` | 初期読み込み状態（読み取り専用） |
| `updatePrompt` | `(target: PromptTarget, value: string) => void` | 汎用的なプロンプト更新関数 |
| `setPositivePrompt` | `(value: string) => void` | ポジティブプロンプト更新 |
| `setNegativePrompt` | `(value: string) => void` | ネガティブプロンプト更新 |
| `setPromptState` | `(state: PromptState) => void` | プロンプト全体の一括設定 |
| `resetPrompt` | `() => void` | プロンプトのリセット |
| `appendKeyword` | `(target: PromptTarget, keyword: string) => void` | キーワードの追記 |

### カスタムフック

| フック名 | 戻り値 | 用途 |
|----------|--------|------|
| `usePromptContext()` | `PromptContextValue` | 完全なContext値を取得 |
| `usePositivePrompt()` | `string` | ポジティブプロンプトのみ取得（最適化） |
| `useNegativePrompt()` | `string` | ネガティブプロンプトのみ取得（最適化） |

---

## パフォーマンス最適化

### useMemoによるContext値のメモ化

```typescript
const contextValue = useMemo<PromptContextValue>(
  () => ({
    promptState,
    updatePrompt,
    setPositivePrompt,
    setNegativePrompt,
    setPromptState,
    resetPrompt,
    appendKeyword,
    isLoading
  }),
  [
    promptState,
    updatePrompt,
    setPositivePrompt,
    setNegativePrompt,
    setPromptState,
    resetPrompt,
    appendKeyword,
    isLoading
  ]
);
```

**効果**: 依存値が変更されない限り、Context値オブジェクトの再生成を防止し、全Consumerの不要な再レンダリングを回避します。

### useCallbackによる関数のメモ化

```typescript
const updatePrompt = useCallback((target: PromptTarget, value: string): void => {
  setPromptStateInternal((prevState) => ({
    ...prevState,
    [target === 'positive' ? 'positivePrompt' : 'negativePrompt']: value
  }));
}, []);
```

**効果**: 関数の再生成を防止し、子コンポーネントに関数をpropsとして渡す際のパフォーマンスを改善します。

---

## エラーハンドリング

### Provider外での使用検出

```typescript
export const usePromptContext = (): PromptContextValue => {
  const context = useContext(PromptContext);

  if (context === undefined) {
    throw new Error('usePromptContext must be used within a PromptProvider');
  }

  return context;
};
```

**動作**: Providerの外でフックを使用した場合、開発時に即座にエラーを検出できます。

### ストレージエラーハンドリング

```typescript
try {
  await saveToStorage(StorageKeys.AUTO_SAVE, promptState);
} catch (error) {
  console.error('Failed to auto-save prompt state:', error);
  // アプリケーションの動作は継続
}
```

**動作**: ストレージ操作失敗時もアプリケーションをクラッシュさせず、エラーログを記録します。

---

## ベストプラクティス

### ✅ 推奨される使い方

```typescript
// 1. Providerでアプリをラップ
<PromptProvider>
  <App />
</PromptProvider>

// 2. コンポーネント内でフックを使用
const { promptState, setPositivePrompt } = usePromptContext();

// 3. 最適化のため必要な値のみ取得
const positivePrompt = usePositivePrompt();
```

### ❌ 避けるべき使い方

```typescript
// Provider外でのフック使用
const SomeComponent = () => {
  const context = usePromptContext(); // エラー！
};

// Contextを直接importして使用
import { PromptContext } from './contexts/PromptContext';
const context = useContext(PromptContext); // 非推奨
```

---

## 関連ドキュメント

- **[型システム設計](./02-type-system.md)**: `PromptState`、`PromptTarget`の型定義
- **[データ永続化設計](./04-data-persistence.md)**: Chrome Storage APIの詳細実装
- **[コンポーネント設計](./05-component-architecture.md)**: Contextを使用するUIコンポーネント

---

## 変更履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|----------|
| 1.0 | 2025-10-19 | 初版作成 - React Context状態管理設計の完全ドキュメント化 |
