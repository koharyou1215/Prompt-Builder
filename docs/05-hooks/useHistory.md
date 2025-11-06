# useHistory - 履歴管理フック

## ドキュメント情報

- **作成日**: 2025-10-19
- **カテゴリ**: カスタムフック
- **関連ファイル**: `src/hooks/useHistory.ts`
- **依存関係**: PromptContext, storageService

---

## 概要

`useHistory`は、プロンプトの履歴を保存・読み込み・削除する機能を提供するカスタムフックです。ユーザーが過去に作成したプロンプトを簡単に保存し、後から復元できる仕組みを実装します。

### 主な機能

- **履歴の自動読み込み**: コンポーネントマウント時にlocalStorageから履歴を読み込み
- **履歴の保存**: 現在のプロンプト状態を新しい履歴エントリとして保存
- **履歴の削除**: 指定されたIDの履歴エントリを削除
- **履歴の適用**: 保存された履歴をエディタに復元
- **履歴の検索**: キーワードで履歴を検索
- **最大件数管理**: 設定した最大件数を超えたら古い履歴を自動削除

---

## ID生成戦略

履歴エントリの一意なIDを生成する際、以下の2つのアプローチが考えられます。

### ✅ 採用: タイムスタンプ + ランダム文字列

```typescript
const generateUniqueId = (): string => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 9);
  return `${timestamp}-${randomStr}`;
};
```

**メリット:**
- 実装がシンプルで軽量
- ブラウザ環境で追加ライブラリ不要
- 十分な一意性（衝突確率は極めて低い）
- デバッグ時にタイムスタンプから作成日時が推測可能

**デメリット:**
- UUID v4と比較して理論上の一意性は劣る
- 厳密な一意性保証が必要な場合は不適

### ❌ 不採用: UUID v4

```typescript
import { v4 as uuidv4 } from 'uuid';

const generateUniqueId = (): string => {
  return uuidv4();
};
```

**メリット:**
- RFC 4122標準に準拠
- 衝突確率が非常に低い（実質ゼロ）
- 業界標準として広く認知

**デメリット:**
- 外部ライブラリ（`uuid`）が必要
- バンドルサイズが増加
- 本アプリケーションの規模には過剰

**結論:**
個人開発の非商用アプリケーションであり、履歴エントリ数も限定的（最大50件）なため、タイムスタンプ + ランダム文字列の方式で十分な一意性が確保できます。軽量でシンプルな実装を優先します。

---

## 完全なコード実装

### `src/hooks/useHistory.ts`

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

---

## API仕様

### フック: `useHistory(options?)`

履歴管理機能を提供するカスタムフック。

#### パラメータ

```typescript
interface UseHistoryOptions {
  maxHistoryCount?: number;  // 最大履歴件数（デフォルト: 50）
  autoLoad?: boolean;        // 自動読み込み有効化（デフォルト: true）
}
```

#### 戻り値

```typescript
interface UseHistoryReturn {
  historyList: readonly HistoryEntry[];
  isLoading: boolean;
  saveHistory: (prompt: PromptState) => Promise<void>;
  deleteHistory: (id: string) => Promise<void>;
  applyHistory: (entry: HistoryEntry) => void;
  reloadHistory: () => Promise<void>;
}
```

### 関数: `saveHistory(prompt)`

現在のプロンプト状態を履歴に保存します。

**動作:**
1. 空のプロンプトはスキップ
2. 一意なIDを生成
3. タイムスタンプを付与
4. 履歴リストの先頭に追加
5. 最大件数を超えたら古い履歴を削除
6. localStorageに保存

**エラー:**
- 空のプロンプトの場合は警告ログを出力して終了
- 保存失敗時は`Error`をthrow

### 関数: `deleteHistory(id)`

指定されたIDの履歴エントリを削除します。

**動作:**
1. 指定IDのエントリを除外
2. 更新後のリストをlocalStorageに保存

**エラー:**
- 削除失敗時は`Error`をthrow

### 関数: `applyHistory(entry)`

保存された履歴をエディタに復元します。

**動作:**
1. PromptContextの状態を更新
2. エディタに履歴の内容が反映される

**エラー:**
- 適用失敗時は`Error`をthrow

### 関数: `reloadHistory()`

履歴を手動で再読み込みします。

**使用例:**
- 外部からストレージが変更された場合
- 強制的に最新状態を取得したい場合

---

## ユーティリティ関数

### `formatHistoryEntry(entry, maxLength?)`

履歴エントリを表示用にフォーマットします。

```typescript
formatHistoryEntry(entry, 50)
// => "2025-10-19 19:23 | a beautiful landscape..."
```

### `isSameHistoryEntry(entry1, entry2)`

2つの履歴エントリが同じ内容かどうかを判定します。

```typescript
if (isSameHistoryEntry(currentEntry, lastSavedEntry)) {
  console.log('既に保存済み');
}
```

### `searchHistory(historyList, searchTerm)`

キーワードで履歴を検索します。

```typescript
const results = searchHistory(historyList, 'landscape');
```

---

## 使用例

### 基本的な使用方法

```typescript
import { useHistory } from '../hooks/useHistory';

const MyComponent: React.FC = () => {
  const {
    historyList,
    isLoading,
    saveHistory,
    deleteHistory,
    applyHistory
  } = useHistory();

  // 履歴を保存
  const handleSave = async () => {
    await saveHistory(currentPromptState);
  };

  // 履歴を削除
  const handleDelete = async (id: string) => {
    await deleteHistory(id);
  };

  // 履歴を適用
  const handleApply = (entry: HistoryEntry) => {
    applyHistory(entry);
  };

  return (
    <div>
      {isLoading ? (
        <p>読み込み中...</p>
      ) : (
        historyList.map(entry => (
          <div key={entry.id}>
            <p>{formatHistoryEntry(entry)}</p>
            <button onClick={() => handleApply(entry)}>適用</button>
            <button onClick={() => handleDelete(entry.id)}>削除</button>
          </div>
        ))
      )}
    </div>
  );
};
```

### 履歴パネルコンポーネント例

```typescript
import React, { useState } from 'react';
import { useHistory, formatHistoryEntry } from '../hooks/useHistory';
import { usePromptContext } from '../contexts/PromptContext';

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

  const handleDelete = async (id: string): Promise<void> => {
    if (window.confirm('この履歴を削除しますか？')) {
      try {
        await deleteHistory(id);
      } catch (error) {
        alert('削除に失敗しました');
      }
    }
  };

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

---

## 実装のポイント

### 1. 履歴の管理

- **降順ソート**: 新しい履歴を先頭に追加（日付の降順）
- **最大件数管理**: 50件を超えたら古い履歴を自動削除
- **空チェック**: 空のプロンプトは保存しない（無駄な履歴を防止）

### 2. 一意なID生成

```typescript
const generateUniqueId = (): string => {
  const timestamp = Date.now().toString(36);        // タイムスタンプを36進数に
  const randomStr = Math.random().toString(36).substring(2, 9);
  return `${timestamp}-${randomStr}`;               // 組み合わせて衝突を防止
};
```

- タイムスタンプ（36進数）+ ランダム文字列で一意性を確保
- UUIDライブラリ不要で軽量
- デバッグ時にIDから作成日時を推測可能

### 3. エラーハンドリング

- すべての非同期操作で`try-catch`を使用
- エラー時は適切なメッセージを`throw`
- コンソールにエラーログを出力（デバッグ用）

### 4. パフォーマンス最適化

- **useCallback**: メモ化して不要な再レンダリングを防止
- **初回読み込みのみ**: `useEffect`で履歴の読み込みは初回マウント時のみ実行
- **遅延読み込み**: `autoLoad: false`オプションで手動読み込みも可能

### 5. 型安全性

- すべての関数に明示的な型定義
- `readonly`で不変性を保証
- TypeScriptの型推論を活用

### 6. ユーティリティ関数の提供

- **formatHistoryEntry**: 表示用のフォーマット（日時 + プロンプトプレビュー）
- **isSameHistoryEntry**: 重複チェック（同じ内容の履歴を判定）
- **searchHistory**: キーワード検索機能

---

## 関連ドキュメント

- [PromptContext](../04-contexts/PromptContext.md) - プロンプト状態管理
- [storageService](../06-services/storageService.md) - localStorage操作
- [型定義](../02-types/index.md) - HistoryEntry, PromptState型

---

## 今後の拡張案

1. **履歴のエクスポート/インポート**: JSON形式での履歴データの書き出し・読み込み
2. **タグ機能**: 履歴にタグを付けて分類
3. **お気に入り機能**: 特定の履歴をお気に入りとしてマーク
4. **履歴の編集**: 保存済み履歴の内容を編集
5. **履歴の統計**: 使用頻度の高いキーワードを分析
