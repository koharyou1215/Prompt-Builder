# カテゴリー別カラー設定機能 - アーキテクチャ図

## システム全体図

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Interface                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ Settings     │  │ Keyword      │  │ Prompt       │         │
│  │ Panel        │  │ Selector     │  │ Editor       │         │
│  │              │  │              │  │              │         │
│  │ [カラー設定]  │  │ [キーワード]  │  │ [プロンプト]  │         │
│  │  🔴 表情     │  │  😊 笑顔     │  │  smile (🔴)  │         │
│  │  🟠 髪型     │  │  👗 制服     │  │  uniform(🟢) │         │
│  │  🟢 服装     │  │  🌸 桜       │  │  sakura (🟣) │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                 │                 │                 │
└─────────┼─────────────────┼─────────────────┼─────────────────┘
          │                 │                 │
          │                 │                 │
┌─────────┼─────────────────┼─────────────────┼─────────────────┐
│         ▼                 ▼                 ▼                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │          CategoryColorContext (State Management)         │ │
│  │                                                          │ │
│  │  - colorConfigs: CategoryColorConfig[]                  │ │
│  │  - defaultConfigs: CategoryColorConfig[]                │ │
│  │  - updateColor(category, color)                         │ │
│  │  - resetColor(category)                                 │ │
│  │  - getCategoryColor(category)                           │ │
│  └──────────────────────────────────────────────────────────┘ │
│                              │                                │
│                              │                                │
│         React Context Layer  │                                │
└──────────────────────────────┼────────────────────────────────┘
                               │
                               │
┌──────────────────────────────┼────────────────────────────────┐
│                              ▼                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │              Business Logic Layer                        │ │
│  ├──────────────────────────────────────────────────────────┤ │
│  │                                                          │ │
│  │  CategoryColorService                                    │ │
│  │  ┌────────────────────────────────────────────────────┐ │ │
│  │  │ • getCategoryColor(name, configs)                  │ │ │
│  │  │ • generateDefaultColorConfig(categories)           │ │ │
│  │  │ • updateCategoryColor(configs, name, color)        │ │ │
│  │  │ • resetCategoryColor(configs, name, defaults)      │ │ │
│  │  └────────────────────────────────────────────────────┘ │ │
│  │                                                          │ │
│  │  PromptParser (Extended)                                 │ │
│  │  ┌────────────────────────────────────────────────────┐ │ │
│  │  │ • parsePromptWithColors(text, categories, colors)  │ │ │
│  │  │ • findCategoryForKeyword(keyword, categories)      │ │ │
│  │  └────────────────────────────────────────────────────┘ │ │
│  │                                                          │ │
│  └──────────────────────────────────────────────────────────┘ │
│                              │                                │
│         Service Layer        │                                │
└──────────────────────────────┼────────────────────────────────┘
                               │
                               │
┌──────────────────────────────┼────────────────────────────────┐
│                              ▼                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │              Storage Service Layer                       │ │
│  ├──────────────────────────────────────────────────────────┤ │
│  │                                                          │ │
│  │  StorageService                                          │ │
│  │  ┌────────────────────────────────────────────────────┐ │ │
│  │  │ • loadCategoryColors()                             │ │ │
│  │  │ • saveCategoryColors(configs)                      │ │ │
│  │  └────────────────────────────────────────────────────┘ │ │
│  │                                                          │ │
│  └──────────────────────────────────────────────────────────┘ │
│                              │                                │
│         Storage Layer        │                                │
└──────────────────────────────┼────────────────────────────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │  Chrome Storage API │
                    │                     │
                    │  categoryColors: [  │
                    │    {                │
                    │      categoryName,  │
                    │      color,         │
                    │      isCustom       │
                    │    }                │
                    │  ]                  │
                    └─────────────────────┘
```

---

## データフロー図

### 1. カラー設定の読み込み（初期化時）

```
[App起動]
    │
    ▼
[CategoryColorProvider mount]
    │
    ▼
[loadCategoryColors()] ──→ Chrome Storage API
    │                            │
    │                            ▼
    │                      categoryColors取得
    │                            │
    ◄────────────────────────────┘
    │
    ▼
[colorConfigs に設定]
    │
    ▼
[UIコンポーネントにカラー情報提供]
```

### 2. ユーザーがカラーを変更

```
[SettingsPanel]
    │
    │ ユーザーが「表情」カテゴリーを
    │ 赤色(#EF4444)に変更
    │
    ▼
[updateColor('表情', '#EF4444')]
    │
    ▼
[CategoryColorService.updateCategoryColor()]
    │
    │ 新しいconfig配列を生成:
    │ { categoryName: '表情', color: '#EF4444', isCustom: true }
    │
    ▼
[colorConfigs 更新]
    │
    ├─→ [saveCategoryColors()] ──→ Chrome Storage API
    │                                      │
    │                                      ▼
    │                                  永続化完了
    │
    └─→ [UI再レンダリング]
            │
            ▼
        KeywordChip、PromptEditor等で
        新しいカラーが反映される
```

### 3. キーワード選択時のカラー適用

```
[KeywordSelector]
    │
    │ ユーザーが「笑顔」キーワードを選択
    │
    ▼
[addKeyword('smile', '笑顔', '表情')]
    │
    ▼
[getCategoryColor('表情')] ──→ colorConfigs
    │                              │
    │                              ▼
    ◄──────────────────────── '#EF4444' (赤色)
    │
    ▼
[ColoredKeywordItem作成]
    {
      keyword: 'smile',
      ja: '笑顔',
      categoryName: '表情',
      color: '#EF4444',  ◄── カラー情報付与
      isCustom: false,
      order: 1
    }
    │
    ▼
[KeywordChip表示]
    <div style="background-color: #EF4444">
      笑顔 ×
    </div>
```

### 4. プロンプトエディタでのカラー表示

```
[PromptEditor]
    │
    │ promptText: "smile, school uniform, sakura"
    │
    ▼
[parsePromptWithColors()]
    │
    ├─→ 'smile' → findCategory() → '表情' → getColor() → '#EF4444'
    ├─→ 'school uniform' → findCategory() → '服装' → getColor() → '#10B981'
    └─→ 'sakura' → findCategory() → '背景' → getColor() → '#8B5CF6'
    │
    ▼
[ColoredPromptSegment[] 生成]
    [
      { text: 'smile', category: '表情', color: '#EF4444' },
      { text: 'school uniform', category: '服装', color: '#10B981' },
      { text: 'sakura', category: '背景', color: '#8B5CF6' }
    ]
    │
    ▼
[レンダリング]
    <div>
      <span style="color: #EF4444">smile</span>,
      <span style="color: #10B981">school uniform</span>,
      <span style="color: #8B5CF6">sakura</span>
    </div>
```

---

## コンポーネント構成図

```
App.tsx
  │
  ├─ CategoryColorProvider
  │    │
  │    ├─ State: colorConfigs, defaultConfigs
  │    ├─ Methods: updateColor, resetColor, getCategoryColor
  │    └─ Storage: loadCategoryColors, saveCategoryColors
  │
  └─ MainPanel
       │
       ├─ TabNavigation
       │
       ├─ SettingsPanel
       │    │
       │    └─ CategoryColorSettings (NEW)
       │         │
       │         └─ ColorPicker (NEW) × N
       │              │
       │              ├─ Preset palette (8 colors)
       │              └─ Custom color input
       │
       ├─ KeywordSelector
       │    │
       │    └─ KeywordChip (UPDATED)
       │         │
       │         └─ style={{ backgroundColor: keyword.color }}
       │
       ├─ PromptEditor (UPDATED)
       │    │
       │    ├─ parsePromptWithColors()
       │    └─ <span style={{ color: segment.color }}>
       │
       └─ CategoryModeView
            │
            └─ CategorySection
                 │
                 └─ KeywordChip × N (with colors)
```

---

## 新規コンポーネント詳細

### 1. CategoryColorSettings.tsx

```typescript
interface Props {
  readonly categories: ReadonlyArray<string>;
  readonly colorConfig: ReadonlyArray<CategoryColorConfig>;
  readonly onColorChange: (categoryName: string, color: string) => void;
  readonly onReset: (categoryName: string) => void;
  readonly onResetAll: () => void;
}

// Render:
<div className="category-color-settings">
  {categories.map(categoryName => (
    <div key={categoryName} className="color-item">
      <label>{categoryName}</label>
      <ColorPicker
        value={getColor(categoryName)}
        onChange={(color) => onColorChange(categoryName, color)}
      />
      <button onClick={() => onReset(categoryName)}>リセット</button>
    </div>
  ))}
  <button onClick={onResetAll}>すべてリセット</button>
</div>
```

### 2. ColorPicker.tsx

```typescript
interface Props {
  readonly value: string;
  readonly onChange: (color: string) => void;
  readonly presetColors?: ReadonlyArray<string>;
}

// Render:
<div className="color-picker">
  {/* Preset palette */}
  <div className="preset-colors">
    {presetColors.map(color => (
      <button
        key={color}
        className="color-button"
        style={{ backgroundColor: color }}
        onClick={() => onChange(color)}
        aria-label={color}
      />
    ))}
  </div>

  {/* Custom color input (HTML5) */}
  <input
    type="color"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="custom-color-input"
  />
</div>
```

---

## ファイル構成

```
src/
├── types.ts (UPDATED)
│   ├── CategoryColorConfig (NEW)
│   ├── ColoredKeywordItem (NEW)
│   └── StorageKeys.CATEGORY_COLORS (NEW)
│
├── constants.ts (UPDATED)
│   └── DEFAULT_CATEGORY_COLORS (NEW)
│
├── services/
│   ├── storageService.ts (UPDATED)
│   │   ├── loadCategoryColors() (NEW)
│   │   └── saveCategoryColors() (NEW)
│   │
│   └── categoryColorService.ts (NEW)
│       ├── getCategoryColor()
│       ├── generateDefaultColorConfig()
│       ├── updateCategoryColor()
│       └── resetCategoryColor()
│
├── utils/
│   └── promptParser.ts (UPDATED)
│       ├── parsePromptWithColors() (NEW)
│       └── findCategoryForKeyword() (UPDATED)
│
├── contexts/
│   └── CategoryColorContext.tsx (NEW)
│       ├── CategoryColorProvider
│       └── useCategoryColor()
│
└── components/
    ├── SettingsPanel.tsx (UPDATED)
    │   └── import CategoryColorSettings
    │
    ├── CategoryColorSettings.tsx (NEW)
    │   └── Category color configuration UI
    │
    ├── ColorPicker.tsx (NEW)
    │   └── Color selection component
    │
    ├── KeywordChip.tsx (UPDATED)
    │   └── Apply color from keyword.color
    │
    ├── PromptEditor.tsx (UPDATED)
    │   └── Parse and display colored text
    │
    └── KeywordChip.module.css (UPDATED)
        └── Support dynamic color styles
```

---

## シーケンス図: カラー変更操作

```
User          SettingsPanel    CategoryColorContext    CategoryColorService    StorageService    ChromeStorage
 │                 │                    │                        │                   │                │
 │ カラー選択       │                    │                        │                   │                │
 ├────────────────>│                    │                        │                   │                │
 │                 │ updateColor()      │                        │                   │                │
 │                 ├───────────────────>│                        │                   │                │
 │                 │                    │ updateCategoryColor()  │                   │                │
 │                 │                    ├───────────────────────>│                   │                │
 │                 │                    │                        │ new configs[]     │                │
 │                 │                    │<───────────────────────┤                   │                │
 │                 │                    │ setColorConfigs()      │                   │                │
 │                 │                    │ (state update)         │                   │                │
 │                 │                    ├──────┐                 │                   │                │
 │                 │                    │      │                 │                   │                │
 │                 │                    │<─────┘                 │                   │                │
 │                 │                    │ saveCategoryColors()   │                   │                │
 │                 │                    │────────────────────────┼──────────────────>│                │
 │                 │                    │                        │                   │ chrome.storage │
 │                 │                    │                        │                   │ .local.set()   │
 │                 │                    │                        │                   ├───────────────>│
 │                 │                    │                        │                   │                │ save
 │                 │                    │                        │                   │                │ ──┐
 │                 │                    │                        │                   │                │   │
 │                 │                    │                        │                   │                │<──┘
 │                 │                    │                        │                   │<───────────────┤
 │                 │                    │                        │                   │ success        │
 │                 │                    │<───────────────────────┼───────────────────┤                │
 │                 │<───────────────────┤                        │                   │                │
 │                 │                    │                        │                   │                │
 │                 │ [UI re-render]     │                        │                   │                │
 │                 │ (colorConfigs更新) │                        │                   │                │
 │<────────────────┤                    │                        │                   │                │
 │ 新しいカラー表示  │                    │                        │                   │                │
 │                 │                    │                        │                   │                │
```

---

## Phase別実装範囲

### Phase 1 (MVP)

```
┌─────────────────────────────────────────────┐
│          Implemented Components             │
├─────────────────────────────────────────────┤
│                                             │
│  [Data Model]                               │
│  ✓ CategoryColorConfig                      │
│  ✓ ColoredKeywordItem                       │
│  ✓ Storage extension                        │
│                                             │
│  [Services]                                 │
│  ✓ CategoryColorService                     │
│  ✓ StorageService (load/save colors)        │
│  ✓ PromptParser (parsePromptWithColors)     │
│                                             │
│  [Context]                                  │
│  ✓ CategoryColorContext                     │
│                                             │
│  [Components]                               │
│  ✓ ColorPicker                              │
│  ✓ CategoryColorSettings                    │
│  ✓ KeywordChip (with color)                 │
│  ✓ PromptEditor (colored English text)      │
│                                             │
└─────────────────────────────────────────────┘
```

### Phase 2 (翻訳結果カラー反映)

```
┌─────────────────────────────────────────────┐
│          Additional Components              │
├─────────────────────────────────────────────┤
│                                             │
│  [Services]                                 │
│  ✓ TranslationColorMapper                   │
│    - mapTranslationColors()                 │
│    - buildKeywordMap()                      │
│    - extractJapaneseKeywords()              │
│                                             │
│  [Components]                               │
│  ✓ TranslationArea (colored Japanese text)  │
│                                             │
│  [Optional: External Library]               │
│  ○ kuromoji.js (形態素解析)                  │
│                                             │
└─────────────────────────────────────────────┘
```

---

## まとめ

このアーキテクチャ設計により、カテゴリー別カラー設定機能を段階的に実装できます。

**Phase 1**では、基本的なカラー設定とKeywordChip、英語プロンプトエリアでのカラー表示を実現します。

**Phase 2**（オプション）では、翻訳結果（日本語テキスト）へのカラー反映を追加できますが、複雑度が高いため、ユーザーフィードバックを見てから判断することを推奨します。
