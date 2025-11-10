/**
 * ID Generation Utilities
 *
 * Centralized unique ID generation for consistent format across the application.
 * Format: [prefix-]timestamp-randomSuffix
 *
 * @example
 * ```typescript
 * generateId() // "1704067200000-a1b2c3d"
 * generateId('history') // "history-1704067200000-a1b2c3d"
 * generateId('custom') // "custom-1704067200000-a1b2c3d"
 * ```
 */

/**
 * Generate a unique ID with optional prefix
 *
 * Creates a collision-resistant ID using timestamp and random suffix.
 * The random suffix uses base-36 encoding for compact representation.
 *
 * @param prefix - Optional prefix to prepend to the ID (e.g., 'history', 'custom')
 * @returns Unique ID string in format: [prefix-]timestamp-randomSuffix
 *
 * @example
 * ```typescript
 * // Without prefix
 * const id = generateId();
 * console.log(id); // "1704067200000-a1b2c3d"
 *
 * // With prefix
 * const historyId = generateId('history');
 * console.log(historyId); // "history-1704067200000-a1b2c3d"
 * ```
 */
export const generateId = (prefix?: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);

  return prefix ? `${prefix}-${timestamp}-${random}` : `${timestamp}-${random}`;
};

/**
 * Generate a history entry ID
 *
 * Specialized version of generateId for history entries.
 * Provides consistent format for history-related IDs.
 *
 * @returns Unique history ID in format: "history-timestamp-randomSuffix"
 *
 * @example
 * ```typescript
 * const historyId = generateHistoryId();
 * console.log(historyId); // "history-1704067200000-a1b2c3d"
 * ```
 */
export const generateHistoryId = (): string => {
  return generateId('history');
};

/**
 * Generate a custom keyword ID
 *
 * Specialized version of generateId for custom keywords.
 * Provides consistent format for custom keyword IDs.
 *
 * @returns Unique custom keyword ID in format: "custom-timestamp-randomSuffix"
 *
 * @example
 * ```typescript
 * const keywordId = generateCustomKeywordId();
 * console.log(keywordId); // "custom-1704067200000-a1b2c3d"
 * ```
 */
export const generateCustomKeywordId = (): string => {
  return generateId('custom');
};

