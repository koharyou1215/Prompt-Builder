# 双方向翻訳カスタムフック - useTranslation / useNegativeTranslation

## ドキュメント情報

- **ファイルパス**: `src/hooks/useTranslation.ts`
- **バージョン**: 1.0.0
- **最終更新日**: 2025-10-19
- **関連コンポーネント**: TranslationArea, PromptEditor
- **依存関係**: PromptContext, TranslationDirection型

---

## 概要

`useTranslation`と`useNegativeTranslation`は、プロンプトの双方向翻訳機能を提供するカスタムフックです。これらのフックは、ユーザーが英語原文と日本語翻訳を自由に行き来しながら編集できる、直感的なUIを実現します。

### 主要機能

1. **英語 → 日本語の自動翻訳**
   - 原文（英語）が変更されると、デバウンス後に自動的に日本語翻訳を実行
   - PromptContextの`positivePrompt`（または`negativePrompt`）を監視

2. **日本語 → 英語の逆翻訳**
   - 日本語翻訳結果を編集すると、デバウンス後に英語原文を自動更新
   - `handleJapaneseChange`コールバックを通じてトリガー

3. **デバウンス処理**
   - 連続入力時のAPI呼び出しを抑制（デフォルト500ms）
   - パフォーマンス最適化とAPI使用量の削減

4. **キャンセル処理**
   - 新しい翻訳リクエスト発生時、進行中のリクエスト結果を破棄
   - メモリリークとレースコンディションを防止

---

## デバウンス処理の仕組み

### 実装パターン

```typescript
const timerRef = useRef<NodeJS.Timeout | null>(null);
const abortRef = useRef<boolean>(false);

// 既存タイマーをクリア
if (timerRef.current) {
  clearTimeout(timerRef.current);
}

// 進行中の翻訳をキャンセル
abortRef.current = true;

// デバウンス処理
timerRef.current = setTimeout(() => {
  const translate = async () => {
    abortRef.current = false; // 新規リクエスト開始
    // 翻訳処理...
  };
  void translate();
}, debounceMs);
```

### 動作フロー

```
ユーザー入力
    ↓
既存タイマーをキャンセル
    ↓
新しいタイマーを設定（500ms）
    ↓
【500ms待機中】
    ↓
（追加入力なし）→ 翻訳API実行
（追加入力あり）→ タイマーリセット
```

### メリット

- **API呼び出し削減**: 連続入力時に無駄なリクエストを発生させない
- **UXの向上**: 入力が落ち着いてから処理を実行
- **コスト削減**: 翻訳APIの使用量を最小限に抑制

---

## キャンセル処理の仕組み

### AbortRefパターン

```typescript
const abortRef = useRef<boolean>(false);

// 翻訳開始前
abortRef.current = false;

// 翻訳API呼び出し
const result = await mockTranslate(text, direction);

// 結果を適用する前にキャンセルチェック
if (!abortRef.current) {
  setTranslatedText(result);
}
```

### レースコンディションの防止

```
リクエストA開始（"hello"を翻訳）
    ↓
リクエストB開始（"hello world"を翻訳）← abortRef.current = true
    ↓
リクエストA完了 ← abortRef.currentがtrueなので結果を破棄
    ↓
リクエストB完了 ← 最新の結果を適用
```

### クリーンアップ処理

```typescript
// コンポーネントアンマウント時
useEffect(() => {
  return () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    abortRef.current = true; // 進行中の処理を全てキャンセル
  };
}, []);
```

---

## 完全なコード実装

### useTranslation（ポジティブプロンプト用）

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
```

### useNegativeTranslation（ネガティブプロンプト用）

```typescript
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

    if (jaToEnTimerRef.current) {      clearTimeout(jaToEnTimerRef.current);
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

---

## 使用例

### TranslationAreaコンポーネント

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

### カスタムデバウンス時間の設定

```typescript
// デバウンス時間を1000msに設定
const { translatedText, handleJapaneseChange } = useTranslation({
  debounceMs: 1000
});
```

### 翻訳の無効化

```typescript
// 条件に応じて翻訳を無効化
const [translationEnabled, setTranslationEnabled] = useState(true);

const { translatedText, handleJapaneseChange } = useTranslation({
  enabled: translationEnabled
});
```

---

## ベストプラクティス

### 1. エラーハンドリング

```typescript
const { error } = useTranslation();

{error && (
  <div className="error-message" role="alert">
    <span className="error-icon">⚠️</span>
    {error}
  </div>
)}
```

### 2. ローディング状態の表示

```typescript
const { isTranslating } = useTranslation();

<textarea
  disabled={isTranslating}
  className={isTranslating ? 'textarea-disabled' : ''}
  placeholder={isTranslating ? '翻訳中...' : '日本語で入力'}
/>
```

### 3. アクセシビリティ対応

```typescript
<textarea
  aria-busy={isTranslating}
  aria-invalid={error !== null}
  aria-describedby={error ? 'translation-error' : undefined}
/>
{error && (
  <div id="translation-error" role="alert">
    {error}
  </div>
)}
```

### 4. パフォーマンス最適化

```typescript
// 大量のテキストを扱う場合はデバウンス時間を長めに設定
const { translatedText } = useTranslation({
  debounceMs: 1000 // 長文翻訳の場合
});
```

---

## コード重複の分析と改善提案

### 現状の問題点

`useTranslation`と`useNegativeTranslation`は、以下の点を除いて**ほぼ同一のロジック**を持っています：

- 参照するContext値: `positivePrompt` vs `negativePrompt`
- 更新関数: `setPositivePrompt` vs `setNegativePrompt`

**コードの重複箇所**:
- デバウンス処理のロジック（約100行）
- キャンセル処理のロジック（約40行）
- エラーハンドリングのロジック（約30行）
- クリーンアップ処理のロジック（約20行）

**重複率**: 約95%

### 改善提案: ジェネリックフックの導入

```typescript
/**
 * 汎用的な双方向翻訳フック
 * PromptTypeによってポジティブ/ネガティブを切り替え
 */
type PromptType = 'positive' | 'negative';

interface UseGenericTranslationOptions extends UseTranslationOptions {
  /** プロンプトのタイプ */
  readonly promptType: PromptType;
}

const useGenericTranslation = (
  options: UseGenericTranslationOptions
): UseTranslationReturn => {
  const { promptType, ...restOptions } = options;
  const { promptState, setPositivePrompt, setNegativePrompt } = usePromptContext();

  // タイプに応じて参照するプロンプトと更新関数を選択
  const sourcePrompt = promptType === 'positive'
    ? promptState.positivePrompt
    : promptState.negativePrompt;

  const setSourcePrompt = promptType === 'positive'
    ? setPositivePrompt
    : setNegativePrompt;

  // 共通のロジック（デバウンス、キャンセル、翻訳処理など）
  // ... 実装 ...
};

// 外部公開用のラッパー関数
export const useTranslation = (
  options: UseTranslationOptions = {}
): UseTranslationReturn => {
  return useGenericTranslation({ ...options, promptType: 'positive' });
};

export const useNegativeTranslation = (
  options: UseTranslationOptions = {}
): UseTranslationReturn => {
  return useGenericTranslation({ ...options, promptType: 'negative' });
};
```

### 改善のメリット

1. **保守性の向上**: ロジックの変更が1箇所で済む
2. **バグ修正の効率化**: 片方のバグ修正が自動的に両方に適用
3. **テストの効率化**: 共通ロジックのテストを1回で済ます
4. **コードサイズの削減**: 約200行のコード削減が可能

### 実装優先度

**優先度**: 🟡 MEDIUM

**理由**:
- 現在のコードは動作しており、機能的な問題はない
- ただし、将来的なメンテナンスコストを考慮すると改善の価値あり
- 新機能追加のタイミングでリファクタリングを検討すべき

---

## 主な設計ポイント

### 1. デバウンス処理の実装

- `useRef`でタイマーIDを保持し、入力のたびにタイマーをリセット
- 入力が止まってから指定時間（デフォルト500ms）後に翻訳を実行
- 不要なAPI呼び出しを削減し、パフォーマンスを最適化

### 2. キャンセル処理

- `useRef`でキャンセルフラグを保持
- 新しい翻訳リクエストが発生したら、前のリクエストの結果を無視
- コンポーネントのアンマウント時にも適切にクリーンアップ
- レースコンディションを防止し、メモリリークを回避

### 3. 双方向の翻訳

- **英→日**: `useEffect`で`positivePrompt`の変更を監視
- **日→英**: `handleJapaneseChange`コールバックで逆翻訳をトリガー
- 両方向の翻訳が独立して動作し、相互に干渉しない

### 4. 型安全性

- すべての関数とステートに明示的な型定義
- `readonly`を活用して不変性を保証
- TypeScriptの型システムを最大限に活用

### 5. エラーハンドリング

- 翻訳エラーを状態として保持
- UIでエラーメッセージを表示可能
- ユーザーに適切なフィードバックを提供

### 6. 拡張性

- ネガティブプロンプト用の`useNegativeTranslation`も同様のロジックで実装
- オプションで翻訳の有効/無効やデバウンス時間を制御可能
- 将来的な機能拡張に対応しやすい設計

---

## 関連ドキュメント

- **Context**: [PromptContext仕様書](../04-contexts/PromptContext.md)
- **型定義**: [TranslationDirection型定義](../02-types/translation.md)
- **コンポーネント**: [TranslationAreaコンポーネント](../03-components/TranslationArea.md)
- **API**: [翻訳API仕様](../07-api/translation-api.md)

---

## TODO: 実装が必要な項目

1. **実際の翻訳API統合**
   - `mockTranslate`関数を実際のAPI呼び出しに置き換え
   - Google Translate API、DeepL API、またはカスタムLLMの統合

2. **コード重複の解消**
   - ジェネリックフック`useGenericTranslation`の実装
   - `useTranslation`と`useNegativeTranslation`をラッパー化

3. **エラーリトライ機能**
   - ネットワークエラー時の自動リトライ
   - エクスポネンシャルバックオフの実装

4. **翻訳キャッシュ機能**
   - 同じテキストの再翻訳を避けるためのキャッシュ
   - LocalStorageまたはメモリキャッシュの実装

5. **翻訳品質の向上**
   - コンテキストを考慮した翻訳
   - 専門用語辞書の統合
