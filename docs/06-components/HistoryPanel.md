# HistoryPanel コンポーネント設計書

## ドキュメント情報

| 項目 | 内容 |
|------|------|
| **コンポーネント名** | HistoryPanel |
| **ファイルパス** | `src/components/HistoryPanel.tsx` |
| **スタイルファイル** | `src/components/HistoryPanel.module.css` |
| **目的** | プロンプト履歴の表示・管理を行うサイドパネル用コンポーネント |
| **依存関係** | `useHistory`, `usePromptContext`, `HistoryEntry` |
| **最終更新** | 2025-10-19 |

---

## コンポーネント概要

HistoryPanelは、ブラウザ拡張機能のサイドパネルで使用される履歴管理UIコンポーネントです。プロンプトの保存、検索、適用、削除などの機能を提供します。

### 主な機能

1. **プロンプトの保存**
   - 現在のプロンプト（ポジティブ/ネガティブ）を履歴に保存
   - 空のプロンプトはバリデーションでブロック
   - 非同期処理でローディング状態を表示

2. **履歴の検索**
   - リアルタイム検索機能
   - 検索結果件数の表示
   - クリアボタンでワンクリックリセット

3. **履歴の適用**
   - ワンクリックで過去のプロンプトをエディタに復元
   - 視覚的フィードバック（スピナー・アニメーション）

4. **履歴の削除**
   - 確認ダイアログで誤削除を防止
   - 削除対象の詳細を表示

5. **レスポンシブUI**
   - ダークモード完全対応
   - 360px以下の狭い幅でコンパクト表示
   - カスタムスクロールバー

---

## サイドパネル最適化設計

### レイアウト構造

```
┌─────────────────────────────┐
│ Header (固定)                │
│ - タイトル + 保存ボタン      │
├─────────────────────────────┤
│ SearchBar (固定)             │
│ - 検索入力 + クリアボタン    │
│ - 検索結果件数               │
├─────────────────────────────┤
│ ListContainer (スクロール)   │
│ ┌─────────────────────────┐ │
│ │HistoryItem              │ │
│ │ - プレビューテキスト    │ │
│ │ - ネガティブプロンプト  │ │
│ │ - アクションボタン      │ │
│ ├─────────────────────────┤ │
│ │HistoryItem              │ │
│ │...                      │ │
│ └─────────────────────────┘ │
├─────────────────────────────┤
│ Footer (固定)                │
│ - 統計情報                   │
└─────────────────────────────┘
```

### Flexboxレイアウト

```css
.historyPanel {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.header, .searchBar, .footer {
  flex-shrink: 0;  /* 固定サイズ */
}

.listContainer {
  flex: 1;  /* 残りのスペースを占有 */
  overflow-y: auto;  /* スクロール可能 */
}
```

### スクロール最適化

- カスタムスクロールバー（8px幅）
- スムーズスクロール体験
- ダークモード対応の色調整

---

## 検索・フィルタリング機能

### 検索UI

```tsx
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

  {searchTerm && (
    <div className={styles.searchResultCount}>
      {filteredHistoryList.length}件の結果
    </div>
  )}
</div>
```

### 検索ロジック

```tsx
// リアルタイム検索（useMemoで最適化）
const filteredHistoryList = useMemo(() => {
  return searchHistory(historyList, searchTerm);
}, [historyList, searchTerm]);
```

### 検索結果の表示

- **検索中**: 件数を表示
- **結果なし**: 「検索結果がありません」メッセージ
- **検索クリア**: 全履歴を再表示

---

## TypeScript実装

### `src/components/HistoryPanel.tsx`

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

---

## CSSスタイル実装

### `src/components/HistoryPanel.module.css`

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

---

## ユーザビリティとアクセシビリティ

### ユーザビリティ機能

1. **視覚的フィードバック**
   - ホバー時のボタンエフェクト
   - クリック時のアニメーション
   - ローディングスピナー
   - 処理中はボタンを無効化

2. **エラーハンドリング**
   - 空のプロンプト保存を防止
   - 削除時の確認ダイアログ
   - エラー発生時のアラート表示

3. **検索体験**
   - リアルタイム検索
   - 検索結果件数の表示
   - ワンクリックでクリア

4. **レスポンシブ対応**
   - ダークモード自動切り替え
   - 360px以下でコンパクト表示
   - カスタムスクロールバー

### アクセシビリティ機能

1. **ARIA属性**
   - `aria-label` でボタンの説明
   - `role="list"` でリスト構造を明示
   - セマンティックHTML（`<header>`, `<footer>`, `<ul>`, `<li>`）

2. **キーボード操作**
   - すべてのボタンがキーボードでアクセス可能
   - フォーカス状態の視覚的表示
   - Tabキーでの順次移動

3. **スクリーンリーダー対応**
   - 意味のある要素名
   - 適切な見出し階層
   - 状態の読み上げ（ローディング、空の状態）

### パフォーマンス最適化

1. **メモ化**
   - `useMemo` で検索結果をキャッシュ
   - `useCallback` でイベントハンドラを最適化

2. **レンダリング最適化**
   - 不要な再レンダリングを防止
   - 条件付きレンダリング
   - 仮想スクロール（将来的な拡張）

---

## 主な実装ポイント

### 1. サイドパネル最適化
- 縦長レイアウトに最適化された設計
- スクロール可能なリストエリア
- 固定ヘッダー・フッター

### 2. 検索機能
- リアルタイム検索
- 検索結果件数の表示
- クリアボタン付き

### 3. ユーザビリティ
- ホバーエフェクト
- ローディング状態の表示
- 処理中のボタン無効化
- 確認ダイアログ

### 4. レスポンシブデザイン
- ダークモード完全対応
- 狭い幅（360px以下）でのコンパクト表示
- カスタムスクロールバー

### 5. アクセシビリティ
- `aria-label` で操作の説明
- `role="list"` でリスト構造を明示
- キーボード操作対応

### 6. パフォーマンス
- `useMemo` で検索結果をメモ化
- `useCallback` でイベントハンドラをメモ化
- 不要な再レンダリングを防止

### 7. 視覚的フィードバック
- ボタンのホバー・アクティブ状態
- スピナーアニメーション
- スムーズなトランジション

---

## 関連ドキュメント

- **Hooks**: [`useHistory` フック設計書](../05-hooks/useHistory.md)
- **Types**: [型システム設計書](../02-types-design.md)
- **Context**: [状態管理設計書](../03-state-management.md)
- **全体アーキテクチャ**: [アーキテクチャ設計書](../01-architecture.md)

---

## 使用例

```typescript
// サイドパネルで使用
import HistoryPanel from './components/HistoryPanel';

function SidePanel() {
  return (
    <div className="side-panel">
      <HistoryPanel />
    </div>
  );
}
```

このコンポーネントにより、ブラウザ拡張機能のサイドパネルで快適に履歴を管理できます。
