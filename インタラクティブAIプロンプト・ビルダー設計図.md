ブラウザ拡張機能「インタラクティブAIプロンプト・ビルダー」機能仕様案（改訂版）

概要
AI画像生成のプロンプトを、ブラウザのサイドパネル上で「日本語の直感」と「英語の正確性」を両立させながら構築・管理するツール。


日本語で表示されたキーワードを選択するだけで高品質な英語プロンプトを構築できる「ビルダー機能」と、構築したプロンプトを日本語で確認・編集し、即座に英語原文へ逆翻訳反映させる「インタラクティブ翻訳機能」を完全に統合する。
「自動保存」「履歴保存」機能も搭載し、ユーザーの試行錯誤とプロンプト資産の蓄積を強力にサポートする。

主な機能
機能A：プロンプト構築＆双方向翻訳インターフェース
プロンプトを構築し、編集するメインの作業エリアです。


① 原文（ポジティブ・プロンプト）エリア
AIに渡す英語のプロンプトが構築されるテキストエリア。（例：masterpiece, best quality, 1girl, gothic）
このエリアは、前回の「ポジティブ・プロンプト・エリア」と「翻訳の原文エリア」を統合したエリアとなります。
② 翻訳結果（日本語確認）エリア
上記①の原文エリアの内容が、リアルタイムで日本語に自動翻訳されて表示されるエリアです。（例：「傑作、最高品質、一人の女の子、ゴシック風」）
③ 双方向リアルタイム翻訳（インタラクティブ編集機能）
要望1の核心機能です。
原文（英）→ 翻訳結果（日）：ユーザーが①の原文エリアを編集（または後述のセレクターで追加）すると、即座に②の翻訳結果（日本語）が更新されます。
翻訳結果（日）→ 原文（英）：ユーザーが②の翻訳結果（日本語）エリアを編集（例：「ゴシック風」を「サイバーパンク風」に修正）すると、その内容が即座に逆翻訳され、①の原文（英語）エリアに反映・更新されます。（例：gothic が cyberpunk に置き換わる）
これにより、ユーザーは使い慣れた日本語でプロンプトのニュアンスを微調整できます。
④ キーワード・セレクター（日本語UI・英語出力）
要望2の核心機能です。
「品質」「キャラ」「画風」「構図」など、プロンプト要素がカテゴリ別に分類されています。
表示： 各キーワードボタンは日本語で表示されます。（例：[傑作], [90年代風], [上からのアングル]）
動作： ユーザーが日本語のボタン（例：[傑作]）をクリックすると、対応する英語のキーワード（例：masterpiece）が、カンマ区切りで①の原文（英語）エリアの末尾に追記されます。
⑤ ネガティブ・プロンプト エリア
除外したい要素（英語）を入力するテキストエリア。（例：low quality, worst quality, nsfw）
キーワード・セレクターは、このネガティブ・プロンプト・エリアに対してもキーワードを追加できるように（例えば「ネガティブに追加」モードなどで）機能します。
（※将来的には、このネガティブエリアにも②③と同様の「双方向翻訳機能」を搭載することも検討可能です）
機能B：自動保存＆履歴管理
編集中のデータを保護し、過去の資産を再利用する機能です。
⑥ 自動保存（セッション復元）機能
ユーザーが①の原文（英語）エリアと⑤のネガティブ・プロンプト（英語）エリアに入力した内容は、編集のたびに自動でローカルストレージに保存されます。
ブラウザを閉じても、次回サイドパネル起動時に作業内容が復元されます。
⑦ 履歴保存（スナップショット）機能
「履歴に保存」ボタンを押すことで、その時点の①原文（英語）と⑤ネガティブ（英語）のセットを、名前（または日時）をつけて意図的に保存できます。
「履歴」タブから過去に保存したプロンプトセットを一覧し、クリック一つで現在の編集エリアに読み込む（復元する）ことができます。
この仕様により、「日本語で選んで（機能A-④）、英語で構築し（機能A-①）、日本語で微調整する（機能A-②③）」

【React+TS版 プロンプトビルダー設計：ステップ1】
Chrome拡張機能（サイドパネル）をReact, TypeScript, Viteで作成します。

Viteテンプレート: vite-plugin-crx-mv3 (または類似の) プラグインを使ったReact+TS用のプロジェクト構成案を提示してください。

manifest.json: サイドパネル (sidepanel.html) とストレージ (storage) を使う設定を提示してください。

最重要：「型の定義」:
プロジェクト全体で使用するデータ型を src/types.ts ファイルにまとめて作成してください。

any型の使用は一切禁止します。

以下の型を厳格に定義してください。

Keyword (日本語表示 ja と英語 en を持つ)

KeywordCategory (カテゴリ名と Keyword の配列を持つ)

HistoryEntry (ID, positiveプロンプト, negativeプロンプト, 保存日時を持つ)

PromptState (現在のpositiveとnegativeの文字列を持つ状態の型)
# ステップ1: React+TS版 プロンプトビルダー設計

## 1. Viteプロジェクト構成案

### プロジェクト構造
```
prompt-builder-extension/
├── public/
│   └── icons/
│       ├── icon16.png
│       ├── icon48.png
│       └── icon128.png
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── PromptEditor.tsx
│   │   ├── KeywordSelector.tsx
│   │   ├── HistoryPanel.tsx
│   │   └── TranslationArea.tsx
│   ├── hooks/
│   │   ├── useAutoSave.ts
│   │   ├── useTranslation.ts
│   │   └── useHistory.ts
│   ├── services/
│   │   ├── translationService.ts
│   │   └── storageService.ts
│   ├── data/
│   │   └── keywords.ts
│   ├── types.ts              # 型定義ファイル
│   ├── App.tsx
│   ├── main.tsx
│   └── sidepanel.tsx
├── manifest.json
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

### `package.json`
```json
{
  "name": "interactive-ai-prompt-builder",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@crxjs/vite-plugin": "^2.0.0-beta.21",
    "@types/chrome": "^0.0.254",
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.3.3",
    "vite": "^5.0.8"
  }
}
```

### `vite.config.ts`
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { crx } from '@crxjs/vite-plugin';
import manifest from './manifest.json';

export default defineConfig({
  plugins: [
    react(),
    crx({ manifest })
  ],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        sidepanel: 'sidepanel.html'
      }
    }
  }
});
```

### `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "types": ["chrome"]
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

## 2. `manifest.json`

```json
{
  "manifest_version": 3,
  "name": "インタラクティブAIプロンプト・ビルダー",
  "version": "1.0.0",
  "description": "AI画像生成のプロンプトを日本語と英語の双方向翻訳で構築・管理",
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  },
  "permissions": [
    "storage",
    "sidePanel"
  ],
  "side_panel": {
    "default_path": "sidepanel.html"
  },
  "action": {
    "default_title": "プロンプトビルダーを開く"
  },
  "background": {
    "service_worker": "src/background.ts",
    "type": "module"
  }
}
```

## 3. 型定義ファイル `src/types.ts`

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

/**
 * ストレージデータの型マップ
 */
export interface StorageData {
  [StorageKeys.AUTO_SAVE]: PromptState;
  [StorageKeys.HISTORY]: readonly HistoryEntry[];
  [StorageKeys.SETTINGS]: UserSettings;
}

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

/**
 * 翻訳方向の型
 */
export type TranslationDirection = 'en-to-ja' | 'ja-to-en';

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


---
# ステップ2: 状態管理設計（React Context）

## 1. src/contexts/PromptContext.tsx

TypeScript

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

## 2. src/App.tsx

TypeScript

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

## 3. src/services/storageService.ts（参照実装）

TypeScript

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

## 4. 使用例（コンポーネント内での利用）

TypeScript

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

# ステップ3-1: キーワードデータ定義

## `src/data/keywords.ts`

```typescript
import { KeywordCategory } from '../types';

/**
 * プロンプト構築用のキーワードカテゴリデータ
 * すべてのデータは読み取り専用（readonly）として定義
 */
export const KEYWORD_CATEGORIES: readonly KeywordCategory[] = [
  {
    id: 'quality',
    name: '品質',
    order: 1,
    keywords: [
      {
        ja: '傑作',
        en: 'masterpiece',
        description: '最高品質の作品を生成'
      },
      {
        ja: '最高品質',
        en: 'best quality',
        description: '高品質な画像を生成'
      },
      {
        ja: '超詳細',
        en: 'ultra detailed',
        description: '非常に詳細な描写'
      },
      {
        ja: '高解像度',
        en: 'high resolution',
        description: '高解像度の画像'
      },
      {
        ja: '8K',
        en: '8k',
        description: '8K解像度相当の品質'
      }
    ]
  },
  {
    id: 'character',
    name: 'キャラクター',
    order: 2,
    keywords: [
      {
        ja: '1人の女の子',
        en: '1girl',
        description: '女性キャラクター1人'
      },
      {
        ja: '1人の男の子',
        en: '1boy',
        description: '男性キャラクター1人'
      },
      {
        ja: '複数の女の子',
        en: 'multiple girls',
        description: '複数の女性キャラクター'
      },
      {
        ja: 'ソロ',
        en: 'solo',
        description: '単独のキャラクター'
      },
      {
        ja: '少女',
        en: 'loli',
        description: '幼い女の子'
      }
    ]
  },
  {
    id: 'appearance',
    name: '外見',
    order: 3,
    keywords: [
      {
        ja: '長い髪',
        en: 'long hair',
        description: '長い髪型'
      },
      {
        ja: 'ツインテール',
        en: 'twintails',
        description: 'ツインテールヘアスタイル'
      },
      {
        ja: '青い目',
        en: 'blue eyes',
        description: '青い瞳'
      },
      {
        ja: '赤い髪',
        en: 'red hair',
        description: '赤色の髪'
      },
      {
        ja: '笑顔',
        en: 'smile',
        description: '笑顔の表情'
      }
    ]
  },
  {
    id: 'clothing',
    name: '服装',
    order: 4,
    keywords: [
      {
        ja: '学校の制服',
        en: 'school uniform',
        description: '学生服'
      },
      {
        ja: 'ドレス',
        en: 'dress',
        description: 'ドレス衣装'
      },
      {
        ja: '和服',
        en: 'japanese clothes',
        description: '日本の伝統衣装'
      },
      {
        ja: 'ゴシックロリータ',
        en: 'gothic lolita',
        description: 'ゴシックロリータファッション'
      },
      {
        ja: '白いシャツ',
        en: 'white shirt',
        description: '白いシャツ'
      }
    ]
  },
  {
    id: 'art_style',
    name: '画風',
    order: 5,
    keywords: [
      {
        ja: 'アニメ風',
        en: 'anime style',
        description: 'アニメ調の画風'
      },
      {
        ja: 'リアル',
        en: 'realistic',
        description: '写実的な画風'
      },
      {
        ja: '水彩画',
        en: 'watercolor',
        description: '水彩画タッチ'
      },
      {
        ja: 'サイバーパンク',
        en: 'cyberpunk',
        description: 'サイバーパンク風'
      },
      {
        ja: '90年代アニメ',
        en: '1990s \\(style\\)',
        description: '90年代アニメスタイル'
      }
    ]
  },
  {
    id: 'composition',
    name: '構図',
    order: 6,
    keywords: [
      {
        ja: '全身',
        en: 'full body',
        description: '全身を含む構図'
      },
      {
        ja: 'バストアップ',
        en: 'upper body',
        description: '上半身中心の構図'
      },
      {
        ja: 'クローズアップ',
        en: 'close-up',
        description: '顔のクローズアップ'
      },
      {
        ja: '上から',
        en: 'from above',
        description: '上からのアングル'
      },
      {
        ja: '下から',
        en: 'from below',
        description: '下からのアングル'
      }
    ]
  },
  {
    id: 'background',
    name: '背景',
    order: 7,
    keywords: [
      {
        ja: 'シンプルな背景',
        en: 'simple background',
        description: 'シンプルな背景'
      },
      {
        ja: '白い背景',
        en: 'white background',
        description: '白色の背景'
      },
      {
        ja: '屋外',
        en: 'outdoors',
        description: '屋外シーン'
      },
      {
        ja: '室内',
        en: 'indoors',
        description: '室内シーン'
      },
      {
        ja: '夜空',
        en: 'night sky',
        description: '夜の空'
      }
    ]
  },
  {
    id: 'lighting',
    name: 'ライティング',
    order: 8,
    keywords: [
      {
        ja: '柔らかい光',
        en: 'soft light',
        description: '柔らかい照明'
      },
      {
        ja: '劇的なライティング',
        en: 'dramatic lighting',
        description: 'ドラマチックな照明効果'
      },
      {
        ja: '逆光',
        en: 'backlighting',
        description: '背後からの光'
      },
      {
        ja: '夕暮れ',
        en: 'sunset',
        description: '夕暮れの光'
      },
      {
        ja: 'ネオンライト',
        en: 'neon lights',
        description: 'ネオン照明'
      }
    ]
  },
  {
    id: 'pose',
    name: 'ポーズ',
    order: 9,
    keywords: [
      {
        ja: '立っている',
        en: 'standing',
        description: '立ち姿勢'
      },
      {
        ja: '座っている',
        en: 'sitting',
        description: '座っている姿勢'
      },
      {
        ja: '歩いている',
        en: 'walking',
        description: '歩行中の姿勢'
      },
      {
        ja: '手を振っている',
        en: 'waving',
        description: '手を振るポーズ'
      },
      {
        ja: '見上げている',
        en: 'looking up',
        description: '上を見上げる姿勢'
      }
    ]
  },
  {
    id: 'effects',
    name: 'エフェクト',
    order: 10,
    keywords: [
      {
        ja: 'ブルーム効果',
        en: 'bloom',
        description: '光の滲み効果'
      },
      {
        ja: '被写界深度',
        en: 'depth of field',
        description: 'ピントのボケ効果'
      },
      {
        ja: 'レンズフレア',
        en: 'lens flare',
        description: 'レンズフレア効果'
      },
      {
        ja: 'モーションブラー',
        en: 'motion blur',
        description: '動きのブレ効果'
      },
      {
        ja: 'パーティクル',
        en: 'particles',
        description: 'パーティクルエフェクト'
      }
    ]
  }
] as const;

/**
 * ネガティブプロンプト用のキーワードカテゴリ
 */
export const NEGATIVE_KEYWORD_CATEGORIES: readonly KeywordCategory[] = [
  {
    id: 'negative_quality',
    name: '品質（ネガティブ）',
    order: 1,
    keywords: [
      {
        ja: '低品質',
        en: 'low quality',
        description: '低品質を除外'
      },
      {
        ja: '最悪品質',
        en: 'worst quality',
        description: '最低品質を除外'
      },
      {
        ja: 'ぼやけ',
        en: 'blurry',
        description: 'ぼやけた画像を除外'
      },
      {
        ja: 'ノイズ',
        en: 'noisy',
        description: 'ノイズの多い画像を除外'
      },
      {
        ja: 'アーティファクト',
        en: 'artifacts',
        description: '画像の乱れを除外'
      }
    ]
  },
  {
    id: 'negative_anatomy',
    name: '解剖学的問題',
    order: 2,
    keywords: [
      {
        ja: '悪い手',
        en: 'bad hands',
        description: '手の描写の問題を除外'
      },
      {
        ja: '欠けた指',
        en: 'missing fingers',
        description: '指の欠損を除外'
      },
      {
        ja: '余分な手足',
        en: 'extra limbs',
        description: '余分な手足を除外'
      },
      {
        ja: '変形した体',
        en: 'deformed',
        description: '体の変形を除外'
      },
      {
        ja: '不自然な体',
        en: 'bad anatomy',
        description: '解剖学的に不自然な描写を除外'
      }
    ]
  },
  {
    id: 'negative_content',
    name: 'コンテンツ',
    order: 3,
    keywords: [
      {
        ja: 'NSFW',
        en: 'nsfw',
        description: '不適切なコンテンツを除外'
      },
      {
        ja: 'グロテスク',
        en: 'grotesque',
        description: 'グロテスクな表現を除外'
      },
      {
        ja: '暴力的',
        en: 'violence',
        description: '暴力的な表現を除外'
      },
      {
        ja: '不快',
        en: 'disturbing',
        description: '不快な表現を除外'
      }
    ]
  },
  {
    id: 'negative_style',
    name: 'スタイル',
    order: 4,
    keywords: [
      {
        ja: '単純すぎる',
        en: 'simple',
        description: '単純すぎる描写を除外'
      },
      {
        ja: 'モノクロ',
        en: 'monochrome',
        description: 'モノクロ画像を除外'
      },
      {
        ja: 'テキスト',
        en: 'text',
        description: '画像内のテキストを除外'
      },
      {
        ja: '透かし',
        en: 'watermark',
        description: '透かしを除外'
      },
      {
        ja: '署名',
        en: 'signature',
        description: '署名を除外'
      }
    ]
  }
] as const;

/**
 * カテゴリIDからカテゴリを取得するヘルパー関数
 */
export const getCategoryById = (
  categoryId: string,
  isNegative = false
): KeywordCategory | undefined => {
  const categories = isNegative ? NEGATIVE_KEYWORD_CATEGORIES : KEYWORD_CATEGORIES;
  return categories.find((category) => category.id === categoryId);
};

/**
 * すべてのカテゴリを取得（ポジティブ＋ネガティブ）
 */
export const getAllCategories = (): readonly KeywordCategory[] => {
  return [...KEYWORD_CATEGORIES, ...NEGATIVE_KEYWORD_CATEGORIES] as const;
};

/**
 * キーワード総数を取得
 */
export const getTotalKeywordCount = (isNegative = false): number => {
  const categories = isNegative ? NEGATIVE_KEYWORD_CATEGORIES : KEYWORD_CATEGORIES;
  return categories.reduce((total, category) => total + category.keywords.length, 0);
};
```


---
# ステップ3-3: 双方向翻訳カスタムフック設計

## `src/hooks/useTranslation.ts`

```typescript
import { useState, useEffect, useCallback, useRef } from 'react';
import { usePromptContext } from '../contexts/PromptContext';
import { TranslationDirection } from '../types';

/**
 * モック翻訳関数（開発用）
 * 実際の翻訳APIが実装されるまでの仮実装
 * 
 * @param text - 翻訳対象のテキスト
 * @param direction - 翻訳方向
 * @returns 翻訳結果のPromise
 */
const mockTranslate = async (
  text: string,
  direction: TranslationDirection
): Promise<string> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const prefix = direction === 'en-to-ja' ? '[日本語訳]' : '[英訳]';
      resolve(`${prefix}: ${text}`);
    }, 500);
  });
};

/**
 * useTranslationフックの戻り値の型定義
 */
interface UseTranslationReturn {
  /** 翻訳結果（日本語）のテキスト */
  readonly translatedText: string;
  
  /** 日本語テキストが変更されたときのハンドラ（日→英 逆翻訳をトリガー） */
  handleJapaneseChange: (newJapaneseText: string) => void;
  
  /** 翻訳処理中かどうかのフラグ */
  readonly isTranslating: boolean;
  
  /** 翻訳エラーメッセージ（エラーがない場合はnull） */
  readonly error: string | null;
}

/**
 * useTranslationフックのオプション設定
 */
interface UseTranslationOptions {
  /** デバウンス時間（ミリ秒）デフォルト: 500ms */
  readonly debounceMs?: number;
  
  /** 翻訳を有効にするかどうか デフォルト: true */
  readonly enabled?: boolean;
}

/**
 * 双方向翻訳機能を提供するカスタムフック
 * 
 * このフックは以下の2つの翻訳機能を提供します：
 * 1. 英語（原文）→ 日本語（翻訳結果）の自動翻訳
 * 2. 日本語（翻訳結果）→ 英語（原文）の逆翻訳
 * 
 * どちらの翻訳もデバウンス処理により、入力が落ち着いてから実行されます。
 * 
 * @param options - オプション設定
 * @returns 翻訳結果と制御関数を含むオブジェクト
 * 
 * @example
 * ```tsx
 * const { translatedText, handleJapaneseChange, isTranslating } = useTranslation();
 * 
 * // 日本語エリアでの編集
 * <textarea 
 *   value={translatedText} 
 *   onChange={(e) => handleJapaneseChange(e.target.value)}
 * />
 * ```
 */
export const useTranslation = (
  options: UseTranslationOptions = {}
): UseTranslationReturn => {
  const {
    debounceMs = 500,
    enabled = true
  } = options;

  // Contextから原文（英語）とその更新関数を取得
  const { promptState, setPositivePrompt } = usePromptContext();
  const { positivePrompt } = promptState;

  // 翻訳結果（日本語）の状態
  const [translatedText, setTranslatedText] = useState<string>('');
  
  // 翻訳処理中フラグ
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  
  // エラー状態
  const [error, setError] = useState<string | null>(null);

  // デバウンスタイマーの参照を保持
  const enToJaTimerRef = useRef<NodeJS.Timeout | null>(null);
  const jaToEnTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 翻訳処理中のリクエストをキャンセルするためのフラグ
  const enToJaAbortRef = useRef<boolean>(false);
  const jaToEnAbortRef = useRef<boolean>(false);

  /**
   * 機能A: 英語 → 日本語 翻訳
   * positivePrompt（原文）が変更されたら、デバウンス後に翻訳を実行
   */
  useEffect(() => {
    // 翻訳が無効化されている場合は何もしない
    if (!enabled) {
      return;
    }

    // 原文が空の場合は翻訳結果もクリア
    if (!positivePrompt.trim()) {
      setTranslatedText('');
      setError(null);
      return;
    }

    // 既存のタイマーをクリア
    if (enToJaTimerRef.current) {
      clearTimeout(enToJaTimerRef.current);
    }

    // 進行中の翻訳をキャンセル
    enToJaAbortRef.current = true;

    // デバウンス処理
    enToJaTimerRef.current = setTimeout(() => {
      const translateEnToJa = async (): Promise<void> => {
        // 新しい翻訳リクエストのためにキャンセルフラグをリセット
        enToJaAbortRef.current = false;
        
        setIsTranslating(true);
        setError(null);

        try {
          // TODO: 実際の翻訳APIに置き換える
          const result = await mockTranslate(positivePrompt, 'en-to-ja');

          // 翻訳中にキャンセルされていないかチェック
          if (!enToJaAbortRef.current) {
            setTranslatedText(result);
          }
        } catch (err) {
          // キャンセルされていない場合のみエラーを設定
          if (!enToJaAbortRef.current) {
            const errorMessage = err instanceof Error 
              ? err.message 
              : '翻訳中にエラーが発生しました';
            setError(errorMessage);
            console.error('Translation error (en-to-ja):', err);
          }
        } finally {
          // キャンセルされていない場合のみローディング状態を解除
          if (!enToJaAbortRef.current) {
            setIsTranslating(false);
          }
        }
      };

      void translateEnToJa();
    }, debounceMs);

    // クリーンアップ関数
    return () => {
      if (enToJaTimerRef.current) {
        clearTimeout(enToJaTimerRef.current);
      }
      enToJaAbortRef.current = true;
    };
  }, [positivePrompt, debounceMs, enabled]);

  /**
   * 機能B: 日本語 → 英語 逆翻訳
   * 日本語エリアが編集されたときに呼び出されるハンドラ
   */
  const handleJapaneseChange = useCallback((newJapaneseText: string): void => {
    // 翻訳が無効化されている場合は何もしない
    if (!enabled) {
      return;
    }

    // まず、UIに即座に反映（翻訳結果の状態を更新）
    setTranslatedText(newJapaneseText);
    setError(null);

    // 既存のタイマーをクリア
    if (jaToEnTimerRef.current) {
      clearTimeout(jaToEnTimerRef.current);
    }

    // 進行中の逆翻訳をキャンセル
    jaToEnAbortRef.current = true;

    // 日本語テキストが空の場合は原文もクリア
    if (!newJapaneseText.trim()) {
      setPositivePrompt('');
      return;
    }

    // デバウンス処理
    jaToEnTimerRef.current = setTimeout(() => {
      const translateJaToEn = async (): Promise<void> => {
        // 新しい逆翻訳リクエストのためにキャンセルフラグをリセット
        jaToEnAbortRef.current = false;
        
        setIsTranslating(true);

        try {
          // TODO: 実際の翻訳APIに置き換える
          const result = await mockTranslate(newJapaneseText, 'ja-to-en');

          // 逆翻訳中にキャンセルされていないかチェック
          if (!jaToEnAbortRef.current) {
            // Contextの原文（英語）を更新
            setPositivePrompt(result);
          }
        } catch (err) {
          // キャンセルされていない場合のみエラーを設定
          if (!jaToEnAbortRef.current) {
            const errorMessage = err instanceof Error 
              ? err.message 
              : '逆翻訳中にエラーが発生しました';
            setError(errorMessage);
            console.error('Translation error (ja-to-en):', err);
          }
        } finally {
          // キャンセルされていない場合のみローディング状態を解除
          if (!jaToEnAbortRef.current) {
            setIsTranslating(false);
          }
        }
      };

      void translateJaToEn();
    }, debounceMs);
  }, [setPositivePrompt, debounceMs, enabled]);

  /**
   * コンポーネントのアンマウント時にタイマーをクリーンアップ
   */
  useEffect(() => {
    return () => {
      if (enToJaTimerRef.current) {
        clearTimeout(enToJaTimerRef.current);
      }
      if (jaToEnTimerRef.current) {
        clearTimeout(jaToEnTimerRef.current);
      }
      enToJaAbortRef.current = true;
      jaToEnAbortRef.current = true;
    };
  }, []);

  return {
    translatedText,
    handleJapaneseChange,
    isTranslating,
    error
  };
};

/**
 * ネガティブプロンプト用の翻訳フック
 * useTranslationと同様の機能を提供しますが、ネガティブプロンプトに対応
 * 
 * @param options - オプション設定
 * @returns 翻訳結果と制御関数を含むオブジェクト
 */
export const useNegativeTranslation = (
  options: UseTranslationOptions = {}
): UseTranslationReturn => {
  const {
    debounceMs = 500,
    enabled = true
  } = options;

  const { promptState, setNegativePrompt } = usePromptContext();
  const { negativePrompt } = promptState;

  const [translatedText, setTranslatedText] = useState<string>('');
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const enToJaTimerRef = useRef<NodeJS.Timeout | null>(null);
  const jaToEnTimerRef = useRef<NodeJS.Timeout | null>(null);
  const enToJaAbortRef = useRef<boolean>(false);
  const jaToEnAbortRef = useRef<boolean>(false);

  // 英語 → 日本語 翻訳
  useEffect(() => {
    if (!enabled) {
      return;
    }

    if (!negativePrompt.trim()) {
      setTranslatedText('');
      setError(null);
      return;
    }

    if (enToJaTimerRef.current) {
      clearTimeout(enToJaTimerRef.current);
    }

    enToJaAbortRef.current = true;

    enToJaTimerRef.current = setTimeout(() => {
      const translateEnToJa = async (): Promise<void> => {
        enToJaAbortRef.current = false;
        setIsTranslating(true);
        setError(null);

        try {
          const result = await mockTranslate(negativePrompt, 'en-to-ja');

          if (!enToJaAbortRef.current) {
            setTranslatedText(result);
          }
        } catch (err) {
          if (!enToJaAbortRef.current) {
            const errorMessage = err instanceof Error 
              ? err.message 
              : '翻訳中にエラーが発生しました';
            setError(errorMessage);
            console.error('Translation error (en-to-ja):', err);
          }
        } finally {
          if (!enToJaAbortRef.current) {
            setIsTranslating(false);
          }
        }
      };

      void translateEnToJa();
    }, debounceMs);

    return () => {
      if (enToJaTimerRef.current) {
        clearTimeout(enToJaTimerRef.current);
      }
      enToJaAbortRef.current = true;
    };
  }, [negativePrompt, debounceMs, enabled]);

  // 日本語 → 英語 逆翻訳
  const handleJapaneseChange = useCallback((newJapaneseText: string): void => {
    if (!enabled) {
      return;
    }

    setTranslatedText(newJapaneseText);
    setError(null);

    if (jaToEnTimerRef.current) {
      clearTimeout(jaToEnTimerRef.current);
    }

    jaToEnAbortRef.current = true;

    if (!newJapaneseText.trim()) {
      setNegativePrompt('');
      return;
    }

    jaToEnTimerRef.current = setTimeout(() => {
      const translateJaToEn = async (): Promise<void> => {
        jaToEnAbortRef.current = false;
        setIsTranslating(true);

        try {
          const result = await mockTranslate(newJapaneseText, 'ja-to-en');

          if (!jaToEnAbortRef.current) {
            setNegativePrompt(result);
          }
        } catch (err) {
          if (!jaToEnAbortRef.current) {
            const errorMessage = err instanceof Error 
              ? err.message 
              : '逆翻訳中にエラーが発生しました';
            setError(errorMessage);
            console.error('Translation error (ja-to-en):', err);
          }
        } finally {
          if (!jaToEnAbortRef.current) {
            setIsTranslating(false);
          }
        }
      };

      void translateJaToEn();
    }, debounceMs);
  }, [setNegativePrompt, debounceMs, enabled]);

  useEffect(() => {
    return () => {
      if (enToJaTimerRef.current) {
        clearTimeout(enToJaTimerRef.current);
      }
      if (jaToEnTimerRef.current) {
        clearTimeout(jaToEnTimerRef.current);
      }
      enToJaAbortRef.current = true;
      jaToEnAbortRef.current = true;
    };
  }, []);

  return {
    translatedText,
    handleJapaneseChange,
    isTranslating,
    error
  };
};
```

## 使用例: `src/components/TranslationArea.tsx`

```typescript
import React from 'react';
import { usePromptContext } from '../contexts/PromptContext';
import { useTranslation } from '../hooks/useTranslation';

/**
 * 双方向翻訳エリアコンポーネント
 * 英語原文と日本語翻訳結果を表示し、相互に編集可能にする
 */
const TranslationArea: React.FC = () => {
  const { promptState } = usePromptContext();
  const { 
    translatedText, 
    handleJapaneseChange, 
    isTranslating,
    error 
  } = useTranslation();

  return (
    <div className="translation-area">
      <div className="translation-section">
        <label htmlFor="english-prompt">
          原文（英語）
          {isTranslating && <span className="loading-indicator"> 翻訳中...</span>}
        </label>
        <textarea
          id="english-prompt"
          value={promptState.positivePrompt}
          readOnly
          placeholder="キーワードを選択するか、日本語エリアで編集してください"
          className="prompt-textarea"
        />
      </div>

      <div className="translation-section">
        <label htmlFor="japanese-translation">
          翻訳結果（日本語）
          <span className="edit-hint"> ※ 編集可能</span>
        </label>
        <textarea
          id="japanese-translation"
          value={translatedText}
          onChange={(e) => handleJapaneseChange(e.target.value)}
          placeholder="日本語で編集すると、自動的に英語に逆翻訳されます"
          className="prompt-textarea"
          disabled={isTranslating}
        />
        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default TranslationArea;
```

## 主な設計ポイント

### 1. **デバウンス処理の実装**
- `useRef` でタイマーIDを保持し、入力のたびにタイマーをリセット
- 入力が止まってから指定時間（デフォルト500ms）後に翻訳を実行

### 2. **キャンセル処理**
- `useRef` でキャンセルフラグを保持
- 新しい翻訳リクエストが発生したら、前のリクエストの結果を無視
- コンポーネントのアンマウント時にも適切にクリーンアップ

### 3. **双方向の翻訳**
- **英→日**: `useEffect` で `positivePrompt` の変更を監視
- **日→英**: `handleJapaneseChange` コールバックで逆翻訳をトリガー

### 4. **型安全性**
- すべての関数とステートに明示的な型定義
- `readonly` を活用して不変性を保証

### 5. **エラーハンドリング**
- 翻訳エラーを状態として保持
- UIでエラーメッセージを表示可能

### 6. **拡張性**
- ネガティブプロンプト用の `useNegativeTranslation` も同様のロジックで実装
- オプションで翻訳の有効/無効やデバウンス時間を制御可能

この設計により、ユーザーは日本語と英語を自由に行き来しながら、直感的にプロンプトを構築・編集できます。

---

# ステップ3-4: PromptEditorコンポーネント実装

## `src/components/PromptEditor.tsx`

```typescript
import React, { useState, useCallback } from 'react';
import { usePromptContext } from '../contexts/PromptContext';
import { useTranslation, useNegativeTranslation } from '../hooks/useTranslation';
import styles from './PromptEditor.module.css';

/**
 * クリップボードへのコピー結果の型
 */
interface CopyResult {
  readonly success: boolean;
  readonly message: string;
}

/**
 * プロンプト編集のメインコンポーネント
 * ポジティブ・ネガティブプロンプトの双方向翻訳機能を提供
 */
const PromptEditor: React.FC = () => {
  const { promptState, resetPrompt } = usePromptContext();
  
  // 翻訳機能の有効/無効状態
  const [translationEnabled, setTranslationEnabled] = useState<boolean>(true);
  
  // コピー成功時のフィードバック表示用
  const [copyFeedback, setCopyFeedback] = useState<{
    type: 'positive' | 'negative' | null;
    message: string;
  }>({ type: null, message: '' });

  // ポジティブプロンプトの翻訳フック
  const {
    translatedText: positiveTranslated,
    handleJapaneseChange: handlePositiveJapaneseChange,
    isTranslating: isPositiveTranslating,
    error: positiveError
  } = useTranslation({ enabled: translationEnabled });

  // ネガティブプロンプトの翻訳フック
  const {
    translatedText: negativeTranslated,
    handleJapaneseChange: handleNegativeJapaneseChange,
    isTranslating: isNegativeTranslating,
    error: negativeError
  } = useNegativeTranslation({ enabled: translationEnabled });

  /**
   * クリップボードにテキストをコピーする
   * 
   * @param text - コピーするテキスト
   * @param type - コピー対象のタイプ（フィードバック表示用）
   */
  const copyToClipboard = useCallback(async (
    text: string,
    type: 'positive' | 'negative'
  ): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
      
      setCopyFeedback({
        type,
        message: 'コピーしました！'
      });

      // 2秒後にフィードバックを消す
      setTimeout(() => {
        setCopyFeedback({ type: null, message: '' });
      }, 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      
      setCopyFeedback({
        type,
        message: 'コピーに失敗しました'
      });

      setTimeout(() => {
        setCopyFeedback({ type: null, message: '' });
      }, 2000);
    }
  }, []);

  /**
   * ポジティブプロンプトをコピー
   */
  const handleCopyPositive = useCallback((): void => {
    void copyToClipboard(promptState.positivePrompt, 'positive');
  }, [promptState.positivePrompt, copyToClipboard]);

  /**
   * ネガティブプロンプトをコピー
   */
  const handleCopyNegative = useCallback((): void => {
    void copyToClipboard(promptState.negativePrompt, 'negative');
  }, [promptState.negativePrompt, copyToClipboard]);

  /**
   * 翻訳機能の有効/無効を切り替え
   */
  const handleToggleTranslation = useCallback((): void => {
    setTranslationEnabled((prev) => !prev);
  }, []);

  /**
   * プロンプトをリセット（確認ダイアログ付き）
   */
  const handleReset = useCallback((): void => {
    const confirmed = window.confirm(
      'すべてのプロンプトをリセットしますか？\n' +
      'この操作は取り消せません。\n' +
      '（自動保存された内容も削除されます）'
    );

    if (confirmed) {
      resetPrompt();
    }
  }, [resetPrompt]);

  return (
    <div className={styles.promptEditor}>
      {/* ヘッダー: グローバル設定 */}
      <header className={styles.header}>
        <h2 className={styles.title}>プロンプト編集</h2>
        
        <div className={styles.controls}>
          {/* 翻訳機能トグル */}
          <label className={styles.toggleLabel}>
            <input
              type="checkbox"
              checked={translationEnabled}
              onChange={handleToggleTranslation}
              className={styles.toggleInput}
            />
            <span className={styles.toggleText}>
              翻訳機能: {translationEnabled ? 'ON' : 'OFF'}
            </span>
          </label>

          {/* リセットボタン */}
          <button
            onClick={handleReset}
            className={styles.resetButton}
            type="button"
            aria-label="プロンプトをリセット"
          >
            <span className={styles.resetIcon}>🗑️</span>
            リセット
          </button>
        </div>
      </header>

      {/* ポジティブプロンプト・セクション */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>
            ポジティブプロンプト
            {isPositiveTranslating && (
              <span className={styles.loadingIndicator}> 翻訳中...</span>
            )}
          </h3>
          <button
            onClick={handleCopyPositive}
            className={styles.copyButton}
            type="button"
            disabled={!promptState.positivePrompt.trim()}
            aria-label="ポジティブプロンプトをコピー"
          >
            📋 原文をコピー
          </button>
          {copyFeedback.type === 'positive' && (
            <span className={styles.copyFeedback} role="status">
              {copyFeedback.message}
            </span>
          )}
        </div>

        <div className={styles.textareaGroup}>
          {/* 原文（英語） */}
          <div className={styles.textareaWrapper}>
            <label htmlFor="positive-english" className={styles.label}>
              原文（英語）
              <span className={styles.labelHint}> ※ 読み取り専用</span>
            </label>
            <textarea
              id="positive-english"
              value={promptState.positivePrompt}
              readOnly
              placeholder="キーワードを選択するか、下の日本語エリアで編集してください"
              className={`${styles.textarea} ${styles.readOnly}`}
              rows={4}
            />
          </div>

          {/* 翻訳結果（日本語） */}
          <div className={styles.textareaWrapper}>
            <label htmlFor="positive-japanese" className={styles.label}>
              翻訳結果（日本語）
              <span className={styles.labelHint}> ※ 編集可能</span>
            </label>
            <textarea
              id="positive-japanese"
              value={positiveTranslated}
              onChange={(e) => handlePositiveJapaneseChange(e.target.value)}
              placeholder="日本語で編集すると、自動的に英語に逆翻訳されます"
              className={styles.textarea}
              disabled={!translationEnabled || isPositiveTranslating}
              rows={4}
            />
            {positiveError && (
              <div className={styles.errorMessage} role="alert">
                ⚠️ {positiveError}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ネガティブプロンプト・セクション */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>
            ネガティブプロンプト
            {isNegativeTranslating && (
              <span className={styles.loadingIndicator}> 翻訳中...</span>
            )}
          </h3>
          <button
            onClick={handleCopyNegative}
            className={styles.copyButton}
            type="button"
            disabled={!promptState.negativePrompt.trim()}
            aria-label="ネガティブプロンプトをコピー"
          >
            📋 原文をコピー
          </button>
          {copyFeedback.type === 'negative' && (
            <span className={styles.copyFeedback} role="status">
              {copyFeedback.message}
            </span>
          )}
        </div>

        <div className={styles.textareaGroup}>
          {/* 原文（英語） */}
          <div className={styles.textareaWrapper}>
            <label htmlFor="negative-english" className={styles.label}>
              原文（英語）
              <span className={styles.labelHint}> ※ 読み取り専用</span>
            </label>
            <textarea
              id="negative-english"
              value={promptState.negativePrompt}
              readOnly
              placeholder="除外したい要素を日本語エリアで編集してください"
              className={`${styles.textarea} ${styles.readOnly}`}
              rows={4}
            />
          </div>

          {/* 翻訳結果（日本語） */}
          <div className={styles.textareaWrapper}>
            <label htmlFor="negative-japanese" className={styles.label}>
              翻訳結果（日本語）
              <span className={styles.labelHint}> ※ 編集可能</span>
            </label>
            <textarea
              id="negative-japanese"
              value={negativeTranslated}
              onChange={(e) => handleNegativeJapaneseChange(e.target.value)}
              placeholder="除外したい要素を日本語で入力してください"
              className={styles.textarea}
              disabled={!translationEnabled || isNegativeTranslating}
              rows={4}
            />
            {negativeError && (
              <div className={styles.errorMessage} role="alert">
                ⚠️ {negativeError}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 翻訳無効時の注意メッセージ */}
      {!translationEnabled && (
        <div className={styles.infoMessage} role="status">
          ℹ️ 翻訳機能が無効になっています。日本語エリアの編集は反映されません。
        </div>
      )}
    </div>
  );
};

export default PromptEditor;
```

## `src/components/PromptEditor.module.css`

```css
/**
 * PromptEditor コンポーネントのスタイル
 */

.promptEditor {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* ========================================
   ヘッダー
   ======================================== */

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e5e7eb;
}

.title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
}

.controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

/* ========================================
   翻訳トグルスイッチ
   ======================================== */

.toggleLabel {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  user-select: none;
}

.toggleInput {
  width: 2.5rem;
  height: 1.25rem;
  appearance: none;
  background-color: #d1d5db;
  border-radius: 9999px;
  position: relative;
  cursor: pointer;
  transition: background-color 0.2s;
}

.toggleInput:checked {
  background-color: #3b82f6;
}

.toggleInput::before {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 1rem;
  height: 1rem;
  background-color: white;
  border-radius: 50%;
  transition: transform 0.2s;
}

.toggleInput:checked::before {
  transform: translateX(1.25rem);
}

.toggleText {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

/* ========================================
   リセットボタン
   ======================================== */

.resetButton {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #dc2626;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.resetButton:hover {
  background-color: #fee2e2;
  border-color: #fca5a5;
}

.resetButton:active {
  transform: scale(0.98);
}

.resetIcon {
  font-size: 1rem;
}

/* ========================================
   セクション
   ======================================== */

.section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
}

.sectionHeader {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.sectionTitle {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  flex: 1;
}

.loadingIndicator {
  font-size: 0.875rem;
  font-weight: 400;
  color: #6b7280;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* ========================================
   コピーボタン
   ======================================== */

.copyButton {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #3b82f6;
  background-color: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.copyButton:hover:not(:disabled) {
  background-color: #dbeafe;
  border-color: #93c5fd;
}

.copyButton:active:not(:disabled) {
  transform: scale(0.98);
}

.copyButton:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.copyFeedback {
  font-size: 0.875rem;
  font-weight: 500;
  color: #059669;
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ========================================
   テキストエリアグループ
   ======================================== */

.textareaGroup {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.textareaWrapper {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.labelHint {
  font-size: 0.75rem;
  font-weight: 400;
  color: #6b7280;
}

.textarea {
  width: 100%;
  padding: 0.75rem;
  font-size: 0.875rem;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  line-height: 1.5;
  color: #1f2937;
  background-color: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  resize: vertical;
  transition: all 0.2s;
}

.textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.textarea:disabled {
  background-color: #f3f4f6;
  color: #9ca3af;
  cursor: not-allowed;
}

.textarea::placeholder {
  color: #9ca3af;
}

.readOnly {
  background-color: #f9fafb;
  color: #4b5563;
  cursor: default;
}

.readOnly:focus {
  border-color: #d1d5db;
  box-shadow: none;
}

/* ========================================
   メッセージ
   ======================================== */

.errorMessage {
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  color: #dc2626;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 4px;
}

.infoMessage {
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  color: #1e40af;
  background-color: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 6px;
  text-align: center;
}

/* ========================================
   レスポンシブデザイン
   ======================================== */

@media (min-width: 768px) {
  .promptEditor {
    padding: 1.5rem;
  }

  .textareaGroup {
    flex-direction: row;
    gap: 1.5rem;
  }

  .textareaWrapper {
    flex: 1;
  }

  .textarea {
    min-height: 120px;
  }
}

@media (max-width: 767px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .controls {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
  }

  .toggleLabel {
    justify-content: space-between;
  }

  .resetButton {
    justify-content: center;
  }

  .sectionHeader {
    flex-wrap: wrap;
  }

  .copyButton {
    width: 100%;
  }
}
```

## 主な実装ポイント

### 1. **双方向翻訳の統合**
- `useTranslation` と `useNegativeTranslation` を使用
- ポジティブ/ネガティブそれぞれで独立した翻訳状態を管理

### 2. **ユーザビリティ機能**
- **コピー機能**: クリップボードAPIを使用し、視覚的フィードバックを提供
- **翻訳トグル**: 翻訳機能のON/OFFを切り替え可能
- **リセット機能**: 確認ダイアログで誤操作を防止

### 3. **アクセシビリティ**
- `aria-label` でボタンの目的を明示
- `role="alert"` でエラーメッセージをスクリーンリーダーに通知
- `role="status"` でコピー成功のフィードバックを通知

### 4. **レスポンシブデザイン**
- デスクトップ: 英語/日本語を横並び表示
- モバイル: 縦並びで表示し、タッチ操作に最適化

### 5. **視覚的フィードバック**
- 翻訳中のローディング表示
- コピー成功/失敗のメッセージ
- エラーメッセージの表示
- 翻訳無効時の注意喚起

### 6. **型安全性**
- すべてのイベントハンドラに適切な型定義
- `useCallback` でメモ化し、パフォーマンスを最適化

このコンポーネントにより、ユーザーは直感的に日本語と英語を行き来しながら、高品質なプロンプトを構築できます。

---
# ステップ3-5: 履歴管理カスタムフック実装

## `src/hooks/useHistory.ts`

```typescript
import { useState, useEffect, useCallback } from 'react';
import { usePromptContext } from '../contexts/PromptContext';
import { loadFromStorage, saveToStorage } from '../services/storageService';
import type { HistoryEntry, PromptState, StorageKeys } from '../types';

/**
 * 一意なIDを生成する関数
 * タイムスタンプとランダム文字列を組み合わせて衝突を防ぐ
 * 
 * @returns 一意なID文字列
 */
const generateUniqueId = (): string => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 9);
  return `${timestamp}-${randomStr}`;
};

/**
 * useHistoryフックの戻り値の型定義
 */
interface UseHistoryReturn {
  /** 履歴エントリのリスト（新しい順） */
  readonly historyList: readonly HistoryEntry[];
  
  /** 履歴の読み込み中かどうかのフラグ */
  readonly isLoading: boolean;
  
  /** 現在のプロンプト状態を履歴に保存する関数 */
  saveHistory: (prompt: PromptState) => Promise<void>;
  
  /** 指定されたIDの履歴エントリを削除する関数 */
  deleteHistory: (id: string) => Promise<void>;
  
  /** 指定された履歴エントリをエディタに適用する関数 */
  applyHistory: (entry: HistoryEntry) => void;
  
  /** 履歴を手動で再読み込みする関数 */
  reloadHistory: () => Promise<void>;
}

/**
 * useHistoryフックのオプション設定
 */
interface UseHistoryOptions {
  /** 保持する履歴の最大件数 デフォルト: 50 */
  readonly maxHistoryCount?: number;
  
  /** 自動読み込みを有効にするかどうか デフォルト: true */
  readonly autoLoad?: boolean;
}

/**
 * 履歴の保存・読み込み・削除機能を提供するカスタムフック
 * 
 * このフックは以下の機能を提供します：
 * - 履歴の初期読み込み
 * - 新しい履歴の保存
 * - 履歴の削除
 * - 履歴のエディタへの適用
 * 
 * @param options - オプション設定
 * @returns 履歴リストと操作関数を含むオブジェクト
 * 
 * @example
 * ```tsx
 * const { historyList, saveHistory, applyHistory } = useHistory();
 * 
 * // 履歴を保存
 * await saveHistory(currentPromptState);
 * 
 * // 履歴を適用
 * applyHistory(historyList[0]);
 * ```
 */
export const useHistory = (
  options: UseHistoryOptions = {}
): UseHistoryReturn => {
  const {
    maxHistoryCount = 50,
    autoLoad = true
  } = options;

  const { setPromptState } = usePromptContext();

  // 履歴一覧の状態（新しい順にソート）
  const [historyList, setHistoryList] = useState<HistoryEntry[]>([]);
  
  // 読み込み中フラグ
  const [isLoading, setIsLoading] = useState<boolean>(true);

  /**
   * 機能A: 履歴の初期読み込み
   * ストレージから履歴データを読み込んで状態にセットする
   */
  const loadHistory = useCallback(async (): Promise<void> => {
    setIsLoading(true);

    try {
      // ストレージから履歴を読み込む
      const storedHistory = await loadFromStorage<HistoryEntry[]>(
        'HISTORY' as StorageKeys
      );

      if (storedHistory && Array.isArray(storedHistory)) {
        // 日付順（新しい順）にソート
        const sortedHistory = [...storedHistory].sort((a, b) => {
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        });

        setHistoryList(sortedHistory);
      } else {
        // 履歴が存在しない場合は空配列をセット
        setHistoryList([]);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
      setHistoryList([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * コンポーネントのマウント時に履歴を読み込む
   */
  useEffect(() => {
    if (autoLoad) {
      void loadHistory();
    } else {
      setIsLoading(false);
    }
  }, [autoLoad, loadHistory]);

  /**
   * 機能B: 履歴の保存
   * 現在のプロンプト状態を新しい履歴エントリとして保存する
   * 
   * @param prompt - 保存するプロンプト状態
   */
  const saveHistory = useCallback(async (prompt: PromptState): Promise<void> => {
    try {
      // 空のプロンプトは保存しない
      if (!prompt.positivePrompt.trim() && !prompt.negativePrompt.trim()) {
        console.warn('Cannot save empty prompt to history');
        return;
      }

      // 新しい履歴エントリを作成
      const newEntry: HistoryEntry = {
        id: generateUniqueId(),
        positivePrompt: prompt.positivePrompt,
        negativePrompt: prompt.negativePrompt,
        timestamp: new Date().toISOString()
      };

      // 現在の履歴リストの先頭に新しいエントリを追加
      const updatedHistory = [newEntry, ...historyList];

      // 最大件数を超える場合は古いエントリを削除
      const trimmedHistory = updatedHistory.slice(0, maxHistoryCount);

      // 状態を更新
      setHistoryList(trimmedHistory);

      // ストレージに保存
      await saveToStorage('HISTORY' as StorageKeys, trimmedHistory);

      console.log('History saved successfully:', newEntry.id);
    } catch (error) {
      console.error('Failed to save history:', error);
      throw new Error('履歴の保存に失敗しました');
    }
  }, [historyList, maxHistoryCount]);

  /**
   * 機能C: 履歴の削除
   * 指定されたIDの履歴エントリを削除する
   * 
   * @param id - 削除する履歴エントリのID
   */
  const deleteHistory = useCallback(async (id: string): Promise<void> => {
    try {
      // 指定されたIDのエントリを除外
      const updatedHistory = historyList.filter((entry) => entry.id !== id);

      // 状態を更新
      setHistoryList(updatedHistory);

      // ストレージに保存
      await saveToStorage('HISTORY' as StorageKeys, updatedHistory);

      console.log('History deleted successfully:', id);
    } catch (error) {
      console.error('Failed to delete history:', error);
      throw new Error('履歴の削除に失敗しました');
    }
  }, [historyList]);

  /**
   * 機能D: 履歴の適用
   * 指定された履歴エントリの内容をエディタに復元する
   * 
   * @param entry - 適用する履歴エントリ
   */
  const applyHistory = useCallback((entry: HistoryEntry): void => {
    try {
      // Contextのプロンプト状態を更新
      setPromptState({
        positivePrompt: entry.positivePrompt,
        negativePrompt: entry.negativePrompt
      });

      console.log('History applied successfully:', entry.id);
    } catch (error) {
      console.error('Failed to apply history:', error);
      throw new Error('履歴の適用に失敗しました');
    }
  }, [setPromptState]);

  /**
   * 履歴を手動で再読み込みする関数
   * 外部からストレージの変更を検知した場合などに使用
   */
  const reloadHistory = useCallback(async (): Promise<void> => {
    await loadHistory();
  }, [loadHistory]);

  return {
    historyList,
    isLoading,
    saveHistory,
    deleteHistory,
    applyHistory,
    reloadHistory
  };
};

/**
 * 履歴エントリをフォーマットして表示用の文字列を生成するユーティリティ関数
 * 
 * @param entry - フォーマットする履歴エントリ
 * @param maxLength - プロンプトの最大表示文字数 デフォルト: 50
 * @returns フォーマットされた表示用文字列
 * 
 * @example
 * ```tsx
 * const displayText = formatHistoryEntry(entry);
 * // => "2025-10-19 19:23 | a beautiful landscape..."
 * ```
 */
export const formatHistoryEntry = (
  entry: HistoryEntry,
  maxLength: number = 50
): string => {
  // タイムスタンプをフォーマット
  const date = new Date(entry.timestamp);
  const dateStr = date.toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });

  // ポジティブプロンプトの先頭部分を取得
  const promptPreview = entry.positivePrompt.length > maxLength
    ? `${entry.positivePrompt.substring(0, maxLength)}...`
    : entry.positivePrompt || '(空のプロンプト)';

  return `${dateStr} | ${promptPreview}`;
};

/**
 * 2つの履歴エントリが同じ内容かどうかを判定するユーティリティ関数
 * 
 * @param entry1 - 比較する履歴エントリ1
 * @param entry2 - 比較する履歴エントリ2
 * @returns 同じ内容の場合はtrue
 * 
 * @example
 * ```tsx
 * if (isSameHistoryEntry(currentEntry, lastSavedEntry)) {
 *   console.log('既に保存済みの内容です');
 * }
 * ```
 */
export const isSameHistoryEntry = (
  entry1: HistoryEntry,
  entry2: HistoryEntry
): boolean => {
  return (
    entry1.positivePrompt === entry2.positivePrompt &&
    entry1.negativePrompt === entry2.negativePrompt
  );
};

/**
 * 履歴エントリを検索するユーティリティ関数
 * 
 * @param historyList - 検索対象の履歴リスト
 * @param searchTerm - 検索キーワード
 * @returns 検索結果の履歴エントリリスト
 * 
 * @example
 * ```tsx
 * const results = searchHistory(historyList, 'landscape');
 * ```
 */
export const searchHistory = (
  historyList: readonly HistoryEntry[],
  searchTerm: string
): HistoryEntry[] => {
  if (!searchTerm.trim()) {
    return [...historyList];
  }

  const lowerSearchTerm = searchTerm.toLowerCase();

  return historyList.filter((entry) => {
    const positiveMatch = entry.positivePrompt
      .toLowerCase()
      .includes(lowerSearchTerm);
    const negativeMatch = entry.negativePrompt
      .toLowerCase()
      .includes(lowerSearchTerm);

    return positiveMatch || negativeMatch;
  });
};
```

## 使用例: `src/components/HistoryPanel.tsx`

```typescript
import React, { useState } from 'react';
import { useHistory, formatHistoryEntry } from '../hooks/useHistory';
import { usePromptContext } from '../contexts/PromptContext';

/**
 * 履歴パネルコンポーネント
 * 保存された履歴の一覧表示と操作機能を提供
 */
const HistoryPanel: React.FC = () => {
  const { promptState } = usePromptContext();
  const {
    historyList,
    isLoading,
    saveHistory,
    deleteHistory,
    applyHistory
  } = useHistory();

  const [isSaving, setIsSaving] = useState(false);

  /**
   * 現在のプロンプトを履歴に保存
   */
  const handleSave = async (): Promise<void> => {
    setIsSaving(true);
    try {
      await saveHistory(promptState);
      alert('履歴に保存しました');
    } catch (error) {
      alert('保存に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * 履歴エントリを削除
   */
  const handleDelete = async (id: string): Promise<void> => {
    if (window.confirm('この履歴を削除しますか？')) {
      try {
        await deleteHistory(id);
      } catch (error) {
        alert('削除に失敗しました');
      }
    }
  };

  /**
   * 履歴をエディタに適用
   */
  const handleApply = (entry: HistoryEntry): void => {
    try {
      applyHistory(entry);
      alert('履歴を適用しました');
    } catch (error) {
      alert('適用に失敗しました');
    }
  };

  if (isLoading) {
    return <div>履歴を読み込み中...</div>;
  }

  return (
    <div className="history-panel">
      <div className="history-header">
        <h3>履歴</h3>
        <button
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? '保存中...' : '現在のプロンプトを保存'}
        </button>
      </div>

      <div className="history-list">
        {historyList.length === 0 ? (
          <p>履歴がありません</p>
        ) : (
          historyList.map((entry) => (
            <div key={entry.id} className="history-item">
              <div className="history-info">
                {formatHistoryEntry(entry)}
              </div>
              <div className="history-actions">
                <button onClick={() => handleApply(entry)}>
                  適用
                </button>
                <button onClick={() => handleDelete(entry.id)}>
                  削除
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HistoryPanel;
```

## 主な実装ポイント

### 1. **履歴の管理**
- 新しい履歴を先頭に追加（降順ソート）
- 最大件数を超えたら古い履歴を自動削除
- 空のプロンプトは保存しない

### 2. **一意なID生成**
- タイムスタンプとランダム文字列を組み合わせ
- 衝突の可能性を最小化

### 3. **エラーハンドリング**
- すべての非同期操作でtry-catchを使用
- エラー時は適切なメッセージをthrow

### 4. **パフォーマンス最適化**
- `useCallback` でメモ化し、不要な再レンダリングを防止
- 履歴の読み込みは初回マウント時のみ実行

### 5. **ユーティリティ関数**
- `formatHistoryEntry`: 表示用のフォーマット
- `isSameHistoryEntry`: 重複チェック
- `searchHistory`: 履歴の検索機能

### 6. **型安全性**
- すべての関数に明示的な型定義
- `readonly` で不変性を保証

この実装により、ユーザーは過去のプロンプトを簡単に保存・復元・管理できるようになります。
---
# ステップ3-6: 履歴パネルコンポーネント実装

## `src/components/HistoryPanel.tsx`

```typescript
import React, { useState, useCallback, useMemo } from 'react';
import { useHistory, formatHistoryEntry, searchHistory } from '../hooks/useHistory';
import { usePromptContext } from '../contexts/PromptContext';
import type { HistoryEntry } from '../types';
import styles from './HistoryPanel.module.css';

/**
 * 履歴パネルコンポーネント
 * 
 * プロンプトの履歴を表示・管理するサイドパネル用コンポーネント
 * - 現在のプロンプトの保存
 * - 履歴の検索
 * - 履歴の適用・削除
 */
const HistoryPanel: React.FC = () => {
  const { promptState } = usePromptContext();
  const {
    historyList,
    isLoading,
    saveHistory,
    deleteHistory,
    applyHistory
  } = useHistory();

  // 検索キーワードの状態
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // 保存処理中フラグ
  const [isSaving, setIsSaving] = useState<boolean>(false);
  
  // 削除処理中のエントリID
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // 適用処理中のエントリID
  const [applyingId, setApplyingId] = useState<string | null>(null);

  /**
   * 検索結果の履歴リストを計算
   */
  const filteredHistoryList = useMemo(() => {
    return searchHistory(historyList, searchTerm);
  }, [historyList, searchTerm]);

  /**
   * 現在のプロンプトを履歴に保存
   */
  const handleSave = useCallback(async (): Promise<void> => {
    // 空のプロンプトチェック
    if (!promptState.positivePrompt.trim() && !promptState.negativePrompt.trim()) {
      alert('保存するプロンプトが空です。\nキーワードを選択するか、プロンプトを入力してください。');
      return;
    }

    setIsSaving(true);

    try {
      await saveHistory(promptState);
      
      // 検索をクリアして新しい履歴を表示
      setSearchTerm('');
      
      // 成功フィードバック（控えめに）
      console.log('履歴に保存しました');
    } catch (error) {
      console.error('Save history error:', error);
      alert('履歴の保存に失敗しました。\nもう一度お試しください。');
    } finally {
      setIsSaving(false);
    }
  }, [promptState, saveHistory]);

  /**
   * 履歴エントリを削除
   */
  const handleDelete = useCallback(async (
    entry: HistoryEntry,
    event: React.MouseEvent
  ): Promise<void> => {
    // イベントの伝播を停止（親要素のクリックイベントを防ぐ）
    event.stopPropagation();

    // 確認ダイアログ
    const confirmed = window.confirm(
      '以下の履歴を削除しますか？\n\n' +
      `日時: ${new Date(entry.timestamp).toLocaleString('ja-JP')}\n` +
      `プロンプト: ${entry.positivePrompt.substring(0, 50)}${entry.positivePrompt.length > 50 ? '...' : ''}\n\n` +
      'この操作は取り消せません。'
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(entry.id);

    try {
      await deleteHistory(entry.id);
      console.log('履歴を削除しました');
    } catch (error) {
      console.error('Delete history error:', error);
      alert('履歴の削除に失敗しました。\nもう一度お試しください。');
    } finally {
      setDeletingId(null);
    }
  }, [deleteHistory]);

  /**
   * 履歴をエディタに適用
   */
  const handleApply = useCallback(async (
    entry: HistoryEntry,
    event: React.MouseEvent
  ): Promise<void> => {
    // イベントの伝播を停止
    event.stopPropagation();

    setApplyingId(entry.id);

    try {
      applyHistory(entry);
      console.log('履歴を適用しました');
      
      // 視覚的フィードバック用の短い遅延
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error) {
      console.error('Apply history error:', error);
      alert('履歴の適用に失敗しました。\nもう一度お試しください。');
    } finally {
      setApplyingId(null);
    }
  }, [applyHistory]);

  /**
   * 検索バーの変更ハンドラ
   */
  const handleSearchChange = useCallback((
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setSearchTerm(event.target.value);
  }, []);

  /**
   * 検索バーのクリアハンドラ
   */
  const handleSearchClear = useCallback((): void => {
    setSearchTerm('');
  }, []);

  /**
   * 履歴アイテムの詳細を表示（クリック時）
   */
  const handleItemClick = useCallback((entry: HistoryEntry): void => {
    // 詳細情報をコンソールに出力（デバッグ用）
    console.log('History entry details:', {
      id: entry.id,
      timestamp: entry.timestamp,
      positivePrompt: entry.positivePrompt,
      negativePrompt: entry.negativePrompt
    });
  }, []);

  return (
    <div className={styles.historyPanel}>
      {/* ヘッダー */}
      <header className={styles.header}>
        <h2 className={styles.title}>
          <span className={styles.titleIcon}>📚</span>
          履歴
        </h2>
        
        {/* 保存ボタン */}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={styles.saveButton}
          type="button"
          aria-label="現在のプロンプトを履歴に保存"
        >
          {isSaving ? (
            <>
              <span className={styles.spinner} />
              保存中...
            </>
          ) : (
            <>
              <span className={styles.buttonIcon}>💾</span>
              保存
            </>
          )}
        </button>
      </header>

      {/* 検索バー */}
      <div className={styles.searchBar}>
        <div className={styles.searchInputWrapper}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="履歴を検索..."
            className={styles.searchInput}
            aria-label="履歴を検索"
          />
          {searchTerm && (
            <button
              onClick={handleSearchClear}
              className={styles.searchClearButton}
              type="button"
              aria-label="検索をクリア"
            >
              ✕
            </button>
          )}
        </div>
        
        {/* 検索結果の件数表示 */}
        {searchTerm && (
          <div className={styles.searchResultCount}>
            {filteredHistoryList.length}件の結果
          </div>
        )}
      </div>

      {/* 履歴リスト */}
      <div className={styles.listContainer}>
        {isLoading ? (
          // ローディング表示
          <div className={styles.loadingState}>
            <div className={styles.loadingSpinner} />
            <p className={styles.loadingText}>履歴を読み込み中...</p>
          </div>
        ) : filteredHistoryList.length === 0 ? (
          // 空の状態
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>📭</span>
            <p className={styles.emptyText}>
              {searchTerm ? '検索結果がありません' : '履歴がありません'}
            </p>
            {!searchTerm && (
              <p className={styles.emptyHint}>
                「保存」ボタンで現在のプロンプトを保存できます
              </p>
            )}
          </div>
        ) : (
          // 履歴リスト
          <ul className={styles.historyList} role="list">
            {filteredHistoryList.map((entry) => (
              <li
                key={entry.id}
                className={styles.historyItem}
                onClick={() => handleItemClick(entry)}
              >
                {/* 履歴情報 */}
                <div className={styles.historyInfo}>
                  <div className={styles.historyPreview}>
                    {formatHistoryEntry(entry, 60)}
                  </div>
                  
                  {/* ネガティブプロンプトがある場合は表示 */}
                  {entry.negativePrompt && (
                    <div className={styles.historyNegative}>
                      <span className={styles.negativeLabel}>除外:</span>
                      <span className={styles.negativeText}>
                        {entry.negativePrompt.length > 40
                          ? `${entry.negativePrompt.substring(0, 40)}...`
                          : entry.negativePrompt}
                      </span>
                    </div>
                  )}
                </div>

                {/* アクションボタン */}
                <div className={styles.historyActions}>
                  {/* 適用ボタン */}
                  <button
                    onClick={(e) => handleApply(entry, e)}
                    disabled={applyingId === entry.id}
                    className={`${styles.actionButton} ${styles.applyButton}`}
                    type="button"
                    aria-label="この履歴を適用"
                  >
                    {applyingId === entry.id ? (
                      <span className={styles.smallSpinner} />
                    ) : (
                      '✓'
                    )}
                  </button>

                  {/* 削除ボタン */}
                  <button
                    onClick={(e) => handleDelete(entry, e)}
                    disabled={deletingId === entry.id}
                    className={`${styles.actionButton} ${styles.deleteButton}`}
                    type="button"
                    aria-label="この履歴を削除"
                  >
                    {deletingId === entry.id ? (
                      <span className={styles.smallSpinner} />
                    ) : (
                      '🗑'
                    )}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* フッター（統計情報） */}
      {!isLoading && historyList.length > 0 && (
        <footer className={styles.footer}>
          <span className={styles.footerText}>
            全{historyList.length}件の履歴
          </span>
        </footer>
      )}
    </div>
  );
};

export default HistoryPanel;
```

## `src/components/HistoryPanel.module.css`

```css
/**
 * HistoryPanel コンポーネントのスタイル
 * サイドパネル用の縦長レイアウトに最適化
 */

.historyPanel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #ffffff;
  color: #1f2937;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

/* ========================================
   ヘッダー
   ======================================== */

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  background-color: #f9fafb;
  flex-shrink: 0;
}

.title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
}

.titleIcon {
  font-size: 1.25rem;
}

/* ========================================
   保存ボタン
   ======================================== */

.saveButton {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.875rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #ffffff;
  background-color: #3b82f6;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.saveButton:hover:not(:disabled) {
  background-color: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
}

.saveButton:active:not(:disabled) {
  transform: translateY(0);
}

.saveButton:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.buttonIcon {
  font-size: 1rem;
}

/* ========================================
   検索バー
   ======================================== */

.searchBar {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e5e7eb;
  background-color: #ffffff;
  flex-shrink: 0;
}

.searchInputWrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.searchIcon {
  position: absolute;
  left: 0.75rem;
  font-size: 1rem;
  color: #9ca3af;
  pointer-events: none;
}

.searchInput {
  width: 100%;
  padding: 0.5rem 2rem 0.5rem 2.25rem;
  font-size: 0.875rem;
  color: #1f2937;
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  transition: all 0.2s;
}

.searchInput:focus {
  outline: none;
  background-color: #ffffff;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.searchInput::placeholder {
  color: #9ca3af;
}

.searchClearButton {
  position: absolute;
  right: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  font-size: 0.875rem;
  color: #6b7280;
  background-color: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.searchClearButton:hover {
  color: #1f2937;
  background-color: #e5e7eb;
}

.searchResultCount {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: #6b7280;
  text-align: right;
}

/* ========================================
   リストコンテナ
   ======================================== */

.listContainer {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  background-color: #ffffff;
}

/* カスタムスクロールバー */
.listContainer::-webkit-scrollbar {
  width: 8px;
}

.listContainer::-webkit-scrollbar-track {
  background-color: #f9fafb;
}

.listContainer::-webkit-scrollbar-thumb {
  background-color: #d1d5db;
  border-radius: 4px;
}

.listContainer::-webkit-scrollbar-thumb:hover {
  background-color: #9ca3af;
}

/* ========================================
   履歴リスト
   ======================================== */

.historyList {
  margin: 0;
  padding: 0;
  list-style: none;
}

.historyItem {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
  transition: background-color 0.15s;
}

.historyItem:hover {
  background-color: #f9fafb;
}

.historyItem:active {
  background-color: #f3f4f6;
}

/* ========================================
   履歴情報
   ======================================== */

.historyInfo {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.historyPreview {
  font-size: 0.8125rem;
  line-height: 1.4;
  color: #1f2937;
  word-break: break-word;
  overflow-wrap: break-word;
}

.historyNegative {
  display: flex;
  gap: 0.375rem;
  font-size: 0.75rem;
  color: #6b7280;
}

.negativeLabel {
  font-weight: 600;
  flex-shrink: 0;
}

.negativeText {
  word-break: break-word;
  overflow-wrap: break-word;
}

/* ========================================
   アクションボタン
   ======================================== */

.historyActions {
  display: flex;
  gap: 0.375rem;
  flex-shrink: 0;
}

.actionButton {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  font-size: 1rem;
  background-color: transparent;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.actionButton:hover:not(:disabled) {
  transform: scale(1.05);
}

.actionButton:active:not(:disabled) {
  transform: scale(0.95);
}

.actionButton:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.applyButton {
  color: #059669;
  border-color: #d1fae5;
  background-color: #ecfdf5;
}

.applyButton:hover:not(:disabled) {
  background-color: #d1fae5;
  border-color: #a7f3d0;
}

.deleteButton {
  color: #dc2626;
  border-color: #fecaca;
  background-color: #fef2f2;
}

.deleteButton:hover:not(:disabled) {
  background-color: #fee2e2;
  border-color: #fca5a5;
}

/* ========================================
   空の状態
   ======================================== */

.emptyState {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
  text-align: center;
}

.emptyIcon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.emptyText {
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
}

.emptyHint {
  margin: 0;
  font-size: 0.75rem;
  color: #9ca3af;
  max-width: 200px;
}

/* ========================================
   ローディング状態
   ======================================== */

.loadingState {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
}

.loadingSpinner {
  width: 2.5rem;
  height: 2.5rem;
  border: 3px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.loadingText {
  margin: 1rem 0 0 0;
  font-size: 0.875rem;
  color: #6b7280;
}

/* ========================================
   スピナー（小）
   ======================================== */

.spinner,
.smallSpinner {
  display: inline-block;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

.spinner {
  width: 1rem;
  height: 1rem;
}

.smallSpinner {
  width: 0.875rem;
  height: 0.875rem;
  border-width: 2px;
  border-color: rgba(0, 0, 0, 0.2);
  border-top-color: currentColor;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ========================================
   フッター
   ======================================== */

.footer {
  padding: 0.75rem 1rem;
  border-top: 1px solid #e5e7eb;
  background-color: #f9fafb;
  flex-shrink: 0;
}

.footerText {
  font-size: 0.75rem;
  color: #6b7280;
}

/* ========================================
   ダークモード対応
   ======================================== */

@media (prefers-color-scheme: dark) {
  .historyPanel {
    background-color: #1f2937;
    color: #f3f4f6;
  }

  .header {
    background-color: #111827;
    border-bottom-color: #374151;
  }

  .title {
    color: #f9fafb;
  }

  .saveButton {
    background-color: #2563eb;
  }

  .saveButton:hover:not(:disabled) {
    background-color: #1d4ed8;
  }

  .searchBar {
    background-color: #1f2937;
    border-bottom-color: #374151;
  }

  .searchInput {
    background-color: #111827;
    border-color: #374151;
    color: #f3f4f6;
  }

  .searchInput:focus {
    background-color: #1f2937;
    border-color: #3b82f6;
  }

  .searchClearButton:hover {
    background-color: #374151;
    color: #f3f4f6;
  }

  .listContainer {
    background-color: #1f2937;
  }

  .listContainer::-webkit-scrollbar-track {
    background-color: #111827;
  }

  .listContainer::-webkit-scrollbar-thumb {
    background-color: #4b5563;
  }

  .listContainer::-webkit-scrollbar-thumb:hover {
    background-color: #6b7280;
  }

  .historyItem {
    border-bottom-color: #374151;
  }

  .historyItem:hover {
    background-color: #111827;
  }

  .historyItem:active {
    background-color: #0f172a;
  }

  .historyPreview {
    color: #f3f4f6;
  }

  .historyNegative {
    color: #9ca3af;
  }

  .actionButton {
    border-color: #374151;
  }

  .applyButton {
    background-color: rgba(5, 150, 105, 0.1);
    border-color: rgba(5, 150, 105, 0.3);
  }

  .applyButton:hover:not(:disabled) {
    background-color: rgba(5, 150, 105, 0.2);
  }

  .deleteButton {
    background-color: rgba(220, 38, 38, 0.1);
    border-color: rgba(220, 38, 38, 0.3);
  }

  .deleteButton:hover:not(:disabled) {
    background-color: rgba(220, 38, 38, 0.2);
  }

  .footer {
    background-color: #111827;
    border-top-color: #374151;
  }
}

/* ========================================
   コンパクトモード（狭い幅用）
   ======================================== */

@media (max-width: 360px) {
  .header {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }

  .saveButton {
    width: 100%;
    justify-content: center;
  }

  .historyPreview {
    font-size: 0.75rem;
  }

  .historyNegative {
    font-size: 0.6875rem;
  }

  .actionButton {
    width: 1.75rem;
    height: 1.75rem;
    font-size: 0.875rem;
  }
}
```

## 主な実装ポイント

### 1. **サイドパネル最適化**
- 縦長レイアウトに最適化された設計
- スクロール可能なリストエリア
- 固定ヘッダー・フッター

### 2. **検索機能**
- リアルタイム検索
- 検索結果件数の表示
- クリアボタン付き

### 3. **ユーザビリティ**
- ホバーエフェクト
- ローディング状態の表示
- 処理中のボタン無効化
- 確認ダイアログ

### 4. **レスポンシブデザイン**
- ダークモード完全対応
- 狭い幅（360px以下）でのコンパクト表示
- カスタムスクロールバー

### 5. **アクセシビリティ**
- `aria-label` で操作の説明
- `role="list"` でリスト構造を明示
- キーボード操作対応

### 6. **パフォーマンス**
- `useMemo` で検索結果をメモ化
- `useCallback` でイベントハンドラをメモ化
- 不要な再レンダリングを防止

### 7. **視覚的フィードバック**
- ボタンのホバー・アクティブ状態
- スピナーアニメーション
- スムーズなトランジション

このコンポーネントにより、ブラウザ拡張機能のサイドパネルで快適に履歴を管理できます。
---
# ステップ4-1: メインアプリケーションレイアウト実装

## `src/App.tsx`

```typescript
import React, { useState, useCallback } from 'react';
import { PromptProvider } from './contexts/PromptContext';
import PromptEditor from './components/PromptEditor';
import KeywordSelector from './components/KeywordSelector';
import HistoryPanel from './components/HistoryPanel';
import styles from './App.module.css';

/**
 * タブの種類を定義
 */
type TabType = 'keywords' | 'history';

/**
 * タブの設定情報
 */
interface TabConfig {
  id: TabType;
  label: string;
  icon: string;
  ariaLabel: string;
}

/**
 * タブの設定配列
 */
const TABS: readonly TabConfig[] = [
  {
    id: 'keywords',
    label: 'キーワード',
    icon: '🏷️',
    ariaLabel: 'キーワード選択タブ'
  },
  {
    id: 'history',
    label: '履歴',
    icon: '📚',
    ariaLabel: '履歴管理タブ'
  }
] as const;

/**
 * アプリケーションのメインコンポーネント（内部実装）
 * タブの状態管理とレイアウトを担当
 */
const AppContent: React.FC = () => {
  // アクティブなタブの状態
  const [activeTab, setActiveTab] = useState<TabType>('keywords');

  /**
   * タブ切り替えハンドラ
   */
  const handleTabChange = useCallback((tabId: TabType): void => {
    setActiveTab(tabId);
  }, []);

  /**
   * キーボードでのタブ切り替え（矢印キー対応）
   */
  const handleTabKeyDown = useCallback((
    event: React.KeyboardEvent,
    tabId: TabType,
    index: number
  ): void => {
    if (event.key === 'ArrowLeft' && index > 0) {
      // 左矢印: 前のタブへ
      event.preventDefault();
      setActiveTab(TABS[index - 1].id);
    } else if (event.key === 'ArrowRight' && index < TABS.length - 1) {
      // 右矢印: 次のタブへ
      event.preventDefault();
      setActiveTab(TABS[index + 1].id);
    }
  }, []);

  return (
    <div className={styles.app}>
      {/* ヘッダー */}
      <header className={styles.header}>
        <h1 className={styles.appTitle}>
          <span className={styles.appIcon}>✨</span>
          プロンプトビルダー
        </h1>
        <p className={styles.appSubtitle}>
          画像生成AIのためのプロンプト作成ツール
        </p>
      </header>

      {/* メインコンテンツエリア */}
      <main className={styles.main}>
        {/* 上部: プロンプトエディタ */}
        <section className={styles.editorSection} aria-label="プロンプトエディタ">
          <PromptEditor />
        </section>

        {/* 下部: タブ付きパネル */}
        <section className={styles.tabSection} aria-label="キーワードと履歴">
          {/* タブヘッダー */}
          <div className={styles.tabHeader} role="tablist" aria-label="パネル切り替え">
            {TABS.map((tab, index) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`panel-${tab.id}`}
                aria-label={tab.ariaLabel}
                id={`tab-${tab.id}`}
                className={`${styles.tab} ${
                  activeTab === tab.id ? styles.tabActive : ''
                }`}
                onClick={() => handleTabChange(tab.id)}
                onKeyDown={(e) => handleTabKeyDown(e, tab.id, index)}
                tabIndex={activeTab === tab.id ? 0 : -1}
              >
                <span className={styles.tabIcon}>{tab.icon}</span>
                <span className={styles.tabLabel}>{tab.label}</span>
                {activeTab === tab.id && (
                  <span className={styles.tabIndicator} aria-hidden="true" />
                )}
              </button>
            ))}
          </div>

          {/* タブコンテンツ */}
          <div className={styles.tabContent}>
            {/* キーワードパネル */}
            <div
              id="panel-keywords"
              role="tabpanel"
              aria-labelledby="tab-keywords"
              aria-hidden={activeTab !== 'keywords'}
              className={`${styles.tabPanel} ${
                activeTab === 'keywords' ? styles.tabPanelActive : ''
              }`}
            >
              {activeTab === 'keywords' && <KeywordSelector />}
            </div>

            {/* 履歴パネル */}
            <div
              id="panel-history"
              role="tabpanel"
              aria-labelledby="tab-history"
              aria-hidden={activeTab !== 'history'}
              className={`${styles.tabPanel} ${
                activeTab === 'history' ? styles.tabPanelActive : ''
              }`}
            >
              {activeTab === 'history' && <HistoryPanel />}
            </div>
          </div>
        </section>
      </main>

      {/* フッター */}
      <footer className={styles.footer}>
        <p className={styles.footerText}>
          <span className={styles.footerIcon}>💡</span>
          キーワードを選択してプロンプトを作成しよう
        </p>
      </footer>
    </div>
  );
};

/**
 * アプリケーションのルートコンポーネント
 * PromptProviderでラップして状態管理を提供
 */
const App: React.FC = () => {
  return (
    <PromptProvider>
      <AppContent />
    </PromptProvider>
  );
};

export default App;
```

## `src/App.module.css`

```css
/**
 * App コンポーネントのメインスタイル
 * ブラウザ拡張機能のサイドパネル用に最適化
 */

/* ========================================
   グローバル設定
   ======================================== */

:root {
  /* カラーパレット（ライトモード） */
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f9fafb;
  --color-bg-tertiary: #f3f4f6;
  --color-text-primary: #111827;
  --color-text-secondary: #6b7280;
  --color-text-tertiary: #9ca3af;
  --color-border: #e5e7eb;
  --color-border-light: #f3f4f6;
  --color-accent: #3b82f6;
  --color-accent-hover: #2563eb;
  --color-accent-light: rgba(59, 130, 246, 0.1);
  
  /* 影 */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  
  /* トランジション */
  --transition-fast: 0.15s ease;
  --transition-normal: 0.2s ease;
  --transition-slow: 0.3s ease;
  
  /* レイアウト */
  --header-height: 5rem;
  --footer-height: 3rem;
  --tab-header-height: 3rem;
}

/* ========================================
   メインコンテナ
   ======================================== */

.app {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  background-color: var(--color-bg-secondary);
  color: var(--color-text-primary);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 
               'Helvetica Neue', Arial, sans-serif;
  overflow: hidden;
}

/* ========================================
   ヘッダー
   ======================================== */

.header {
  flex-shrink: 0;
  height: var(--header-height);
  padding: 1rem 1.25rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  box-shadow: var(--shadow-md);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.appTitle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 0.25rem 0;
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.appIcon {
  font-size: 1.5rem;
  animation: sparkle 2s ease-in-out infinite;
}

@keyframes sparkle {
  0%, 100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
  50% {
    transform: scale(1.1) rotate(5deg);
    opacity: 0.8;
  }
}

.appSubtitle {
  margin: 0;
  font-size: 0.75rem;
  font-weight: 400;
  opacity: 0.9;
  letter-spacing: 0.01em;
}

/* ========================================
   メインコンテンツ
   ======================================== */

.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: var(--color-bg-secondary);
}

/* ========================================
   エディタセクション
   ======================================== */

.editorSection {
  flex-shrink: 0;
  background-color: var(--color-bg-primary);
  border-bottom: 2px solid var(--color-border);
  box-shadow: var(--shadow-sm);
}

/* ========================================
   タブセクション
   ======================================== */

.tabSection {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: var(--color-bg-primary);
}

/* ========================================
   タブヘッダー
   ======================================== */

.tabHeader {
  display: flex;
  height: var(--tab-header-height);
  background-color: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
  position: relative;
}

.tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  background-color: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: all var(--transition-normal);
  position: relative;
  user-select: none;
}

.tab:hover:not(.tabActive) {
  color: var(--color-text-primary);
  background-color: var(--color-bg-tertiary);
}

.tab:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: -2px;
  z-index: 1;
}

.tabActive {
  color: var(--color-accent);
  background-color: var(--color-bg-primary);
  font-weight: 600;
}

.tabIcon {
  font-size: 1.125rem;
  transition: transform var(--transition-normal);
}

.tab:hover .tabIcon {
  transform: scale(1.1);
}

.tabActive .tabIcon {
  animation: bounce 0.5s ease;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
}

.tabLabel {
  font-weight: inherit;
}

.tabIndicator {
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background-color: var(--color-accent);
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
}

/* ========================================
   タブコンテンツ
   ======================================== */

.tabContent {
  flex: 1;
  position: relative;
  overflow: hidden;
  background-color: var(--color-bg-primary);
}

.tabPanel {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0;
  visibility: hidden;
  transform: translateY(10px);
  transition: opacity var(--transition-normal),
              transform var(--transition-normal),
              visibility 0s var(--transition-normal);
  overflow: hidden;
}

.tabPanelActive {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
  transition: opacity var(--transition-normal),
              transform var(--transition-normal),
              visibility 0s 0s;
}

/* ========================================
   フッター
   ======================================== */

.footer {
  flex-shrink: 0;
  height: var(--footer-height);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1rem;
  background-color: var(--color-bg-secondary);
  border-top: 1px solid var(--color-border);
}

.footerText {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  text-align: center;
}

.footerIcon {
  font-size: 1rem;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

/* ========================================
   ダークモード対応
   ======================================== */

@media (prefers-color-scheme: dark) {
  :root {
    --color-bg-primary: #1f2937;
    --color-bg-secondary: #111827;
    --color-bg-tertiary: #374151;
    --color-text-primary: #f9fafb;
    --color-text-secondary: #9ca3af;
    --color-text-tertiary: #6b7280;
    --color-border: #374151;
    --color-border-light: #4b5563;
    --color-accent: #3b82f6;
    --color-accent-hover: #60a5fa;
    --color-accent-light: rgba(59, 130, 246, 0.15);
    
    --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
    --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.4);
    --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.5);
  }

  .header {
    background: linear-gradient(135deg, #4c1d95 0%, #5b21b6 100%);
  }

  .tab:hover:not(.tabActive) {
    background-color: var(--color-bg-tertiary);
  }
}

/* ========================================
   レスポンシブ調整
   ======================================== */

/* 非常に狭い幅（300px以下） */
@media (max-width: 300px) {
  .header {
    height: 4.5rem;
    padding: 0.75rem 1rem;
  }

  .appTitle {
    font-size: 1.125rem;
  }

  .appIcon {
    font-size: 1.25rem;
  }

  .appSubtitle {
    font-size: 0.6875rem;
  }

  .tabHeader {
    height: 2.75rem;
  }

  .tab {
    padding: 0.5rem 0.75rem;
    font-size: 0.8125rem;
  }

  .tabIcon {
    font-size: 1rem;
  }

  .footer {
    height: 2.5rem;
  }

  .footerText {
    font-size: 0.6875rem;
  }
}

/* 中程度の幅（360px以上） */
@media (min-width: 360px) {
  .header {
    padding: 1.25rem 1.5rem;
  }

  .appTitle {
    font-size: 1.375rem;
  }

  .tab {
    gap: 0.625rem;
  }
}

/* 広い幅（480px以上） */
@media (min-width: 480px) {
  .header {
    height: 5.5rem;
    padding: 1.5rem 2rem;
  }

  .appTitle {
    font-size: 1.5rem;
  }

  .appSubtitle {
    font-size: 0.8125rem;
  }

  .tabHeader {
    height: 3.5rem;
  }

  .tab {
    font-size: 0.9375rem;
    padding: 1rem 1.25rem;
  }

  .footer {
    height: 3.5rem;
  }

  .footerText {
    font-size: 0.8125rem;
  }
}

/* ========================================
   アクセシビリティ: 動きを減らす設定
   ======================================== */

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  .appIcon,
  .footerIcon {
    animation: none;
  }
}

/* ========================================
   印刷用スタイル
   ======================================== */

@media print {
  .header,
  .footer,
  .tabHeader {
    display: none;
  }

  .app {
    height: auto;
  }

  .main {
    overflow: visible;
  }

  .tabPanel {
    position: static;
    opacity: 1 !important;
    visibility: visible !important;
    transform: none !important;
  }
}

/* ========================================
   高コントラストモード対応
   ======================================== */

@media (prefers-contrast: high) {
  .tab {
    border: 1px solid var(--color-border);
  }

  .tabActive {
    border-color: var(--color-accent);
    border-width: 2px;
  }

  .header {
    background: var(--color-accent);
  }
}

/* ========================================
   カスタムスクロールバー（Webkit）
   ======================================== */

.tabContent::-webkit-scrollbar {
  width: 8px;
}

.tabContent::-webkit-scrollbar-track {
  background-color: var(--color-bg-secondary);
}

.tabContent::-webkit-scrollbar-thumb {
  background-color: var(--color-border);
  border-radius: 4px;
}

.tabContent::-webkit-scrollbar-thumb:hover {
  background-color: var(--color-text-tertiary);
}
```

## 主な改善ポイント

### 1. **視認性の向上**
- **グラデーションヘッダー**: 目を引く紫系のグラデーション
- **アニメーション**: アイコンの sparkle と bounce 効果
- **明確なタブ切り替え**: アクティブタブに下線インジケーター
- **カラーパレット**: CSS変数で統一された配色

### 2. **使いやすさの改善**
- **キーボード操作**: 矢印キーでタブ切り替え可能
- **ホバーフィードバック**: すべてのインタラクティブ要素に反応
- **スムーズなトランジション**: タブ切り替え時のフェードイン効果
- **フォーカス表示**: キーボードナビゲーション時の明確な表示

### 3. **アクセシビリティ**
- **ARIA属性**: 完全なスクリーンリーダー対応
- **role属性**: セマンティックなHTML構造
- **キーボードナビゲーション**: tabindexの適切な管理
- **動きを減らす設定**: prefers-reduced-motion対応

### 4. **レスポンシブ対応**
- **300px〜480px+**: 3段階のブレークポイント
- **ダークモード**: 完全対応
- **高コントラストモード**: アクセシビリティ強化
- **印刷対応**: 必要な情報のみ表示

### 5. **パフォーマンス最適化**
- **条件付きレンダリング**: 非アクティブなタブは表示しない
- **CSS変数**: 再計算を最小化
- **useCallback**: イベントハンドラのメモ化

### 6. **デザインの工夫**
- **視覚的階層**: ヘッダー → エディタ → タブ → フッター
- **適切な余白**: 情報の詰め込みすぎを防止
- **一貫性**: すべてのコンポーネントで統一されたデザイン言語

このレイアウトにより、ブラウザ拡張機能のサイドパネルとして最適な使用体験を提供できます！
---
# ステップ5-1: Chrome拡張機能起動ファイル群の作成

## 1. `sidepanel.html`

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="画像生成AIのためのプロンプト作成ツール">
  <title>プロンプトビルダー</title>
  
  <!-- ファビコン（オプション） -->
  <link rel="icon" type="image/svg+xml" href="/icon.svg">
  
  <!-- グローバルスタイルのリセット -->
  <style>
    /* 基本的なリセット */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    html, body {
      width: 100%;
      height: 100%;
      overflow: hidden;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 
                   'Helvetica Neue', Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      background-color: #f9fafb;
      color: #1f2937;
    }

    /* ダークモード対応 */
    @media (prefers-color-scheme: dark) {
      body {
        background-color: #111827;
        color: #f9fafb;
      }
    }

    /* ルート要素 */
    #root {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    /* ローディング画面 */
    .loading-screen {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff;
    }

    .loading-spinner {
      width: 48px;
      height: 48px;
      border: 4px solid rgba(255, 255, 255, 0.3);
      border-top-color: #ffffff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    .loading-text {
      margin-top: 1.5rem;
      font-size: 1rem;
      font-weight: 500;
      opacity: 0.9;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    /* エラー画面 */
    .error-screen {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      padding: 2rem;
      text-align: center;
      background-color: #fef2f2;
      color: #991b1b;
    }

    @media (prefers-color-scheme: dark) {
      .error-screen {
        background-color: #7f1d1d;
        color: #fecaca;
      }
    }

    .error-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .error-title {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    .error-message {
      font-size: 0.875rem;
      opacity: 0.8;
    }
  </style>
</head>
<body>
  <!-- Reactアプリのマウントポイント -->
  <div id="root">
    <!-- 初期ローディング表示 -->
    <div class="loading-screen">
      <div class="loading-spinner"></div>
      <p class="loading-text">読み込み中...</p>
    </div>
  </div>

  <!-- Reactアプリケーションのエントリーポイント -->
  <script type="module" src="/src/sidepanel.tsx"></script>

  <!-- エラーハンドリング用スクリプト -->
  <script>
    // グローバルエラーハンドラ
    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error);
      showErrorScreen(event.error?.message || 'アプリケーションの読み込みに失敗しました');
    });

    // Promise拒否のハンドラ
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      showErrorScreen(event.reason?.message || '予期しないエラーが発生しました');
    });

    // エラー画面を表示する関数
    function showErrorScreen(message) {
      const root = document.getElementById('root');
      if (root) {
        root.innerHTML = `
          <div class="error-screen">
            <div class="error-icon">⚠️</div>
            <h1 class="error-title">エラーが発生しました</h1>
            <p class="error-message">${escapeHtml(message)}</p>
            <p class="error-message" style="margin-top: 1rem;">
              ページを再読み込みしてください
            </p>
          </div>
        `;
      }
    }

    // HTMLエスケープ関数
    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
  </script>
</body>
</html>
```

## 2. `src/sidepanel.tsx`

```typescript
/**
 * サイドパネル用Reactアプリケーションのエントリーポイント
 * 
 * このファイルは、Chrome拡張機能のサイドパネルとして
 * Reactアプリケーションを起動するための初期化処理を行います。
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css'; // グローバルスタイル（後述）

/**
 * アプリケーションの初期化と起動
 */
function initializeApp(): void {
  // ルート要素を取得
  const rootElement = document.getElementById('root');

  if (!rootElement) {
    console.error('Root element not found. Cannot mount React application.');
    return;
  }

  try {
    // React 18のcreateRootを使用してアプリケーションをマウント
    const root = createRoot(rootElement);

    // Appコンポーネントをレンダリング
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );

    console.log('✅ Prompt Builder application initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize application:', error);
    
    // エラー時のフォールバック表示
    rootElement.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        padding: 2rem;
        text-align: center;
        background-color: #fef2f2;
        color: #991b1b;
      ">
        <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
        <h1 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem;">
          アプリケーションの起動に失敗しました
        </h1>
        <p style="font-size: 0.875rem; opacity: 0.8;">
          ${error instanceof Error ? error.message : '不明なエラー'}
        </p>
        <button 
          onclick="window.location.reload()" 
          style="
            margin-top: 1.5rem;
            padding: 0.5rem 1rem;
            font-size: 0.875rem;
            color: white;
            background-color: #dc2626;
            border: none;
            border-radius: 6px;
            cursor: pointer;
          "
        >
          再読み込み
        </button>
      </div>
    `;
  }
}

/**
 * DOMContentLoadedイベントを待ってアプリケーションを初期化
 * 既にDOMが読み込まれている場合は即座に実行
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  // DOMが既に読み込まれている場合
  initializeApp();
}

/**
 * 開発環境でのホットモジュールリプレースメント（HMR）対応
 */
if (import.meta.hot) {
  import.meta.hot.accept();
  console.log('🔥 HMR enabled');
}
```

## 3. `src/index.css`

```css
/**
 * グローバルスタイル
 * アプリケーション全体に適用される基本的なスタイル定義
 */

/* ========================================
   リセットとベーススタイル
   ======================================== */

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  /* スムーズスクロール */
  scroll-behavior: smooth;
  
  /* テキストサイズの自動調整を防止（iOS Safari） */
  -webkit-text-size-adjust: 100%;
  
  /* タップハイライトを無効化（モバイル） */
  -webkit-tap-highlight-color: transparent;
}

body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 
               'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 
               'Helvetica Neue', sans-serif;
  font-size: 16px;
  line-height: 1.5;
  color: #1f2937;
  background-color: #f9fafb;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow: hidden;
}

/* ========================================
   フォント設定
   ======================================== */

code,
kbd,
samp,
pre {
  font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
  font-size: 0.875em;
}

/* ========================================
   フォーカススタイル
   ======================================== */

/* デフォルトのアウトラインを削除 */
*:focus {
  outline: none;
}

/* キーボードフォーカス時のみアウトラインを表示 */
*:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* ========================================
   選択テキストのスタイル
   ======================================== */

::selection {
  background-color: #bfdbfe;
  color: #1e40af;
}

::-moz-selection {
  background-color: #bfdbfe;
  color: #1e40af;
}

/* ========================================
   スクロールバーのスタイル（Webkit）
   ======================================== */

::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

::-webkit-scrollbar-track {
  background-color: #f3f4f6;
}

::-webkit-scrollbar-thumb {
  background-color: #d1d5db;
  border-radius: 5px;
  border: 2px solid #f3f4f6;
}

::-webkit-scrollbar-thumb:hover {
  background-color: #9ca3af;
}

/* ========================================
   ボタンのリセット
   ======================================== */

button {
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
  cursor: pointer;
  border: none;
  background: none;
  color: inherit;
}

button:disabled {
  cursor: not-allowed;
}

/* ========================================
   入力要素のリセット
   ======================================== */

input,
textarea,
select {
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
  color: inherit;
}

input:disabled,
textarea:disabled,
select:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

/* ========================================
   リンクのスタイル
   ======================================== */

a {
  color: #3b82f6;
  text-decoration: none;
  transition: color 0.2s ease;
}

a:hover {
  color: #2563eb;
  text-decoration: underline;
}

/* ========================================
   画像のスタイル
   ======================================== */

img,
svg {
  display: block;
  max-width: 100%;
  height: auto;
}

/* ========================================
   ダークモード対応
   ======================================== */

@media (prefers-color-scheme: dark) {
  body {
    color: #f9fafb;
    background-color: #111827;
  }

  ::selection {
    background-color: #1e40af;
    color: #bfdbfe;
  }

  ::-moz-selection {
    background-color: #1e40af;
    color: #bfdbfe;
  }

  ::-webkit-scrollbar-track {
    background-color: #1f2937;
  }

  ::-webkit-scrollbar-thumb {
    background-color: #4b5563;
    border-color: #1f2937;
  }

  ::-webkit-scrollbar-thumb:hover {
    background-color: #6b7280;
  }
}

/* ========================================
   アクセシビリティ: 動きを減らす設定
   ======================================== */

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* ========================================
   印刷用スタイル
   ======================================== */

@media print {
  body {
    background-color: white;
    color: black;
  }

  * {
    box-shadow: none !important;
    text-shadow: none !important;
  }
}

/* ========================================
   ユーティリティクラス
   ======================================== */

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.not-sr-only {
  position: static;
  width: auto;
  height: auto;
  padding: 0;
  margin: 0;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
```

## 4. `vite.config.ts`

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { crx } from '@crxjs/vite-plugin';
import manifest from './manifest.json';
import path from 'path';

/**
 * Vite設定ファイル
 * Chrome拡張機能（サイドパネル）用のビルド設定
 */
export default defineConfig({
  plugins: [
    // Reactプラグイン（Fast Refresh対応）
    react(),
    
    // Chrome拡張機能プラグイン
    crx({ manifest }),
  ],

  // 開発サーバーの設定
  server: {
    port: 5173,
    strictPort: true,
    hmr: {
      port: 5173,
    },
  },

  // ビルド設定
  build: {
    // 出力ディレクトリ
    outDir: 'dist',
    
    // ソースマップを生成（開発時のデバッグ用）
    sourcemap: process.env.NODE_ENV === 'development',
    
    // 最小化設定
    minify: process.env.NODE_ENV === 'production',
    
    // ロールアップオプション
    rollupOptions: {
      input: {
        // サイドパネルのエントリーポイント
        sidepanel: path.resolve(__dirname, 'sidepanel.html'),
      },
      output: {
        // チャンク分割の設定
        manualChunks: {
          // Reactライブラリを別チャンクに分離
          'react-vendor': ['react', 'react-dom'],
        },
      },
    },
    
    // チャンクサイズ警告の閾値（KB）
    chunkSizeWarningLimit: 1000,
  },

  // パスエイリアスの設定
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@contexts': path.resolve(__dirname, './src/contexts'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@types': path.resolve(__dirname, './src/types'),
      '@utils': path.resolve(__dirname, './src/utils'),
    },
  },

  // 最適化設定
  optimizeDeps: {
    include: ['react', 'react-dom'],
    exclude: [],
  },

  // CSS設定
  css: {
    modules: {
      // CSS Modulesの命名規則
      localsConvention: 'camelCase',
      // 生成されるクラス名のフォーマット
      generateScopedName:
        process.env.NODE_ENV === 'production'
          ? '[hash:base64:8]'
          : '[name]__[local]__[hash:base64:5]',
    },
    // PostCSS設定（必要に応じて）
    postcss: {},
  },

  // 環境変数の設定
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __DEV__: process.env.NODE_ENV === 'development',
  },

  // ログレベル
  logLevel: 'info',

  // クリアスクリーン（開発時）
  clearScreen: false,
});
```

## 5. `manifest.json` の確認

既存の `manifest.json` に以下の設定が含まれていることを確認してください：

```json
{
  "manifest_version": 3,
  "name": "Prompt Builder",
  "version": "1.0.0",
  "description": "画像生成AIのためのプロンプト作成ツール",
  "side_panel": {
    "default_path": "sidepanel.html"
  },
  "permissions": [
    "sidePanel",
    "storage"
  ],
  "action": {
    "default_title": "プロンプトビルダーを開く"
  },
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  }
}
```

## 6. `package.json` のスクリプト設定

```json
{
  "name": "prompt-builder",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@crxjs/vite-plugin": "^2.0.0-beta.21",
    "@types/chrome": "^0.0.254",
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@typescript-eslint/eslint-plugin": "^6.14.0",
    "@typescript-eslint/parser": "^6.14.0",
    "@vitejs/plugin-react": "^4.2.1",
    "eslint": "^8.55.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.5",
    "typescript": "^5.2.2",
    "vite": "^5.0.8"
  }
}
```

## 使用方法

### 開発モード
```bash
npm run dev
```

### ビルド
```bash
npm run build
```

### Chrome拡張機能として読み込み
1. `npm run build` を実行
2. Chromeで `chrome://extensions/` を開く
3. 「デベロッパーモード」を有効化
4. 「パッケージ化されていない拡張機能を読み込む」をクリック
5. `dist` フォルダを選択

## 主な特徴

### 1. **エラーハンドリング**
- グローバルエラーキャッチ
- Promise拒否のハンドリング
- ユーザーフレンドリーなエラー表示

### 2. **ローディング体験**
- 初期ローディング画面
- スムーズなトランジション

### 3. **開発者体験**
- HMR（ホットモジュールリプレースメント）対応
- ソースマップ生成
- TypeScript型チェック

### 4. **パフォーマンス最適化**
- コード分割
- チャンク最適化
- 依存関係の事前バンドル

### 5. **アクセシビリティ**
- セマンティックHTML
- キーボードナビゲーション対応
- スクリーンリーダー対応

これで、Chrome拡張機能として完全に動作するReactアプリケーションの起動環境が整いました！
---
---
# ステップ5-2: Google Apps Script 翻訳APIの作成

## 1. `コード.gs` - 完全なコード

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

## 2. デプロイ手順

### ステップ1: GASプロジェクトの作成

1. **Google Apps Script を開く**
   - https://script.google.com/ にアクセス
   - 「新しいプロジェクト」をクリック

2. **コードを貼り付け**
   - 上記の `コード.gs` の内容を全てコピー
   - デフォルトの `function myFunction() {}` を削除
   - コピーしたコードを貼り付け

3. **プロジェクト名を設定**
   - 「無題のプロジェクト」をクリック
   - 「プロンプトビルダー翻訳API」などの名前を入力
   - 「名前を変更」をクリック

### ステップ2: テスト実行

1. **関数を選択**
   - 上部のドロップダウンから `testTranslation` を選択

2. **実行**
   - 「実行」ボタン（▶️）をクリック
   - 初回実行時は権限の承認が必要
     - 「権限を確認」をクリック
     - Googleアカウントを選択
     - 「詳細」→「プロンプトビルダー翻訳API（安全ではないページ）に移動」
     - 「許可」をクリック

3. **ログを確認**
   - 「実行ログ」をクリック
   - 翻訳結果が表示されることを確認

### ステップ3: Webアプリとしてデプロイ

1. **デプロイを開始**
   - 右上の「デプロイ」→「新しいデプロイ」をクリック

2. **デプロイタイプを選択**
   - 「種類の選択」（⚙️アイコン）をクリック
   - 「ウェブアプリ」を選択

3. **デプロイ設定**
   - **説明**: 「初回デプロイ」など任意の説明を入力
   - **次のユーザーとして実行**: 「自分」を選択
   - **アクセスできるユーザー**: 「全員」を選択
     - ⚠️ これにより、URLを知っている人なら誰でもアクセス可能になります
     - セキュリティが心配な場合は、後述の認証方法を参照

4. **デプロイ実行**
   - 「デプロイ」ボタンをクリック
   - 再度権限の承認が必要な場合があります

5. **URLを取得**
   - デプロイが完了すると、「ウェブアプリ」のURLが表示されます
   - 例: `https://script.google.com/macros/s/AKfycbx.../exec`
   - このURLをコピーして保存

### ステップ4: Reactアプリに統合

`src/utils/translationApi.ts` を以下のように更新：

```typescript
/**
 * GAS翻訳APIのエンドポイント
 * デプロイ後に取得したURLに置き換えてください
 */
const GAS_API_ENDPOINT = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec';

/**
 * GAS翻訳APIを使用して翻訳を実行
 */
export async function translateWithGAS(
  text: string,
  direction: TranslationDirection
): Promise<string> {
  try {
    const response = await fetch(GAS_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        direction,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error?.message || '翻訳に失敗しました');
    }

    return data.data.translatedText;
  } catch (error) {
    console.error('Translation API error:', error);
    throw error;
  }
}
```

## 3. 動作確認

### curlでのテスト

```bash
# 英語→日本語
curl -X POST "YOUR_GAS_URL" \
  -H "Content-Type: application/json" \
  -d '{"text":"beautiful landscape","direction":"en-to-ja"}'

# 日本語→英語
curl -X POST "YOUR_GAS_URL" \
  -H "Content-Type: application/json" \
  -d '{"text":"美しい風景","direction":"ja-to-en"}'
```

### ブラウザコンソールでのテスト

```javascript
fetch('YOUR_GAS_URL', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: 'beautiful landscape',
    direction: 'en-to-ja'
  })
})
.then(res => res.json())
.then(data => console.log(data));
```

## 4. セキュリティ強化（オプション）

### APIキー認証の追加

```javascript
// コード.gs に追加
const API_KEY = 'your-secret-api-key-here';

function doPost(e) {
  try {
    // APIキーの検証
    const requestData = JSON.parse(e.postData.contents);
    if (requestData.apiKey !== API_KEY) {
      return createErrorResponse(
        'UNAUTHORIZED',
        '無効なAPIキーです',
        401
      );
    }

    // 以降は既存のコード...
  } catch (error) {
    // エラーハンドリング
  }
}
```

### レート制限の追加

```javascript
// コード.gs に追加
const RATE_LIMIT = 100; // 1日あたりの最大リクエスト数

function checkRateLimit(userId) {
  const cache = CacheService.getScriptCache();
  const key = `rate_limit_${userId}`;
  const count = parseInt(cache.get(key) || '0');
  
  if (count >= RATE_LIMIT) {
    throw new Error('レート制限を超えました');
  }
  
  cache.put(key, (count + 1).toString(), 86400); // 24時間
  return true;
}
```

## 5. トラブルシューティング

### よくある問題と解決方法

| 問題 | 原因 | 解決方法 |
|------|------|----------|
| 403 Forbidden | アクセス権限の設定ミス | デプロイ設定で「全員」を選択 |
| CORS エラー | ヘッダー設定の不足 | `doOptions()` 関数が実装されているか確認 |
| 翻訳結果が空 | テキストが空文字列 | リクエストボディを確認 |
| タイムアウト | 長すぎるテキスト | テキストを分割して送信 |

### デバッグ方法

1. **GASのログを確認**
   ```javascript
   Logger.log('Debug: ' + JSON.stringify(requestData));
   ```

2. **実行ログを表示**
   - GASエディタで「表示」→「ログ」

3. **エラーメッセージを確認**
   - レスポンスの `error.message` を確認

## 6. 更新とバージョン管理

### 新しいバージョンのデプロイ

1. コードを修正
2. 「デプロイ」→「デプロイを管理」
3. 既存のデプロイの「編集」（✏️）をクリック
4. 「バージョン」→「新バージョン」を選択
5. 「デプロイ」をクリック

⚠️ **注意**: URLは変わりません

これで、本物のGoogle翻訳APIを使用した翻訳機能が完成しました！