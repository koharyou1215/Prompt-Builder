/**
 * Formatting Utility Functions
 *
 * Common formatting functions for dates, strings, etc.
 */

/**
 * Format timestamp for history display (Japanese locale)
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Formatted date string (YYYY/MM/DD HH:MM)
 */
export const formatHistoryDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Truncate text with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation (default: 50)
 * @returns Truncated text with ellipsis if needed
 *
 * @example
 * ```ts
 * truncateText('This is a long text', 10);
 * // => 'This is a ...'
 * ```
 */
export const truncateText = (text: string, maxLength: number = 50): string => {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.substring(0, maxLength)}...`;
};
