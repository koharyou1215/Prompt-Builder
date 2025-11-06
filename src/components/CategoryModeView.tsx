/**
 * CategoryModeView Component
 * Main view for category mode
 * Displays categorized keywords with add/delete functionality
 */

import React from 'react';
import { usePromptContext } from '../contexts/PromptContext';
import { CategorySection } from './CategorySection';
import { PromptBuilder } from '../utils/promptBuilder';
import styles from './CategoryModeView.module.css';

/**
 * CategoryModeView component
 */
export const CategoryModeView: React.FC = () => {
  const { categoryState, mode, switchMode } = usePromptContext();

  // Debug logging
  React.useEffect(() => {
    console.log('[CategoryModeView] mode:', mode);
    console.log('[CategoryModeView] categoryState:', categoryState);
  }, [mode, categoryState]);

  // Build preview text
  const builder = React.useMemo(() => new PromptBuilder(), []);
  const previewText = React.useMemo(() => {
    return builder.build(categoryState, 'positive');
  }, [categoryState, builder]);

  if (mode !== 'category') {
    console.log('[CategoryModeView] Not in category mode, returning null');
    return null;
  }

  const handleSwitchToText = (): void => {
    switchMode('text');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>カテゴリ管理モード</h2>
        <button
          type="button"
          className={styles.switchButton}
          onClick={handleSwitchToText}
          title="テキストモードに切り替え"
        >
          テキストモードへ
        </button>
      </div>

      <div className={styles.content}>
        {categoryState.positive.length === 0 && categoryState.uncategorized.length === 0 ? (
          <div className={styles.empty}>
            <p>プロンプトを入力して翻訳すると、カテゴリ別に表示されます。</p>
          </div>
        ) : (
          <>
            {/* Positive categories */}
            {categoryState.positive.map((category) => (
              <CategorySection key={category.categoryName} category={category} target="positive" />
            ))}

            {/* Uncategorized keywords */}
            {categoryState.uncategorized.length > 0 && (
              <div className={styles.section}>
                <h3 className={styles.uncategorizedTitle}>その他</h3>
                <div className={styles.uncategorizedList}>
                  {categoryState.uncategorized.map((keyword, index) => (
                    <span key={`${keyword}-${index}`} className={styles.uncategorizedChip}>
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Preview */}
      {previewText && (
        <div className={styles.preview}>
          <h3 className={styles.previewTitle}>プレビュー</h3>
          <div className={styles.previewText}>{previewText}</div>
        </div>
      )}
    </div>
  );
};

export default CategoryModeView;
