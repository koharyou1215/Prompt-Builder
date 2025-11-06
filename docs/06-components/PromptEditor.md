# PromptEditorコンポーネント

## ドキュメント情報

- **作成日**: 2025-10-19
- **バージョン**: 1.0.0
- **カテゴリ**: UIコンポーネント
- **関連コンポーネント**: PromptContext, useTranslation, useNegativeTranslation

---

## 概要

`PromptEditor`は、ポジティブプロンプトとネガティブプロンプトを編集するメインコンポーネントです。双方向翻訳機能を統合し、日本語と英語を行き来しながら直感的にプロンプトを構築できます。

### 主要機能

- **双方向翻訳**: 日本語⇔英語の自動翻訳
- **ポジティブ/ネガティブプロンプト管理**: 2種類のプロンプトを独立して編集
- **クリップボードコピー**: ワンクリックでプロンプトをコピー
- **翻訳トグル**: 翻訳機能のON/OFF切り替え
- **リセット機能**: 確認ダイアログ付きのプロンプトリセット
- **視覚的フィードバック**: ローディング表示、コピー成功通知、エラーメッセージ
- **レスポンシブデザイン**: デスクトップとモバイルに最適化

---

## アーキテクチャ

### データフロー

```
ユーザー入力（日本語）
    ↓
useTranslation / useNegativeTranslation
    ↓
Gemini API翻訳
    ↓
PromptContext更新
    ↓
英語プロンプト表示
```

### コンポーネント構造

```
PromptEditor
├── Header
│   ├── Title
│   └── Controls
│       ├── TranslationToggle
│       └── ResetButton
├── PositivePromptSection
│   ├── SectionHeader
│   │   ├── Title
│   │   ├── CopyButton
│   │   └── CopyFeedback
│   └── TextareaGroup
│       ├── EnglishTextarea (readonly)
│       └── JapaneseTextarea (editable)
└── NegativePromptSection
    ├── SectionHeader
    │   ├── Title
    │   ├── CopyButton
    │   └── CopyFeedback
    └── TextareaGroup
        ├── EnglishTextarea (readonly)
        └── JapaneseTextarea (editable)
```

---

## 双方向翻訳UIの統合

### 翻訳フックの使用

```typescript
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
```

### 翻訳機能のトグル

```typescript
const [translationEnabled, setTranslationEnabled] = useState<boolean>(true);

const handleToggleTranslation = useCallback((): void => {
  setTranslationEnabled((prev) => !prev);
}, []);
```

翻訳機能を無効にすると、日本語テキストエリアが編集不可になり、翻訳APIへのリクエストが停止します。

---

## 完全なコード実装

### TypeScript実装

```typescript
// src/components/PromptEditor.tsx
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

### CSSスタイル実装

```css
/* src/components/PromptEditor.module.css */

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

---

## ユーザビリティ機能

### 1. クリップボードコピー機能

```typescript
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
```

**特徴**:
- 最新のClipboard APIを使用
- コピー成功/失敗の視覚的フィードバック
- 2秒後に自動的にフィードバックを非表示

### 2. 文字数カウント（拡張可能）

将来的に以下のような文字数カウント機能を追加可能:

```typescript
const characterCount = promptState.positivePrompt.length;
const wordCount = promptState.positivePrompt.split(/\s+/).filter(Boolean).length;
```

### 3. リセット機能

```typescript
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
```

**特徴**:
- 誤操作防止のための確認ダイアログ
- LocalStorageの保存データも削除

---

## アクセシビリティ対応

### ARIAラベル

```typescript
// ボタンの目的を明示
<button
  onClick={handleReset}
  className={styles.resetButton}
  type="button"
  aria-label="プロンプトをリセット"
>
  <span className={styles.resetIcon}>🗑️</span>
  リセット
</button>
```

### スクリーンリーダー対応

```typescript
// エラーメッセージを通知
{positiveError && (
  <div className={styles.errorMessage} role="alert">
    ⚠️ {positiveError}
  </div>
)}

// ステータス更新を通知
{copyFeedback.type === 'positive' && (
  <span className={styles.copyFeedback} role="status">
    {copyFeedback.message}
  </span>
)}
```

### キーボードナビゲーション

- すべてのインタラクティブ要素はキーボードでアクセス可能
- フォーカス時の視覚的フィードバック（`:focus`スタイル）
- `Tab`キーで順序通りにナビゲート可能

### フォーカスインジケーター

```css
.textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
```

---

## レスポンシブデザイン

### デスクトップ (768px以上)

```css
@media (min-width: 768px) {
  .promptEditor {
    padding: 1.5rem;
  }

  .textareaGroup {
    flex-direction: row; /* 横並び */
    gap: 1.5rem;
  }

  .textareaWrapper {
    flex: 1; /* 等幅 */
  }

  .textarea {
    min-height: 120px;
  }
}
```

**レイアウト**:
- 英語と日本語のテキストエリアを横並び表示
- 広いスペースを活用した快適な編集体験

### モバイル (767px以下)

```css
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
    width: 100%; /* フルワイドボタン */
  }
}
```

**レイアウト**:
- 縦並びレイアウト
- タッチ操作に最適化されたボタンサイズ
- フルワイドボタンでタップしやすく

### iOS Safariの最適化

- タッチターゲット: 最小44x44pt（Appleガイドライン準拠）
- `-webkit-appearance: none`でカスタムスタイル適用
- Safe Areaを考慮したパディング（必要に応じて`env(safe-area-inset-*)`を使用）

---

## 主な実装ポイント

### 1. 双方向翻訳の統合

- `useTranslation` と `useNegativeTranslation` を使用
- ポジティブ/ネガティブそれぞれで独立した翻訳状態を管理
- 翻訳中のローディング表示でUXを向上

### 2. ユーザビリティ機能

- **コピー機能**: Clipboard APIを使用し、視覚的フィードバックを提供
- **翻訳トグル**: 翻訳機能のON/OFFを切り替え可能
- **リセット機能**: 確認ダイアログで誤操作を防止

### 3. アクセシビリティ

- `aria-label` でボタンの目的を明示
- `role="alert"` でエラーメッセージをスクリーンリーダーに通知
- `role="status"` でコピー成功のフィードバックを通知
- キーボードナビゲーション完全対応

### 4. レスポンシブデザイン

- デスクトップ: 英語/日本語を横並び表示
- モバイル: 縦並びで表示し、タッチ操作に最適化
- iOS Safari向け最適化（Safe Area、タッチターゲット）

### 5. 視覚的フィードバック

- 翻訳中のローディング表示（パルスアニメーション）
- コピー成功/失敗のメッセージ（フェードインアニメーション）
- エラーメッセージの表示
- 翻訳無効時の注意喚起

### 6. 型安全性

- すべてのイベントハンドラに適切な型定義
- `useCallback` でメモ化し、パフォーマンスを最適化
- TypeScriptの厳密な型チェックを活用

---

## 関連ドキュメント

- [PromptContext仕様](../04-state-management/PromptContext.md)
- [useTranslationフック仕様](../05-hooks/useTranslation.md)
- [双方向翻訳システム設計](../03-architecture/BidirectionalTranslation.md)
- [Gemini API統合](../02-api/GeminiAPI.md)

---

## 今後の拡張案

### 機能追加

1. **文字数カウント**: リアルタイム文字数・単語数表示
2. **履歴機能**: プロンプト編集履歴の保存と復元
3. **テンプレート**: よく使うプロンプトのテンプレート保存
4. **プレビュー**: 生成される画像のプレビュー機能

### UI改善

1. **ドラッグ&ドロップ**: テキストエリアのサイズ調整
2. **ショートカットキー**: `Ctrl+C`でコピー、`Ctrl+R`でリセットなど
3. **ダークモード**: ダークテーマ対応
4. **カスタマイズ**: フォントサイズ、カラーテーマのカスタマイズ

### パフォーマンス

1. **仮想化**: 長いテキストの仮想スクロール
2. **デバウンス最適化**: 翻訳APIリクエストの最適化
3. **メモ化強化**: 重い計算の最適化

このコンポーネントにより、ユーザーは直感的に日本語と英語を行き来しながら、高品質なプロンプトを構築できます。
