/**
 * KeywordSelector component
 * Displays keyword categories and buttons for easy prompt building
 * Clicking a keyword appends it to the prompt with comma separator
 * Includes custom keywords added by user
 */

import React, { useState, useCallback } from 'react';
import { usePromptContext } from '../contexts/PromptContext';
import { useCustomKeywords } from '../hooks/useCustomKeywords';
import EditKeywordModal from './EditKeywordModal';
import type { CustomKeyword } from '../types';
import styles from './KeywordSelector.module.css';

const KeywordSelector: React.FC = () => {
  const { appendKeyword } = usePromptContext();
  const { allCategories, customKeywords, deleteKeyword, isLoading } = useCustomKeywords();
  const [editingKeyword, setEditingKeyword] = useState<CustomKeyword | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

  const handleKeywordClick = (keyword: string): void => {
    appendKeyword('positive', keyword);
  };

  /**
   * Check if a keyword is custom (editable/deletable)
   */
  const isCustomKeyword = useCallback((en: string): CustomKeyword | undefined => {
    return customKeywords.find((kw) => kw.en === en);
  }, [customKeywords]);

  /**
   * Handle edit button click
   */
  const handleEdit = useCallback((keyword: CustomKeyword): void => {
    setEditingKeyword(keyword);
    setIsEditModalOpen(true);
  }, []);

  /**
   * Handle delete button click
   */
  const handleDelete = useCallback(async (keyword: CustomKeyword): Promise<void> => {
    if (window.confirm(`「${keyword.ja}」を削除しますか？`)) {
      try {
        await deleteKeyword(keyword.id);
      } catch (err) {
        console.error('Failed to delete keyword:', err);
      }
    }
  }, [deleteKeyword]);

  /**
   * Handle edit modal close
   */
  const handleEditModalClose = useCallback((): void => {
    setIsEditModalOpen(false);
    setEditingKeyword(null);
  }, []);

  if (isLoading) {
    return (
      <div className={styles.loading}>
        読み込み中...
      </div>
    );
  }

  return (
    <>
      <div className="keyword-selector">
        {/* Positive Keywords (Default + Custom) */}
        <section className={styles.keywordSection}>
          <h2 className={styles.sectionTitle}>
            ポジティブキーワード
          </h2>
          {allCategories.map((category) => (
            <div key={category.categoryName} className={styles.category}>
              <h3 className={styles.categoryTitle}>
                {category.categoryName}
              </h3>
              <div className={styles.keywordList}>
                {category.keywords.map((keyword) => {
                  const customKw = isCustomKeyword(keyword.en);
                  return (
                    <div key={keyword.en} className={styles.keywordWrapper}>
                      <button
                        onClick={() => handleKeywordClick(keyword.en)}
                        className={styles.keywordButton}
                        title={keyword.en}
                      >
                        {keyword.ja}
                      </button>
                      {customKw && (
                        <div className={styles.keywordActions}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(customKw);
                            }}
                            className={styles.editButton}
                            title="編集"
                            aria-label={`${keyword.ja}を編集`}
                          >
                            ✏️
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              void handleDelete(customKw);
                            }}
                            className={styles.deleteButton}
                            title="削除"
                            aria-label={`${keyword.ja}を削除`}
                          >
                            🗑️
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </section>
      </div>

      {/* Edit Modal */}
      <EditKeywordModal
        isOpen={isEditModalOpen}
        keyword={editingKeyword}
        onClose={handleEditModalClose}
      />
    </>
  );
};

export default KeywordSelector;
