/**
 * EditKeywordModal component
 * Modal dialog for editing keywords (custom or default)
 *
 * Features:
 * - Category selection dropdown (pre-filled)
 * - Japanese and English input fields (pre-filled)
 * - Validation and error handling
 * - Save and cancel actions
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useCustomKeywords } from '../hooks/useCustomKeywords';
import { negativeKeywordCategories } from '../data/keywords';

interface EditKeywordModalProps {
  readonly isOpen: boolean;
  readonly keyword: { categoryName: string; ja: string; en: string } | null;
  onClose: () => void;
}

const EditKeywordModal: React.FC<EditKeywordModalProps> = ({ isOpen, keyword, onClose }) => {
  const { updateKeyword, allCategories } = useCustomKeywords();

  const [categoryName, setCategoryName] = useState<string>('');
  const [jaText, setJaText] = useState<string>('');
  const [enText, setEnText] = useState<string>('');
  const [originalEn, setOriginalEn] = useState<string>(''); // Store original English keyword
  const [originalCategory, setOriginalCategory] = useState<string>(''); // Store original category
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Get all available category names from allCategories (includes custom categories)
  const allCategoryNames = [
    ...allCategories.map((c) => c.categoryName),
    ...negativeKeywordCategories.map((c) => c.categoryName)
  ];

  /**
   * Initialize form with keyword data
   */
  useEffect(() => {
    if (keyword) {
      setCategoryName(keyword.categoryName);
      setJaText(keyword.ja);
      setEnText(keyword.en);
      setOriginalEn(keyword.en);
      setOriginalCategory(keyword.categoryName);
      setError(null);
    }
  }, [keyword]);

  /**
   * Handle save
   */
  const handleSave = useCallback(async (): Promise<void> => {
    if (!keyword) return;

    setError(null);
    setIsSaving(true);

    try {
      if (!categoryName) {
        throw new Error('カテゴリーを選択してください');
      }
      if (!jaText.trim()) {
        throw new Error('日本語を入力してください');
      }
      if (!enText.trim()) {
        throw new Error('英語を入力してください');
      }

      // Use new updateKeyword API
      const newCategoryName = categoryName !== originalCategory ? categoryName : undefined;
      await updateKeyword(originalCategory, originalEn, jaText, enText, newCategoryName);

      // Close modal
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message
        : 'キーワードの更新に失敗しました';
      setError(errorMessage);
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  }, [keyword, categoryName, jaText, enText, originalEn, originalCategory, updateKeyword, onClose]);

  /**
   * Handle cancel
   */
  const handleCancel = useCallback((): void => {
    setError(null);
    onClose();
  }, [onClose]);

  /**
   * Handle background click
   */
  const handleBackgroundClick = useCallback((e: React.MouseEvent<HTMLDivElement>): void => {
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  }, [handleCancel]);

  if (!isOpen || !keyword) return null;

  return (
    <div
      onClick={handleBackgroundClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px'
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '8px',
          maxWidth: '500px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
            キーワードを編集
          </h2>
          <button
            onClick={handleCancel}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6b7280',
              padding: '0',
              lineHeight: 1
            }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px' }}>
          {error && (
            <div
              style={{
                padding: '12px',
                background: '#fee2e2',
                border: '1px solid #fecaca',
                borderRadius: '6px',
                color: '#dc2626',
                fontSize: '14px',
                marginBottom: '16px'
              }}
            >
              {error}
            </div>
          )}

          {/* Category Selection with ability to create new */}
          <div style={{ marginBottom: '16px' }}>
            <label
              htmlFor="edit-keyword-category"
              style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151'
              }}
            >
              カテゴリー
            </label>
            <input
              id="edit-keyword-category"
              list="edit-category-list"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="カテゴリーを選択または入力"
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: '14px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                background: '#fff'
              }}
            />
            <datalist id="edit-category-list">
              {allCategoryNames.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
              既存のカテゴリーを選択するか、新しいカテゴリー名を入力してください
            </div>
          </div>

          {/* Japanese Input */}
          <div style={{ marginBottom: '16px' }}>
            <label
              htmlFor="keyword-ja"
              style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151'
              }}
            >
              日本語
            </label>
            <input
              id="keyword-ja"
              type="text"
              value={jaText}
              onChange={(e) => setJaText(e.target.value)}
              placeholder="例: 魔法使い"
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: '14px',
                border: '1px solid #d1d5db',
                borderRadius: '6px'
              }}
            />
          </div>

          {/* English Input */}
          <div style={{ marginBottom: '16px' }}>
            <label
              htmlFor="keyword-en"
              style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151'
              }}
            >
              英語
            </label>
            <input
              id="keyword-en"
              type="text"
              value={enText}
              onChange={(e) => setEnText(e.target.value)}
              placeholder="例: wizard"
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: '14px',
                border: '1px solid #d1d5db',
                borderRadius: '6px'
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 20px',
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end'
          }}
        >
          <button
            onClick={handleCancel}
            disabled={isSaving}
            style={{
              padding: '8px 20px',
              fontSize: '14px',
              background: '#f3f4f6',
              color: '#374151',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              cursor: isSaving ? 'not-allowed' : 'pointer'
            }}
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            style={{
              padding: '8px 20px',
              fontSize: '14px',
              background: isSaving ? '#9ca3af' : '#3b82f6',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: isSaving ? 'not-allowed' : 'pointer'
            }}
          >
            {isSaving ? '更新中...' : '更新'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditKeywordModal;
