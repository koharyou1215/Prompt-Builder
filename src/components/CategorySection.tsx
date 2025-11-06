/**
 * CategorySection Component
 * Displays a category with its keywords as chips
 * Includes add button for adding new keywords
 * Supports category-based color customization
 */

import React, { useState, useMemo } from 'react';
import type { CategoryGroup, PromptTarget, ColoredKeywordItem } from '../types';
import { usePromptContext } from '../contexts/PromptContext';
import { useCategoryColor } from '../contexts/CategoryColorContext';
import { KeywordChip } from './KeywordChip';
import AddKeywordModal from './AddKeywordModal';
import styles from './CategorySection.module.css';

interface CategorySectionProps {
  readonly category: CategoryGroup;
  readonly target: PromptTarget;
}

/**
 * CategorySection component
 */
export const CategorySection: React.FC<CategorySectionProps> = ({ category, target }) => {
  const { removeKeywordFromCategory } = usePromptContext();
  const { getCategoryColor } = useCategoryColor();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Add color information to keywords
  const coloredKeywords = useMemo<ReadonlyArray<ColoredKeywordItem>>(() => {
    const color = getCategoryColor(category.categoryName);
    return category.keywords.map(keyword => ({
      ...keyword,
      color,
    }));
  }, [category.keywords, category.categoryName, getCategoryColor]);

  const handleDeleteKeyword = (keyword: string): void => {
    removeKeywordFromCategory(target, category.categoryName, keyword);
  };

  const handleAddClick = (): void => {
    setIsModalOpen(true);
  };

  const handleModalClose = (): void => {
    setIsModalOpen(false);
  };

  return (
    <>
      <div className={styles.section}>
        <h3 className={styles.title}>{category.categoryName}</h3>
        <div className={styles.chipList}>
          {coloredKeywords.map((keyword) => (
            <KeywordChip
              key={`${keyword.keyword}-${keyword.order}`}
              keyword={keyword}
              onDelete={() => handleDeleteKeyword(keyword.keyword)}
            />
          ))}
          <button
            type="button"
            className={styles.addButton}
            onClick={handleAddClick}
            title="キーワードを追加"
          >
            <span className={styles.addIcon}>+</span>
            <span className={styles.addText}>追加</span>
          </button>
        </div>
      </div>

      {/* AddKeywordModal */}
      <AddKeywordModal isOpen={isModalOpen} onClose={handleModalClose} />
    </>
  );
};

export default CategorySection;
