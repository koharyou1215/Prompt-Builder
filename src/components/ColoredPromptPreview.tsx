/**
 * ColoredPromptPreview Component
 *
 * Displays prompt text with color-coded keywords based on category.
 * Provides visual feedback for prompt organization.
 * Supports collapsible view to maximize editing space.
 */

import React, { useMemo, useState, useCallback } from 'react';
import { useCategoryColor } from '../contexts/CategoryColorContext';
import { parsePromptWithColors } from '../utils/promptColorParser';
import { keywordCategories } from '../data/keywords';
import styles from './ColoredPromptPreview.module.css';

interface ColoredPromptPreviewProps {
  readonly promptText: string;
}

/**
 * ColoredPromptPreview component
 * Renders prompt with category-based color highlighting
 * Collapsible to save screen space and improve editing workflow
 */
export const ColoredPromptPreview: React.FC<ColoredPromptPreviewProps> = ({ promptText }) => {
  const { colorConfigs } = useCategoryColor();
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Parse prompt and attach colors
  const segments = useMemo(() => {
    return parsePromptWithColors(promptText, keywordCategories, colorConfigs);
  }, [promptText, colorConfigs]);

  const toggleExpanded = useCallback((): void => {
    setIsExpanded(prev => !prev);
  }, []);

  // Empty state
  if (segments.length === 0) {
    return (
      <div className={styles.preview}>
        <div className={styles.header}>
          <span className={styles.title}>📝 プレビュー</span>
          <button
            type="button"
            className={styles.toggleButton}
            onClick={toggleExpanded}
            aria-label={isExpanded ? 'プレビューを閉じる' : 'プレビューを開く'}
            title={isExpanded ? 'プレビューを閉じる' : 'プレビューを開く'}
          >
            {isExpanded ? '▼' : '▶'}
          </button>
        </div>
        {isExpanded && (
          <div className={styles.empty}>プロンプトを入力するとカラープレビューが表示されます</div>
        )}
      </div>
    );
  }

  return (
    <div className={styles.preview}>
      <div className={styles.header}>
        <span className={styles.title}>📝 プレビュー</span>
        <div className={styles.headerRight}>
          <span className={styles.count}>{segments.length} キーワード</span>
          <button
            type="button"
            className={styles.toggleButton}
            onClick={toggleExpanded}
            aria-label={isExpanded ? 'プレビューを閉じる' : 'プレビューを開く'}
            title={isExpanded ? 'プレビューを閉じる' : 'プレビューを開く'}
          >
            {isExpanded ? '▼' : '▶'}
          </button>
        </div>
      </div>
      {isExpanded && (
        <div className={styles.content}>
          {segments.map((segment, index) => (
            <React.Fragment key={index}>
              <span
                className={styles.segment}
                style={segment.color ? { color: segment.color, fontWeight: 600 } : {}}
                title={segment.category ? `${segment.category}` : 'カテゴリーなし'}
              >
                {segment.text}
              </span>
              {index < segments.length - 1 && <span className={styles.separator}>, </span>}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};

export default ColoredPromptPreview;
