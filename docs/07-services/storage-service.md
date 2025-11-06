# ストレージサービス設計

> **ドキュメント情報**
> 作成日: 2025-10-19
> カテゴリ: サービス層
> 関連: [状態管理](../03-state-management.md) | [型定義](../02-types-design.md) | [useHistory](../05-hooks/useHistory.md)

---

## 📖 概要

ストレージサービス（`storageService.ts`）は、Chrome Storage APIとの通信を担当するサービス層のモジュールです。

### 主な責務

- **データ永続化**: Chrome Storage APIへの保存・読み込み
- **型安全性**: TypeScriptによる完全な型付け
- **エラーハンドリング**: ストレージエラーの適切な処理
- **抽象化**: Chrome APIの複雑性を隠蔽

---

## 🏗️ ストレージ階層

```
React Component
     ↓
PromptContext / useHistory
     ↓
storageService.ts ← このレイヤー
     ↓
Chrome Storage API (chrome.storage.local)
```

---

## 📝 型定義

### StorageKeys（定数）

```typescript
export const StorageKeys = {
  AUTO_SAVE: 'autoSave',
  HISTORY: 'history',
  SETTINGS: 'settings'
} as const;

export type StorageKey = typeof StorageKeys[keyof typeof StorageKeys];
```

### StorageData（型マップ）

```typescript
export interface StorageData {
  [StorageKeys.AUTO_SAVE]: PromptState;
  [StorageKeys.HISTORY]: readonly HistoryEntry[];
  [StorageKeys.SETTINGS]: UserSettings;
}
```

### レスポンス型

```typescript
export interface StorageServiceResponse<T> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: AppError;
}
```

---

## 💻 実装

### 完全な実装（`src/services/storageService.ts`）

```typescript
/**
 * Chrome Storage API サービス
 * データの永続化を担当
 */

import {
  StorageKey,
  StorageServiceResponse,
  AppError,
  StorageData
} from '../types';

/**
 * Chrome Storageからデータを読み込む
 *
 * @template T - 読み込むデータの型
 * @param key - ストレージキー
 * @returns データまたはエラーを含むレスポンス
 *
 * @example
 * ```typescript
 * const response = await loadFromStorage<PromptState>(StorageKeys.AUTO_SAVE);
 * if (response.success && response.data) {
 *   console.log(response.data.positivePrompt);
 * }
 * ```
 */
export const loadFromStorage = async <T>(
  key: StorageKey
): Promise<StorageServiceResponse<T>> => {
  try {
    // Chrome Storage APIからデータ取得
    const result = await chrome.storage.local.get(key);

    if (result[key] !== undefined) {
      return {
        success: true,
        data: result[key] as T
      };
    }

    // データが存在しない場合
    return {
      success: true,
      data: undefined
    };
  } catch (error) {
    // エラーハンドリング
    const appError: AppError = {
      type: 'storage',
      message: `ストレージからの読み込みに失敗しました（キー: ${key}）`,
      originalError: error instanceof Error ? error : undefined
    };

    console.error('Storage load error:', appError);

    return {
      success: false,
      error: appError
    };
  }
};

/**
 * Chrome Storageにデータを保存する
 *
 * @template K - ストレージキーの型
 * @param key - ストレージキー
 * @param data - 保存するデータ
 * @returns 成功またはエラーを含むレスポンス
 *
 * @example
 * ```typescript
 * const promptState: PromptState = {
 *   positivePrompt: 'masterpiece',
 *   negativePrompt: 'low quality'
 * };
 * await saveToStorage(StorageKeys.AUTO_SAVE, promptState);
 * ```
 */
export const saveToStorage = async <K extends StorageKey>(
  key: K,
  data: StorageData[K]
): Promise<StorageServiceResponse<void>> => {
  try {
    // Chrome Storage APIにデータ保存
    await chrome.storage.local.set({ [key]: data });

    return {
      success: true
    };
  } catch (error) {
    // エラーハンドリング
    const appError: AppError = {
      type: 'storage',
      message: `ストレージへの保存に失敗しました（キー: ${key}）`,
      originalError: error instanceof Error ? error : undefined
    };

    console.error('Storage save error:', appError);

    return {
      success: false,
      error: appError
    };
  }
};

/**
 * Chrome Storageからデータを削除する
 *
 * @param key - 削除するストレージキー
 * @returns 成功またはエラーを含むレスポンス
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
    await chrome.storage.local.remove(key);

    return {
      success: true
    };
  } catch (error) {
    const appError: AppError = {
      type: 'storage',
      message: `ストレージからの削除に失敗しました（キー: ${key}）`,
      originalError: error instanceof Error ? error : undefined
    };

    console.error('Storage remove error:', appError);

    return {
      success: false,
      error: appError
    };
  }
};

/**
 * Chrome Storageのすべてのデータをクリアする
 *
 * @returns 成功またはエラーを含むレスポンス
 *
 * ⚠️ 注意: この操作は元に戻せません
 */
export const clearAllStorage = async (): Promise<StorageServiceResponse<void>> => {
  try {
    await chrome.storage.local.clear();

    return {
      success: true
    };
  } catch (error) {
    const appError: AppError = {
      type: 'storage',
      message: 'ストレージのクリアに失敗しました',
      originalError: error instanceof Error ? error : undefined
    };

    console.error('Storage clear error:', appError);

    return {
      success: false,
      error: appError
    };
  }
};

/**
 * ストレージの使用状況を取得する
 *
 * @returns 使用中のバイト数
 */
export const getStorageUsage = async (): Promise<number> => {
  try {
    const bytesInUse = await chrome.storage.local.getBytesInUse();
    return bytesInUse;
  } catch (error) {
    console.error('Failed to get storage usage:', error);
    return 0;
  }
};

/**
 * ストレージの制限を取得する
 *
 * @returns ストレージの最大容量（バイト）
 */
export const getStorageQuota = (): number => {
  // Chrome Storage Local の制限は10MB
  return chrome.storage.local.QUOTA_BYTES;
};

/**
 * ストレージの使用率を取得する（0-1の範囲）
 *
 * @returns 使用率（0.0 = 0%, 1.0 = 100%）
 */
export const getStorageUsageRatio = async (): Promise<number> => {
  const usage = await getStorageUsage();
  const quota = getStorageQuota();

  return usage / quota;
};
```

---

## 🎯 使用例

### PromptContextでの使用

```typescript
import { loadFromStorage, saveToStorage } from '../services/storageService';
import { StorageKeys, PromptState } from '../types';

// 読み込み
useEffect(() => {
  const loadPromptState = async () => {
    const response = await loadFromStorage<PromptState>(StorageKeys.AUTO_SAVE);

    if (response.success && response.data) {
      setPromptState(response.data);
    }
  };

  loadPromptState();
}, []);

// 保存
useEffect(() => {
  const savePromptState = async () => {
    await saveToStorage(StorageKeys.AUTO_SAVE, promptState);
  };

  savePromptState();
}, [promptState]);
```

### useHistoryでの使用

```typescript
import { loadFromStorage, saveToStorage } from '../services/storageService';
import { StorageKeys, HistoryEntry } from '../types';

const saveHistory = async (newEntry: HistoryEntry) => {
  // 既存の履歴を読み込み
  const response = await loadFromStorage<readonly HistoryEntry[]>(
    StorageKeys.HISTORY
  );

  const existingHistory = response.data || [];

  // 新しいエントリを追加
  const updatedHistory = [newEntry, ...existingHistory];

  // 保存
  await saveToStorage(StorageKeys.HISTORY, updatedHistory);
};
```

---

## 🛡️ エラーハンドリング

### エラータイプ

| エラータイプ | 説明 | 対応策 |
|-------------|------|--------|
| `QUOTA_EXCEEDED` | ストレージ容量超過 | 古いデータを削除 |
| `ACCESS_DENIED` | アクセス権限なし | manifest.json確認 |
| `UNKNOWN` | 予期しないエラー | ログ確認、再試行 |

### エラーハンドリングの例

```typescript
const response = await saveToStorage(StorageKeys.HISTORY, history);

if (!response.success && response.error) {
  switch (response.error.type) {
    case 'storage':
      if (response.error.message.includes('QUOTA_EXCEEDED')) {
        // 容量超過時の処理
        await cleanupOldHistory();
        // 再試行
        await saveToStorage(StorageKeys.HISTORY, history);
      }
      break;
    default:
      // その他のエラー
      showErrorNotification(response.error.message);
  }
}
```

---

## 📊 ストレージ管理

### 使用状況の監視

```typescript
import { getStorageUsage, getStorageQuota, getStorageUsageRatio } from './storageService';

const monitorStorage = async () => {
  const usage = await getStorageUsage();
  const quota = getStorageQuota();
  const ratio = await getStorageUsageRatio();

  console.log(`ストレージ使用量: ${usage} / ${quota} bytes (${(ratio * 100).toFixed(2)}%)`);

  if (ratio > 0.9) {
    console.warn('⚠️ ストレージ使用量が90%を超えています');
  }
};
```

### 自動クリーンアップ

```typescript
const cleanupOldHistory = async () => {
  const response = await loadFromStorage<readonly HistoryEntry[]>(
    StorageKeys.HISTORY
  );

  if (!response.success || !response.data) return;

  // 最新の50件のみ保持
  const MAX_HISTORY_ENTRIES = 50;
  const trimmedHistory = response.data.slice(0, MAX_HISTORY_ENTRIES);

  await saveToStorage(StorageKeys.HISTORY, trimmedHistory);
};
```

---

## 🔒 セキュリティ考慮事項

### Chrome Storage Localの特性

- **暗号化**: Chrome Storage APIは自動的にデータを暗号化
- **アクセス制限**: 同じ拡張機能内のみアクセス可能
- **同期なし**: `storage.local`は同期されない（`storage.sync`とは異なる）

### 推奨事項

1. **機密情報の保存を避ける**: APIキーやパスワードは環境変数で管理
2. **データサイズに注意**: 10MBの制限内で管理
3. **バリデーション**: 読み込んだデータの検証を実施

---

## 📚 関連ドキュメント

- [状態管理設計](../03-state-management.md) - PromptContextでの使用例
- [useHistoryフック](../05-hooks/useHistory.md) - 履歴管理での使用
- [型定義設計](../02-types-design.md) - StorageKeys、StorageData型
- [Chrome Storage API公式](https://developer.chrome.com/docs/extensions/reference/storage/)

---

## 🔄 次のステップ

1. manifest.jsonに`storage`パーミッションを追加
2. PromptContextとuseHistoryでストレージサービスを統合
3. エラーハンドリングとリトライロジックの実装
