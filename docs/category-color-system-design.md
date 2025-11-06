# カテゴリー別カラー設定機能 - システム設計書

## 概要

プロンプトビルダーにカテゴリー別のフォントカラー設定機能を追加し、視覚的な編集体験を向上させる。

### 要件
- カテゴリーごとにフォントカラーを設定可能
- 選択したキーワードが設定されたカラーでプロンプトエリアに表示される
- 設定はChrome Storageに永続化される
- 翻訳結果へのカラー反映も検討（Phase 2以降）

### 例
```
表情カテゴリー = 赤色
→ 「笑顔」を選択 → プロンプトに "smile" が赤字で表示
```

---

## アーキテクチャ設計

### 1. データモデル拡張

#### 1.1 カテゴリーカラー設定

```typescript
// src/types.ts に追加

/**
 * Category color configuration
 */
export interface CategoryColorConfig {
  readonly categoryName: string;
  readonly color: string; // CSS color value (hex, rgb, etc.)
  readonly isCustom: boolean; // User-defined or default
}

/**
 * Default color palette for categories
 */
export const DEFAULT_CATEGORY_COLORS: ReadonlyArray<string> = [
  '#EF4444', // red-500
  '#F59E0B', // amber-500
  '#10B981', // emerald-500
  '#3B82F6', // blue-500
  '#8B5CF6', // violet-500
  '#EC4899', // pink-500
  '#06B6D4', // cyan-500
  '#84CC16', // lime-500
] as const;
```

#### 1.2 ストレージ拡張

```typescript
// src/types.ts に追加

export const StorageKeys = {
  AUTO_SAVE: 'autoSave',
  HISTORY: 'history',
  CUSTOM_KEYWORDS: 'customKeywords',
  CATEGORY_COLORS: 'categoryColors', // NEW
} as const;

export interface StorageData {
  [StorageKeys.AUTO_SAVE]: PromptState;
  [StorageKeys.HISTORY]: ReadonlyArray<HistoryEntry>;
  [StorageKeys.CUSTOM_KEYWORDS]: ReadonlyArray<CustomKeyword>;
  [StorageKeys.CATEGORY_COLORS]: ReadonlyArray<CategoryColorConfig>; // NEW
}
```

#### 1.3 カテゴリー別キーワード拡張

```typescript
// src/types.ts に追加

/**
 * Extended keyword with color information
 */
export interface ColoredKeywordItem extends CategorizedKeywordItem {
  readonly color?: string; // Category color if configured
}
```

---

### 2. UI設計

#### 2.1 カラー設定パネル（SettingsPanel拡張）

```
┌─────────────────────────────────────┐
│  設定 > カテゴリーカラー設定        │
├─────────────────────────────────────┤
│                                     │
│  📌 表情                             │
│  [🔴] ──────────── [リセット]       │
│                                     │
│  📌 髪型・髪色                       │
│  [🟠] ──────────── [リセット]       │
│                                     │
│  📌 服装                             │
│  [🟢] ──────────── [リセット]       │
│                                     │
│  [すべてリセット]                    │
└─────────────────────────────────────┘
```

**コンポーネント**: `CategoryColorSettings.tsx`

```typescript
interface CategoryColorSettingsProps {
  readonly categories: ReadonlyArray<string>;
  readonly colorConfig: ReadonlyArray<CategoryColorConfig>;
  readonly onColorChange: (categoryName: string, color: string) => void;
  readonly onReset: (categoryName: string) => void;
  readonly onResetAll: () => void;
}
```

#### 2.2 カラーピッカーコンポーネント

**コンポーネント**: `ColorPicker.tsx`

```typescript
interface ColorPickerProps {
  readonly value: string;
  readonly onChange: (color: string) => void;
  readonly presetColors?: ReadonlyArray<string>;
}
```

**機能**:
- プリセットカラーパレット（8色）
- カスタムカラー選択（HTML5 color input）
- iOS Safariでの動作確認

#### 2.3 KeywordChip カラー対応

**変更**: `KeywordChip.tsx` と `KeywordChip.module.css`

```typescript
// KeywordChip.tsx
interface KeywordChipProps {
  readonly keyword: ColoredKeywordItem; // CategorizedKeywordItem → ColoredKeywordItem
  readonly onDelete: () => void;
}

export const KeywordChip: React.FC<KeywordChipProps> = ({ keyword, onDelete }) => {
  const displayText = keyword.weight ? `${keyword.ja}${keyword.weight}` : keyword.ja;

  // Apply custom color if configured
  const style: React.CSSProperties = keyword.color
    ? { backgroundColor: keyword.color }
    : {};

  return (
    <div className={styles.chip} style={style} title={keyword.keyword}>
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
};
```

#### 2.4 PromptEditor カラー表示

**Phase 1アプローチ**: Rich Text Display

```typescript
// PromptEditor.tsx
<div className="prompt-display">
  {parsedKeywords.map((item, index) => (
    <span
      key={index}
      style={{ color: item.color || 'inherit' }}
    >
      {item.text}
    </span>
  ))}
</div>
```

**実装ポイント**:
1. プロンプト文字列をパースしてキーワードを抽出
2. 各キーワードのカテゴリーを判定
3. カテゴリーカラーを適用
4. `<span>`でラップして表示

---

### 3. ビジネスロジック

#### 3.1 カラー管理サービス

**新規ファイル**: `src/services/categoryColorService.ts`

```typescript
import type { CategoryColorConfig } from '../types';
import { DEFAULT_CATEGORY_COLORS } from '../types';

/**
 * Get color for a category
 */
export const getCategoryColor = (
  categoryName: string,
  configs: ReadonlyArray<CategoryColorConfig>
): string | undefined => {
  const config = configs.find(c => c.categoryName === categoryName);
  return config?.color;
};

/**
 * Generate default color config for all categories
 */
export const generateDefaultColorConfig = (
  categoryNames: ReadonlyArray<string>
): ReadonlyArray<CategoryColorConfig> => {
  return categoryNames.map((name, index) => ({
    categoryName: name,
    color: DEFAULT_CATEGORY_COLORS[index % DEFAULT_CATEGORY_COLORS.length],
    isCustom: false,
  }));
};

/**
 * Update category color
 */
export const updateCategoryColor = (
  configs: ReadonlyArray<CategoryColorConfig>,
  categoryName: string,
  color: string
): ReadonlyArray<CategoryColorConfig> => {
  const existing = configs.find(c => c.categoryName === categoryName);

  if (existing) {
    return configs.map(c =>
      c.categoryName === categoryName
        ? { ...c, color, isCustom: true }
        : c
    );
  } else {
    return [
      ...configs,
      { categoryName, color, isCustom: true },
    ];
  }
};

/**
 * Reset category color to default
 */
export const resetCategoryColor = (
  configs: ReadonlyArray<CategoryColorConfig>,
  categoryName: string,
  defaultConfigs: ReadonlyArray<CategoryColorConfig>
): ReadonlyArray<CategoryColorConfig> => {
  const defaultConfig = defaultConfigs.find(c => c.categoryName === categoryName);

  if (!defaultConfig) {
    return configs.filter(c => c.categoryName !== categoryName);
  }

  return configs.map(c =>
    c.categoryName === categoryName
      ? { ...defaultConfig, isCustom: false }
      : c
  );
};
```

#### 3.2 プロンプトパーサー拡張

**変更**: `src/utils/promptParser.ts`

```typescript
/**
 * Parse prompt text and attach color information
 */
export const parsePromptWithColors = (
  promptText: string,
  keywordCategories: ReadonlyArray<KeywordCategory>,
  colorConfigs: ReadonlyArray<CategoryColorConfig>
): ReadonlyArray<ColoredPromptSegment> => {
  const segments: ColoredPromptSegment[] = [];
  const keywords = promptText.split(',').map(k => k.trim());

  keywords.forEach(keyword => {
    // Find category for this keyword
    const category = findCategoryForKeyword(keyword, keywordCategories);
    const color = category
      ? getCategoryColor(category.categoryName, colorConfigs)
      : undefined;

    segments.push({
      text: keyword,
      category: category?.categoryName,
      color,
    });
  });

  return segments;
};

interface ColoredPromptSegment {
  readonly text: string;
  readonly category?: string;
  readonly color?: string;
}
```

#### 3.3 ストレージサービス拡張

**変更**: `src/services/storageService.ts`

```typescript
/**
 * Load category color configuration
 */
export const loadCategoryColors = async (): Promise<
  StorageServiceResponse<ReadonlyArray<CategoryColorConfig>>
> => {
  try {
    const result = await chrome.storage.local.get(StorageKeys.CATEGORY_COLORS);
    const data = result[StorageKeys.CATEGORY_COLORS] || [];

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        type: 'storage',
        message: STORAGE_ERROR_MESSAGES.LOAD_FAILED,
        originalError: error instanceof Error ? error : undefined,
      },
    };
  }
};

/**
 * Save category color configuration
 */
export const saveCategoryColors = async (
  configs: ReadonlyArray<CategoryColorConfig>
): Promise<StorageServiceResponse<void>> => {
  try {
    await chrome.storage.local.set({
      [StorageKeys.CATEGORY_COLORS]: configs,
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: {
        type: 'storage',
        message: STORAGE_ERROR_MESSAGES.SAVE_FAILED,
        originalError: error instanceof Error ? error : undefined,
      },
    };
  }
};
```

---

### 4. Context拡張

**新規または拡張**: `src/contexts/CategoryColorContext.tsx`

```typescript
interface CategoryColorContextValue {
  readonly colorConfigs: ReadonlyArray<CategoryColorConfig>;
  readonly defaultConfigs: ReadonlyArray<CategoryColorConfig>;
  readonly updateColor: (categoryName: string, color: string) => Promise<void>;
  readonly resetColor: (categoryName: string) => Promise<void>;
  readonly resetAllColors: () => Promise<void>;
  readonly getCategoryColor: (categoryName: string) => string | undefined;
}

export const CategoryColorProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [colorConfigs, setColorConfigs] = useState<ReadonlyArray<CategoryColorConfig>>([]);
  const [defaultConfigs] = useState<ReadonlyArray<CategoryColorConfig>>(() =>
    generateDefaultColorConfig(getAllCategoryNames())
  );

  // Load configs on mount
  useEffect(() => {
    loadCategoryColors().then(response => {
      if (response.success && response.data) {
        setColorConfigs(response.data);
      } else {
        // Use defaults
        setColorConfigs(defaultConfigs);
      }
    });
  }, [defaultConfigs]);

  const updateColor = useCallback(async (categoryName: string, color: string) => {
    const updated = updateCategoryColor(colorConfigs, categoryName, color);
    setColorConfigs(updated);
    await saveCategoryColors(updated);
  }, [colorConfigs]);

  const resetColor = useCallback(async (categoryName: string) => {
    const updated = resetCategoryColor(colorConfigs, categoryName, defaultConfigs);
    setColorConfigs(updated);
    await saveCategoryColors(updated);
  }, [colorConfigs, defaultConfigs]);

  const resetAllColors = useCallback(async () => {
    setColorConfigs(defaultConfigs);
    await saveCategoryColors(defaultConfigs);
  }, [defaultConfigs]);

  const getCategoryColor = useCallback((categoryName: string) => {
    return getCategoryColor(categoryName, colorConfigs);
  }, [colorConfigs]);

  return (
    <CategoryColorContext.Provider
      value={{
        colorConfigs,
        defaultConfigs,
        updateColor,
        resetColor,
        resetAllColors,
        getCategoryColor,
      }}
    >
      {children}
    </CategoryColorContext.Provider>
  );
};

export const useCategoryColor = () => {
  const context = useContext(CategoryColorContext);
  if (!context) {
    throw new Error('useCategoryColor must be used within CategoryColorProvider');
  }
  return context;
};
```

---

### 5. 翻訳結果へのカラー反映

#### 5.1 実装可能性分析

**結論**: 実装可能だが複雑度が高い

**課題**:
1. **単語境界の判定**: 「笑顔で立っている」→「笑顔」を抽出する必要
2. **翻訳APIの制約**: Gemini/Google翻訳は単純な文字列を返す
3. **マッピングの保持**: 英語キーワード↔日本語訳の対応関係を管理
4. **パフォーマンス**: 翻訳ごとにパース処理が必要

#### 5.2 推奨実装フェーズ

**Phase 1** (推奨・MVP):
- ✅ SettingsPanelでカラー設定
- ✅ KeywordChip（カテゴリモード）でカラー表示
- ✅ PromptEditor（英語テキスト）でカラー表示

**Phase 2** (拡張):
- 翻訳結果エリアでもカラー表示
- 単語マッチングロジックの実装
- 形態素解析ライブラリの導入検討（kuromoji.jsなど）

**Phase 3** (オプション):
- ハイライト機能（特定カテゴリーを強調）
- カラーテーマ（プリセット）機能
- エクスポート時のカラー情報保持

#### 5.3 Phase 2 実装案（翻訳結果カラー反映）

```typescript
// src/utils/translationColorMapper.ts

/**
 * Map translated Japanese text to colors based on keyword mapping
 */
export const mapTranslationColors = (
  translatedText: string,
  originalPrompt: string,
  keywordCategories: ReadonlyArray<KeywordCategory>,
  colorConfigs: ReadonlyArray<CategoryColorConfig>
): ReadonlyArray<ColoredTextSegment> => {
  const segments: ColoredTextSegment[] = [];

  // Step 1: Extract keywords from original prompt
  const originalKeywords = originalPrompt.split(',').map(k => k.trim());

  // Step 2: Find Japanese equivalent for each keyword
  const keywordMap = buildKeywordMap(originalKeywords, keywordCategories);

  // Step 3: Parse translated text and match keywords
  // (This requires sophisticated text matching - could use kuromoji.js)
  const japaneseKeywords = extractJapaneseKeywords(translatedText, keywordMap);

  // Step 4: Apply colors
  japaneseKeywords.forEach(item => {
    segments.push({
      text: item.text,
      color: item.color,
      start: item.start,
      end: item.end,
    });
  });

  return segments;
};

interface ColoredTextSegment {
  readonly text: string;
  readonly color?: string;
  readonly start: number;
  readonly end: number;
}
```

**注意**: Phase 2は複雑度が高いため、ユーザーフィードバックを受けてから実装判断を推奨。

---

## 技術仕様

### パフォーマンス考慮事項
- カラー設定は Chrome Storage に保存（非同期アクセス）
- カラー取得は Context 経由でキャッシュ
- プロンプトパースは useMemo でメモ化

### アクセシビリティ
- カラーピッカーはキーボード操作対応
- 色覚異常に配慮したデフォルトパレット
- ツールチップで英語キーワードを表示（色に依存しない情報提供）

### Safari (iOS) 対応
- HTML5 color input は iOS 14+ でサポート
- タッチターゲットサイズは最低 44x44pt 確保
- Safe Areaを考慮したレイアウト

---

## 実装順序

1. **データモデル拡張** (`types.ts`)
2. **ストレージサービス拡張** (`storageService.ts`)
3. **カラー管理サービス作成** (`categoryColorService.ts`)
4. **Context作成** (`CategoryColorContext.tsx`)
5. **カラーピッカー作成** (`ColorPicker.tsx`)
6. **カラー設定パネル作成** (`CategoryColorSettings.tsx`)
7. **KeywordChip拡張** (カラー適用)
8. **PromptEditor拡張** (カラー表示)
9. **テスト & デバッグ**
10. **(Phase 2) 翻訳結果カラー反映**

---

## 見積もり

- **Phase 1 (MVP)**: 8-12時間
- **Phase 2 (翻訳結果カラー)**: 6-10時間（複雑度により変動）

---

## リスクと対策

| リスク | 影響 | 対策 |
|--------|------|------|
| カラー設定がストレージ容量を圧迫 | 低 | 設定は数KB程度、影響なし |
| iOS Safariでカラーピッカーが動作不良 | 中 | プリセットパレットを優先提供 |
| パフォーマンス劣化（大量キーワード） | 中 | useMemo/useCallbackでメモ化 |
| 翻訳結果カラー反映の複雑度 | 高 | Phase 2として切り離し |

---

## まとめ

カテゴリー別カラー設定機能は実装可能で、以下の段階的アプローチを推奨します:

### Phase 1 (MVP・推奨)
- ✅ カラー設定UI
- ✅ KeywordChipでのカラー表示
- ✅ 英語プロンプトエリアでのカラー表示

### Phase 2 (拡張・オプション)
- 翻訳結果（日本語テキスト）へのカラー反映
  - 実装は可能だが複雑度が高い
  - ユーザーフィードバックを見て判断推奨

**翻訳結果へのカラー反映**については、単語マッチングロジックの複雑さから、まずPhase 1を実装してユーザーの反応を見てから判断することを強く推奨します。
