/**
 * CategoryColorSettings Component
 *
 * Provides UI for configuring category colors.
 * Displays all categories with color pickers and reset functionality.
 */

import React, { useState } from 'react';
import { useCategoryColor } from '../contexts/CategoryColorContext';
import { extractCategoryNames } from '../services/categoryColorService';
import { keywordCategories, negativeKeywordCategories } from '../data/keywords';
import { ColorPicker } from './ColorPicker';
import styles from './CategoryColorSettings.module.css';

/**
 * CategoryColorSettings Component
 */
export const CategoryColorSettings: React.FC = () => {
  const {
    colorConfigs,
    defaultConfigs,
    isLoading,
    updateColor,
    resetColor,
    resetAllColors,
    getCategoryColor,
  } = useCategoryColor();

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Extract all category names
  const allCategories = [...keywordCategories, ...negativeKeywordCategories];
  const categoryNames = extractCategoryNames(allCategories);

  /**
   * Toggle category expansion
   */
  const toggleCategory = (categoryName: string): void => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryName)) {
        next.delete(categoryName);
      } else {
        next.add(categoryName);
      }
      return next;
    });
  };

  /**
   * Handle color change
   */
  const handleColorChange = async (categoryName: string, color: string): Promise<void> => {
    await updateColor(categoryName, color);
  };

  /**
   * Handle reset individual category
   */
  const handleReset = async (categoryName: string): Promise<void> => {
    await resetColor(categoryName);
  };

  /**
   * Handle reset all categories
   */
  const handleResetAll = async (): Promise<void> => {
    const confirmed = window.confirm('すべてのカテゴリーカラーをデフォルトに戻しますか?');
    if (confirmed) {
      await resetAllColors();
    }
  };

  /**
   * Get default color for a category
   */
  const getDefaultColor = (categoryName: string): string | undefined => {
    return defaultConfigs.find(c => c.categoryName === categoryName)?.color;
  };

  /**
   * Check if category has custom color
   */
  const isCustomColor = (categoryName: string): boolean => {
    return colorConfigs.find(c => c.categoryName === categoryName)?.isCustom ?? false;
  };

  if (isLoading) {
    return <div className={styles.loading}>カラー設定を読み込み中...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>カテゴリーカラー設定</h3>
        <button
          type="button"
          onClick={handleResetAll}
          className={styles.resetAllButton}
        >
          すべてリセット
        </button>
      </div>

      <p className={styles.description}>
        各カテゴリーのキーワードに表示されるカラーを設定できます
      </p>

      <div className={styles.categoryList}>
        {categoryNames.map((categoryName) => {
          const currentColor = getCategoryColor(categoryName) || getDefaultColor(categoryName) || '#3B82F6';
          const isExpanded = expandedCategories.has(categoryName);
          const isCustom = isCustomColor(categoryName);

          return (
            <div key={categoryName} className={styles.categoryItem}>
              <div className={styles.categoryHeader}>
                <button
                  type="button"
                  onClick={() => toggleCategory(categoryName)}
                  className={styles.categoryToggle}
                  aria-expanded={isExpanded}
                >
                  <span
                    className={styles.colorPreview}
                    style={{ backgroundColor: currentColor }}
                  />
                  <span className={styles.categoryName}>{categoryName}</span>
                  {isCustom && <span className={styles.customBadge}>カスタム</span>}
                  <span className={styles.toggleIcon}>
                    {isExpanded ? '▼' : '▶'}
                  </span>
                </button>

                {isExpanded && (
                  <button
                    type="button"
                    onClick={() => handleReset(categoryName)}
                    className={styles.resetButton}
                    disabled={!isCustom}
                  >
                    リセット
                  </button>
                )}
              </div>

              {isExpanded && (
                <div className={styles.colorPickerContainer}>
                  <ColorPicker
                    value={currentColor}
                    onChange={(color) => handleColorChange(categoryName, color)}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryColorSettings;
