/**
 * KeywordChip Component
 * Displays a single keyword as a chip with delete button
 * iOS-styled design with touch-friendly interactions
 * Supports category-based color customization
 */

import React from 'react';
import type { ColoredKeywordItem } from '../types';
import styles from './KeywordChip.module.css';

interface KeywordChipProps {
  readonly keyword: ColoredKeywordItem;
  readonly onDelete: () => void;
}

/**
 * KeywordChip component displays keyword with optional weight and color
 * Memoized to prevent unnecessary re-renders
 */
export const KeywordChip: React.FC<KeywordChipProps> = React.memo(({ keyword, onDelete }) => {
  const displayText = keyword.weight ? `${keyword.ja}${keyword.weight}` : keyword.ja;

  // Apply custom color if specified, otherwise use default blue
  const chipStyle: React.CSSProperties = keyword.color
    ? { backgroundColor: keyword.color }
    : {};

  return (
    <div className={styles.chip} style={chipStyle} title={keyword.keyword}>
      <span className={styles.text}>{displayText}</span>
      <button
        type="button"
        className={styles.deleteButton}
        onClick={onDelete}
        aria-label={`${keyword.ja}を削除`}
      >
        ×
      </button>
    </div>
  );
});

// Set display name for React DevTools
KeywordChip.displayName = 'KeywordChip';

export default KeywordChip;
