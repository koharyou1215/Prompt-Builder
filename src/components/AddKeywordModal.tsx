/**
 * AddKeywordModal component
 * Modal dialog for adding custom keywords
 *
 * Features:
 * - Category selection dropdown
 * - Japanese and English input fields
 * - Validation and error handling
 * - Save and cancel actions
 */

import React, { useState, useCallback } from 'react';
import { useCustomKeywords } from '../hooks/useCustomKeywords';
import { keywordCategories, negativeKeywordCategories } from '../data/keywords';

interface AddKeywordModalProps {
  readonly isOpen: boolean;
  onClose: () => void;
}

const AddKeywordModal: React.FC<AddKeywordModalProps> = ({ isOpen, onClose }) => {
  const { addKeyword } = useCustomKeywords();

  const [categoryName, setCategoryName] = useState<string>('');
  const [jaText, setJaText] = useState<string>('');
  const [enText, setEnText] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Get all available category names
  const allCategoryNames = [
    ...keywordCategories.map((c) => c.categoryName),
    ...negativeKeywordCategories.map((c) => c.categoryName)
  ];

  /**
   * Handle save
   */
  const handleSave = useCallback(async (): Promise<void> => {
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

      await addKeyword(categoryName, jaText, enText);

      // Clear form and close
      setCategoryName('');
      setJaText('');
      setEnText('');
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message
        : 'キーワードの追加に失敗しました';
      setError(errorMessage);
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  }, [categoryName, jaText, enText, addKeyword, onClose]);

  /**
   * Handle cancel
   */
  const handleCancel = useCallback((): void => {
    setCategoryName('');
    setJaText('');
    setEnText('');
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

  if (!isOpen) return null;

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
            キーワードを追加
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

          {/* Category Selection */}
          <div style={{ marginBottom: '16px' }}>
            <label
              htmlFor="keyword-category"
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
            <select
              id="keyword-category"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: '14px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                background: '#fff'
              }}
            >
              <option value="">カテゴリーを選択</option>
              {allCategoryNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
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
            {isSaving ? '追加中...' : '追加'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddKeywordModal;
