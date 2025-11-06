/**
 * KeywordSelector component
 * Displays keyword categories and buttons for easy prompt building
 * Clicking a keyword appends it to the prompt with comma separator
 * Includes custom keywords added by user
 */

import React from 'react';
import { usePromptContext } from '../contexts/PromptContext';
import { useCustomKeywords } from '../hooks/useCustomKeywords';
import styles from './KeywordSelector.module.css';

const KeywordSelector: React.FC = () => {
  const { appendKeyword } = usePromptContext();
  const { allCategories, isLoading } = useCustomKeywords();

  const handleKeywordClick = (keyword: string): void => {
    appendKeyword('positive', keyword);
  };

  if (isLoading) {
    return (
      <div className={styles.loading}>
        読み込み中...
      </div>
    );
  }

  return (
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
              {category.keywords.map((keyword) => (
                <button
                  key={keyword.en}
                  onClick={() => handleKeywordClick(keyword.en)}
                  className={styles.keywordButton}
                  title={keyword.en}
                >
                  {keyword.ja}
                </button>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};

export default KeywordSelector;
