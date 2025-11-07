/**
 * CategoryManagementModal component
 * Modal dialog for managing custom categories and keywords
 *
 * Features:
 * - Create custom categories
 * - Reorder categories (up/down buttons)
 * - Delete categories
 * - View and delete keywords within categories
 */

import React, { useState, useCallback } from 'react';
import { useCategoryManagement } from '../hooks/useCategoryManagement';
import { useCustomKeywords } from '../hooks/useCustomKeywords';

interface CategoryManagementModalProps {
  readonly isOpen: boolean;
  onClose: () => void;
}

const CategoryManagementModal: React.FC<CategoryManagementModalProps> = ({ isOpen, onClose }) => {
  const { customCategories, addCategory, deleteCategory, reorderCategories } = useCategoryManagement();
  const { customKeywords, deleteKeyword, reorderKeywords } = useCustomKeywords();

  const [newCategoryName, setNewCategoryName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  /**
   * Handle add category
   */
  const handleAddCategory = useCallback(async (): Promise<void> => {
    setError(null);

    try {
      if (!newCategoryName.trim()) {
        throw new Error('カテゴリー名を入力してください');
      }

      await addCategory(newCategoryName);
      setNewCategoryName('');
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message
        : 'カテゴリーの追加に失敗しました';
      setError(errorMessage);
      console.error(err);
    }
  }, [newCategoryName, addCategory]);

  /**
   * Handle delete category
   */
  const handleDeleteCategory = useCallback(async (id: string, categoryName: string): Promise<void> => {
    if (!window.confirm(`カテゴリー「${categoryName}」を削除しますか？\nこのカテゴリー内のキーワードも削除されます。`)) {
      return;
    }

    setError(null);

    try {
      // Delete all keywords in this category first
      const keywordsInCategory = customKeywords.filter((kw) => kw.categoryName === categoryName);
      for (const keyword of keywordsInCategory) {
        await deleteKeyword(keyword.id);
      }

      // Then delete the category
      await deleteCategory(id);
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message
        : 'カテゴリーの削除に失敗しました';
      setError(errorMessage);
      console.error(err);
    }
  }, [customKeywords, deleteKeyword, deleteCategory]);

  /**
   * Handle move category up
   */
  const handleMoveUp = useCallback(async (index: number): Promise<void> => {
    if (index === 0) return;

    const reordered = [...customCategories];
    const temp = reordered[index];
    reordered[index] = reordered[index - 1]!;
    reordered[index - 1] = temp!;

    await reorderCategories(reordered);
  }, [customCategories, reorderCategories]);

  /**
   * Handle move category down
   */
  const handleMoveDown = useCallback(async (index: number): Promise<void> => {
    if (index === customCategories.length - 1) return;

    const reordered = [...customCategories];
    const temp = reordered[index];
    reordered[index] = reordered[index + 1]!;
    reordered[index + 1] = temp!;

    await reorderCategories(reordered);
  }, [customCategories, reorderCategories]);

  /**
   * Handle delete keyword
   */
  const handleDeleteKeyword = useCallback(async (keywordId: string, keywordJa: string): Promise<void> => {
    if (!window.confirm(`キーワード「${keywordJa}」を削除しますか？`)) {
      return;
    }

    setError(null);

    try {
      await deleteKeyword(keywordId);
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message
        : 'キーワードの削除に失敗しました';
      setError(errorMessage);
      console.error(err);
    }
  }, [deleteKeyword]);

  /**
   * Handle move keyword up
   */
  const handleMoveKeywordUp = useCallback(async (categoryName: string, index: number): Promise<void> => {
    if (index === 0) return;

    const keywordsInCategory = customKeywords
      .filter((kw) => kw.categoryName === categoryName)
      .sort((a, b) => a.order - b.order);

    const reordered = [...keywordsInCategory];
    const temp = reordered[index];
    reordered[index] = reordered[index - 1]!;
    reordered[index - 1] = temp!;

    await reorderKeywords(categoryName, reordered);
  }, [customKeywords, reorderKeywords]);

  /**
   * Handle move keyword down
   */
  const handleMoveKeywordDown = useCallback(async (categoryName: string, index: number, totalCount: number): Promise<void> => {
    if (index === totalCount - 1) return;

    const keywordsInCategory = customKeywords
      .filter((kw) => kw.categoryName === categoryName)
      .sort((a, b) => a.order - b.order);

    const reordered = [...keywordsInCategory];
    const temp = reordered[index];
    reordered[index] = reordered[index + 1]!;
    reordered[index + 1] = temp!;

    await reorderKeywords(categoryName, reordered);
  }, [customKeywords, reorderKeywords]);

  /**
   * Toggle category expansion
   */
  const toggleCategory = useCallback((categoryId: string): void => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  }, []);

  /**
   * Handle cancel
   */
  const handleCancel = useCallback((): void => {
    setNewCategoryName('');
    setError(null);
    setExpandedCategories(new Set());
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

  // Sort categories by order
  const sortedCategories = [...customCategories].sort((a, b) => a.order - b.order);

  return (
    <div
      onClick={handleBackgroundClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          padding: '24px',
          maxWidth: '600px',
          width: '90%',
          maxHeight: '80vh',
          overflow: 'auto',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: '20px' }}>カテゴリー管理</h2>

        {/* Add Category Section */}
        <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '16px' }}>新しいカテゴリーを追加</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="カテゴリー名"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  void handleAddCategory();
                }
              }}
              style={{
                flex: 1,
                padding: '8px',
                fontSize: '14px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
              }}
            />
            <button
              onClick={() => void handleAddCategory()}
              disabled={!newCategoryName.trim()}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                background: newCategoryName.trim() ? '#3b82f6' : '#d1d5db',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: newCategoryName.trim() ? 'pointer' : 'not-allowed',
              }}
            >
              追加
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#fee', borderRadius: '4px', color: '#c00' }}>
            {error}
          </div>
        )}

        {/* Categories List */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '16px' }}>カスタムカテゴリー一覧</h3>
          {sortedCategories.length === 0 ? (
            <div style={{ padding: '16px', textAlign: 'center', color: '#6b7280' }}>
              カスタムカテゴリーはまだありません
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {sortedCategories.map((category, index) => {
                const keywordsInCategory = customKeywords
                  .filter((kw) => kw.categoryName === category.categoryName)
                  .sort((a, b) => a.order - b.order);
                const isExpanded = expandedCategories.has(category.id);

                return (
                  <div
                    key={category.id}
                    style={{
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      padding: '12px',
                      backgroundColor: '#fff',
                    }}
                  >
                    {/* Category Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {/* Expand/Collapse Button */}
                      <button
                        onClick={() => toggleCategory(category.id)}
                        style={{
                          padding: '4px 8px',
                          fontSize: '12px',
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                        title={isExpanded ? '折りたたむ' : '展開する'}
                      >
                        {isExpanded ? '▼' : '▶'}
                      </button>

                      {/* Category Name */}
                      <span style={{ flex: 1, fontWeight: 'bold' }}>
                        {category.categoryName}
                        <span style={{ marginLeft: '8px', fontSize: '12px', color: '#6b7280' }}>
                          ({keywordsInCategory.length} キーワード)
                        </span>
                      </span>

                      {/* Action Buttons */}
                      <button
                        onClick={() => void handleMoveUp(index)}
                        disabled={index === 0}
                        style={{
                          padding: '4px 8px',
                          fontSize: '12px',
                          background: index === 0 ? '#e5e7eb' : '#3b82f6',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: index === 0 ? 'not-allowed' : 'pointer',
                        }}
                        title="上に移動"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => void handleMoveDown(index)}
                        disabled={index === sortedCategories.length - 1}
                        style={{
                          padding: '4px 8px',
                          fontSize: '12px',
                          background: index === sortedCategories.length - 1 ? '#e5e7eb' : '#3b82f6',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: index === sortedCategories.length - 1 ? 'not-allowed' : 'pointer',
                        }}
                        title="下に移動"
                      >
                        ↓
                      </button>
                      <button
                        onClick={() => void handleDeleteCategory(category.id, category.categoryName)}
                        style={{
                          padding: '4px 8px',
                          fontSize: '12px',
                          background: '#ef4444',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                        title="削除"
                      >
                        🗑️
                      </button>
                    </div>

                    {/* Category Keywords (Expanded) */}
                    {isExpanded && (
                      <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e5e7eb' }}>
                        {keywordsInCategory.length === 0 ? (
                          <div style={{ padding: '8px', textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
                            このカテゴリーにはまだキーワードがありません
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {keywordsInCategory.map((keyword, kwIndex) => (
                              <div
                                key={keyword.id}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  padding: '6px',
                                  backgroundColor: '#f9fafb',
                                  borderRadius: '4px',
                                  fontSize: '14px',
                                }}
                              >
                                <span style={{ flex: 1 }}>
                                  {keyword.ja} <span style={{ color: '#6b7280' }}>({keyword.en})</span>
                                </span>
                                <button
                                  onClick={() => void handleMoveKeywordUp(category.categoryName, kwIndex)}
                                  disabled={kwIndex === 0}
                                  style={{
                                    padding: '2px 8px',
                                    fontSize: '12px',
                                    background: kwIndex === 0 ? '#e5e7eb' : '#3b82f6',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: kwIndex === 0 ? 'not-allowed' : 'pointer',
                                  }}
                                  title="上に移動"
                                >
                                  ↑
                                </button>
                                <button
                                  onClick={() => void handleMoveKeywordDown(category.categoryName, kwIndex, keywordsInCategory.length)}
                                  disabled={kwIndex === keywordsInCategory.length - 1}
                                  style={{
                                    padding: '2px 8px',
                                    fontSize: '12px',
                                    background: kwIndex === keywordsInCategory.length - 1 ? '#e5e7eb' : '#3b82f6',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: kwIndex === keywordsInCategory.length - 1 ? 'not-allowed' : 'pointer',
                                  }}
                                  title="下に移動"
                                >
                                  ↓
                                </button>
                                <button
                                  onClick={() => void handleDeleteKeyword(keyword.id, keyword.ja)}
                                  style={{
                                    padding: '2px 8px',
                                    fontSize: '12px',
                                    background: '#ef4444',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                  }}
                                  title="削除"
                                >
                                  削除
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Close Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={handleCancel}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              background: '#6b7280',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryManagementModal;
