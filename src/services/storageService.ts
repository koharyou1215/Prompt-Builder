/**
 * Storage API Service with Chrome Extension and Web Fallback
 *
 * Handles data persistence:
 * - Chrome Extension: Uses chrome.storage.local
 * - Web/Development: Falls back to localStorage
 * - Auto-save: Current prompt state
 * - History: Saved prompt snapshots
 */

import type {
  StorageKey,
  StorageData,
  StorageServiceResponse,
  AppError,
  CategoryColorConfig
} from '../types';
import { StorageKeys } from '../types';
import { MAX_HISTORY_ENTRIES } from '../constants';
import { createScopedLogger } from '../utils/logger';

/**
 * Logger instance
 */
const logger = createScopedLogger('StorageService');

/**
 * Check if Chrome Extension API is available
 * Exported for use in other contexts (e.g., SettingsContext)
 */
export const isChromeExtension = (): boolean => {
  return typeof chrome !== 'undefined' &&
         typeof chrome.storage !== 'undefined' &&
         typeof chrome.storage.local !== 'undefined';
};

/**
 * Load data from Chrome Storage
 *
 * @template T - Type of data to load
 * @param key - Storage key
 * @returns Response containing data or error
 *
 * @example
 * ```typescript
 * const response = await loadFromStorage<PromptState>(StorageKeys.AUTO_SAVE);
 * if (response.success && response.data) {
 *   console.log(response.data.positive);
 * }
 * ```
 */
export const loadFromStorage = async <T>(
  key: StorageKey
): Promise<StorageServiceResponse<T>> => {
  try {
    let result: Record<string, unknown>;

    if (isChromeExtension()) {
      // Use Chrome Storage API
      result = await chrome.storage.local.get(key);
    } else {
      // Fallback to localStorage
      const storedValue = localStorage.getItem(key);
      result = storedValue ? { [key]: JSON.parse(storedValue) } : {};
    }

    if (result[key] !== undefined) {
      return {
        success: true,
        data: result[key] as T
      };
    }

    // Data does not exist
    return {
      success: true,
      data: undefined
    };
  } catch (error) {
    // Error handling
    const appError: AppError = {
      type: 'storage',
      message: `ストレージからの読み込みに失敗しました（キー: ${key}）`,
      originalError: error instanceof Error ? error : undefined
    };

    logger.error('Storage load error', appError);

    return {
      success: false,
      error: appError
    };
  }
};

/**
 * Save data to Chrome Storage or localStorage
 *
 * @template K - Storage key type
 * @param key - Storage key
 * @param data - Data to save
 * @returns Response indicating success or error
 *
 * @example
 * ```typescript
 * const promptState: PromptState = {
 *   positive: 'masterpiece',
 *   negative: 'low quality'
 * };
 * await saveToStorage(StorageKeys.AUTO_SAVE, promptState);
 * ```
 */
export const saveToStorage = async <K extends StorageKey>(
  key: K,
  data: StorageData[K]
): Promise<StorageServiceResponse<void>> => {
  try {
    if (isChromeExtension()) {
      // Save data to Chrome Storage API
      await chrome.storage.local.set({ [key]: data });
    } else {
      // Fallback to localStorage
      localStorage.setItem(key, JSON.stringify(data));
    }

    return {
      success: true
    };
  } catch (error) {
    // Error handling
    const appError: AppError = {
      type: 'storage',
      message: `ストレージへの保存に失敗しました（キー: ${key}）`,
      originalError: error instanceof Error ? error : undefined
    };

    logger.error('Storage save error', appError);

    return {
      success: false,
      error: appError
    };
  }
};

/**
 * Remove data from Chrome Storage or localStorage
 *
 * @param key - Storage key to remove
 * @returns Response indicating success or error
 *
 * @example
 * ```typescript
 * await removeFromStorage(StorageKeys.AUTO_SAVE);
 * ```
 */
export const removeFromStorage = async (
  key: StorageKey
): Promise<StorageServiceResponse<void>> => {
  try {
    if (isChromeExtension()) {
      await chrome.storage.local.remove(key);
    } else {
      localStorage.removeItem(key);
    }

    return {
      success: true
    };
  } catch (error) {
    const appError: AppError = {
      type: 'storage',
      message: `ストレージからの削除に失敗しました（キー: ${key}）`,
      originalError: error instanceof Error ? error : undefined
    };

    logger.error('Storage remove error', appError);

    return {
      success: false,
      error: appError
    };
  }
};

/**
 * Clear all data from Chrome Storage or localStorage
 *
 * @returns Response indicating success or error
 *
 * ⚠️ Warning: This operation cannot be undone
 */
export const clearAllStorage = async (): Promise<StorageServiceResponse<void>> => {
  try {
    if (isChromeExtension()) {
      await chrome.storage.local.clear();
    } else {
      localStorage.clear();
    }

    return {
      success: true
    };
  } catch (error) {
    const appError: AppError = {
      type: 'storage',
      message: 'ストレージのクリアに失敗しました',
      originalError: error instanceof Error ? error : undefined
    };

    logger.error('Storage clear error', appError);

    return {
      success: false,
      error: appError
    };
  }
};

/**
 * Get storage usage in bytes
 *
 * @returns Bytes in use
 */
export const getStorageUsage = async (): Promise<number> => {
  try {
    if (isChromeExtension()) {
      const bytesInUse = await chrome.storage.local.getBytesInUse();
      return bytesInUse;
    } else {
      // Estimate localStorage usage
      let totalSize = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          totalSize += localStorage[key].length + key.length;
        }
      }
      // Convert characters to bytes (UTF-16 = 2 bytes per character)
      return totalSize * 2;
    }
  } catch (error) {
    logger.error('Failed to get storage usage', error);
    return 0;
  }
};

/**
 * Get storage quota (maximum capacity)
 *
 * @returns Maximum storage capacity in bytes
 */
export const getStorageQuota = (): number => {
  if (isChromeExtension()) {
    // Chrome Storage Local quota is 10MB
    return chrome.storage.local.QUOTA_BYTES;
  } else {
    // localStorage typical quota is 5-10MB, use 5MB as conservative estimate
    return 5 * 1024 * 1024; // 5MB
  }
};

/**
 * Get storage usage ratio (0-1 range)
 *
 * @returns Usage ratio (0.0 = 0%, 1.0 = 100%)
 */
export const getStorageUsageRatio = async (): Promise<number> => {
  const usage = await getStorageUsage();
  const quota = getStorageQuota();

  return usage / quota;
};

/**
 * Clean up old history entries (keep last 50)
 *
 * @returns Response indicating success or error
 */
export const cleanupOldHistory = async (): Promise<StorageServiceResponse<void>> => {
  const response = await loadFromStorage<ReadonlyArray<StorageData['history'][number]>>(
    'history' as StorageKey
  );

  if (!response.success || !response.data) {
    return { success: true }; // Nothing to clean
  }

  // Keep only the last MAX_HISTORY_ENTRIES entries
  const trimmedHistory = response.data.slice(0, MAX_HISTORY_ENTRIES);

  return await saveToStorage('history' as StorageKey, trimmedHistory);
};

// ===== Category Color Storage =====

/**
 * Load category color configuration from storage
 *
 * @returns Response containing category color configs or error
 */
export const loadCategoryColors = async (): Promise<
  StorageServiceResponse<ReadonlyArray<CategoryColorConfig>>
> => {
  try {
    logger.info('Loading category colors from storage');

    const result = await loadFromStorage<ReadonlyArray<CategoryColorConfig>>(
      StorageKeys.CATEGORY_COLORS
    );

    if (result.success && result.data) {
      logger.info(`Loaded ${result.data.length} category color configs`);
      return result;
    }

    // Return empty array if no data found
    logger.info('No category colors found, returning empty array');
    return {
      success: true,
      data: [],
    };
  } catch (error) {
    logger.error('Failed to load category colors:', error);
    return {
      success: false,
      error: {
        type: 'storage',
        message: 'カテゴリーカラー設定の読み込みに失敗しました。',
        originalError: error instanceof Error ? error : undefined,
      },
    };
  }
};

/**
 * Save category color configuration to storage
 *
 * @param configs - Category color configurations to save
 * @returns Response indicating success or error
 */
export const saveCategoryColors = async (
  configs: ReadonlyArray<CategoryColorConfig>
): Promise<StorageServiceResponse<void>> => {
  try {
    logger.info(`Saving ${configs.length} category color configs to storage`);

    const result = await saveToStorage(StorageKeys.CATEGORY_COLORS, configs);

    if (result.success) {
      logger.info('Category colors saved successfully');
    }

    return result;
  } catch (error) {
    logger.error('Failed to save category colors:', error);
    return {
      success: false,
      error: {
        type: 'storage',
        message: 'カテゴリーカラー設定の保存に失敗しました。',
        originalError: error instanceof Error ? error : undefined,
      },
    };
  }
};
