/**
 * TranslationArea component
 * Provides Japanese translation display and editing for positive prompts
 *
 * Translation behavior (prevents infinite loops):
 * - Auto-translate ON: English → Japanese is automatic
 * - Japanese → English: Always requires manual button click (日→英)
 * - Auto-translate OFF: Both directions require manual button clicks
 *
 * This one-way auto-translation prevents infinite loops that occur when
 * translation nuances cause continuous back-and-forth translation.
 */

import React, { useState, useCallback } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useSettings } from '../contexts/SettingsContext';
import { usePromptContext } from '../contexts/PromptContext';
import { CategoryModeView } from './CategoryModeView';
import styles from './TranslationArea.module.css';

/**
 * Copy feedback state type
 */
interface CopyFeedback {
  readonly type: 'positive' | null;
  readonly message: string;
}

const TranslationArea: React.FC = () => {
  const [copyFeedback, setCopyFeedback] = useState<CopyFeedback>({
    type: null,
    message: ''
  });

  // Get settings for auto-translate status
  const { settings } = useSettings();
  const { autoTranslate } = settings;

  // Get prompt mode for category view and manual mode switching
  const { mode, switchMode, restoreOriginal, hasOriginal } = usePromptContext();

  // Positive prompt translation
  const {
    translatedText: posTranslated,
    handleJapaneseChange: handlePosChange,
    manualTranslate,
    manualTranslateReverse,
    isTranslating: posTranslating,
    error: posError
  } = useTranslation();

  const handlePositiveChange = (event: React.ChangeEvent<HTMLTextAreaElement>): void => {
    handlePosChange(event.target.value);
  };

  /**
   * Copy text to clipboard
   */
  const copyToClipboard = useCallback(async (
    text: string,
    type: 'positive'
  ): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);

      setCopyFeedback({
        type,
        message: '✓ コピーしました'
      });

      setTimeout(() => {
        setCopyFeedback({ type: null, message: '' });
      }, 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);

      setCopyFeedback({
        type,
        message: '⚠ コピーに失敗しました'
      });

      setTimeout(() => {
        setCopyFeedback({ type: null, message: '' });
      }, 2000);
    }
  }, []);

  /**
   * Copy positive Japanese translation
   */
  const handleCopyPositive = useCallback((): void => {
    void copyToClipboard(posTranslated, 'positive');
  }, [posTranslated, copyToClipboard]);

  /**
   * Restore original English prompt (before reverse translation)
   */
  const handleRestoreOriginal = useCallback((): void => {
    restoreOriginal('positive');
  }, [restoreOriginal]);

  /**
   * Clear positive Japanese translation
   */
  const handleClearPositive = useCallback((): void => {
    handlePosChange('');
  }, [handlePosChange]);

  /**
   * Switch to category mode manually
   */
  const handleSwitchToCategoryMode = useCallback((): void => {
    switchMode('category');
  }, [switchMode]);

  return (
    <div className={styles.translationArea}>
      {/* Category Mode View */}
      {mode === 'category' && <CategoryModeView />}

      {/* Text Mode View (Traditional) */}
      {mode === 'text' && (
        <div className={styles.translationSection}>
          <div className={styles.header}>
            <label htmlFor="positive-translation" className={styles.label}>
              <strong>日本語</strong>
              {posTranslating && (
                <span className={styles.translatingIndicator}>翻訳中...</span>
              )}
            </label>
            <div className={styles.buttonContainer}>
              {copyFeedback.type === 'positive' && (
                <span className={styles.copyFeedback}>
                  {copyFeedback.message}
                </span>
              )}
              {!autoTranslate && (
                <button
                  onClick={() => manualTranslate()}
                  disabled={posTranslating}
                  className={styles.iconButton}
                  title="英語プロンプトを日本語に翻訳"
                  aria-label="英語から日本語へ翻訳"
                >
                  {posTranslating ? '⏳' : '🔄'}
                </button>
              )}
              <button
                onClick={() => manualTranslateReverse()}
                disabled={posTranslating}
                className={styles.iconButton}
                title="日本語を英語プロンプトに翻訳"
                aria-label="日本語から英語へ翻訳"
              >
                {posTranslating ? '⏳' : '↩️'}
              </button>
              {hasOriginal('positive') && (
                <button
                  onClick={handleRestoreOriginal}
                  disabled={posTranslating}
                  className={styles.iconButton}
                  title="逆翻訳前の元の英文に戻す"
                  aria-label="元の英文に戻す"
                >
                  ⏪
                </button>
              )}
              {posTranslated.trim() && (
                <button
                  onClick={handleSwitchToCategoryMode}
                  disabled={posTranslating}
                  className={styles.iconButton}
                  title="カテゴリーモードで編集"
                  aria-label="カテゴリーモードに切り替え"
                >
                  📂
                </button>
              )}
              <button
                onClick={handleClearPositive}
                disabled={!posTranslated.trim()}
                className={styles.iconButton}
                title="日本語テキストを一括削除"
                aria-label="一括削除"
              >
                🗑️
              </button>
              <button
                onClick={handleCopyPositive}
                disabled={!posTranslated.trim()}
                className={styles.iconButton}
                title="日本語翻訳をコピー"
                aria-label="コピー"
              >
                📋
              </button>
            </div>
          </div>
          <textarea
            id="positive-translation"
            value={posTranslated}
            onChange={handlePositiveChange}
            placeholder="日本語でプロンプトを入力または編集できます"
            rows={12}
            className={`${styles.textarea} ${posError ? styles.textareaError : ''}`}
          />
          {posError && (
            <div className={styles.errorContainer}>
              <div className={styles.errorIcon}>⚠️</div>
              <div className={styles.errorText}>
                <div className={styles.errorMessage}>
                  {posError}
                </div>
                {import.meta.env.DEV && (
                  <div className={styles.errorDetails}>
                    エラーの詳細はコンソールを確認してください。
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TranslationArea;
