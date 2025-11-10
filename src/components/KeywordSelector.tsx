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
import styles from './KeywordSelector.module.css';

const KeywordSelector: React.FC = () => {
  const { appendKeyword } = usePromptContext();
  const {
    allCategories,
    deleteKeyword,
    moveCategoryUp,
    moveCategoryDown,
    isLoading
  } = useCustomKeywords();
  const [editingKeyword, setEditingKeyword] = useState<{ categoryName: string; ja: string; en: string } | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

  const handleKeywordClick = (keyword: string): void => {
    appendKeyword('positive', keyword);
  };

  /**
   * Handle edit button click
   */
  const handleEdit = useCallback((categoryName: string, keyword: { ja: string; en: string }): void => {
    setEditingKeyword({ categoryName, ja: keyword.ja, en: keyword.en });
    setIsEditModalOpen(true);
  }, []);

  /**
   * Handle delete button click
   */
  const handleDelete = useCallback(async (categoryName: string, keyword: { ja: string; en: string }): Promise<void> => {
    try {
      await deleteKeyword(categoryName, keyword.en);
    } catch (err) {
      console.error('Failed to delete keyword:', err);
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
          {allCategories.map((category, categoryIndex) => (
            <div key={category.categoryName} className={styles.category}>
              <div className={styles.categoryHeader}>
                <h3 className={styles.categoryTitle}>
                  {category.categoryName}
                </h3>
                <div className={styles.categoryControls}>
                  <button
                    onClick={() => void moveCategoryUp(category.categoryName)}
                    className={styles.categoryMoveButton}
                    disabled={categoryIndex === 0}
                    title="カテゴリーを上に移動"
                    aria-label={`${category.categoryName}を上に移動`}
                  >
                    ⬆️
                  </button>
                  <button
                    onClick={() => void moveCategoryDown(category.categoryName)}
                    className={styles.categoryMoveButton}
                    disabled={categoryIndex === allCategories.length - 1}
                    title="カテゴリーを下に移動"
                    aria-label={`${category.categoryName}を下に移動`}
                  >
                    ⬇️
                  </button>
                </div>
              </div>
              <div className={styles.keywordList}>
                {category.keywords.map((keyword) => (
                  <div key={keyword.en} className={styles.keywordWrapper}>
                    <button
                      onClick={() => handleKeywordClick(keyword.en)}
                      className={styles.keywordButton}
                      title={keyword.en}
                    >
                      {keyword.ja}
                    </button>
                    <div className={styles.keywordActions}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(category.categoryName, keyword);
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
                          void handleDelete(category.categoryName, keyword);
                        }}
                        className={styles.deleteButton}
                        title="削除"
                        aria-label={`${keyword.ja}を削除`}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
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
