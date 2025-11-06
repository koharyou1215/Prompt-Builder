# メインアプリケーションレイアウト (App)

## ドキュメント情報

| 項目 | 内容 |
|------|------|
| **作成日** | 2025-01-XX |
| **最終更新** | 2025-01-XX |
| **バージョン** | 1.0.0 |
| **ステータス** | 実装中 |
| **担当コンポーネント** | `src/App.tsx`, `src/App.module.css` |
| **依存関係** | PromptContext, PromptEditor, KeywordSelector, HistoryPanel |

---

## 概要

Appコンポーネントは、アプリケーション全体のレイアウトを管理するルートコンポーネントです。ブラウザ拡張機能のサイドパネル用に最適化されたレイアウトを提供し、タブ切り替え機能、レスポンシブデザイン、アクセシビリティ対応を実装しています。

### 主な責務

- **全体レイアウト**: ヘッダー、メインコンテンツ、フッターの構成管理
- **タブナビゲーション**: キーワード選択と履歴管理の切り替え
- **状態管理の提供**: PromptContextによるグローバル状態の提供
- **レスポンシブ対応**: 300px〜480px+の幅に対応した適応的レイアウト
- **アクセシビリティ**: ARIA属性とキーボードナビゲーションの実装

---

## アーキテクチャ

### コンポーネント構成

```
App (ルート)
├── PromptProvider (Context提供)
│   └── AppContent (実装)
│       ├── Header (ヘッダー)
│       ├── Main (メインコンテンツ)
│       │   ├── EditorSection (プロンプトエディタ)
│       │   │   └── PromptEditor
│       │   └── TabSection (タブ付きパネル)
│       │       ├── TabHeader (タブナビゲーション)
│       │       └── TabContent (タブコンテンツ)
│       │           ├── KeywordPanel (キーワード選択)
│       │           │   └── KeywordSelector
│       │           └── HistoryPanel (履歴管理)
│       │               └── HistoryPanel
│       └── Footer (フッター)
```

### データフロー

```
┌─────────────────────────────────────────┐
│         PromptProvider (Context)        │
│  - promptText: string                   │
│  - selectedKeywords: Keyword[]          │
│  - history: PromptHistory[]             │
│  - currentCategory: Category | null     │
└─────────────────────────────────────────┘
                    │
                    │ Context提供
                    ↓
┌─────────────────────────────────────────┐
│           AppContent (State)            │
│  - activeTab: 'keywords' | 'history'    │
│  - handleTabChange()                    │
│  - handleTabKeyDown()                   │
└─────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        ↓                       ↓
┌──────────────┐       ┌──────────────┐
│ PromptEditor │       │  TabSection  │
│  (Context消費)│       │  (Tab管理)   │
└──────────────┘       └──────────────┘
                                │
                    ┌───────────┴───────────┐
                    ↓                       ↓
            ┌──────────────┐       ┌──────────────┐
            │KeywordSelector│       │HistoryPanel │
            │ (Context消費) │       │(Context消費) │
            └──────────────┘       └──────────────┘
```

---

## 完全実装コード

### `src/App.tsx`

```typescript
import React, { useState, useCallback } from 'react';
import { PromptProvider } from './contexts/PromptContext';
import PromptEditor from './components/PromptEditor';
import KeywordSelector from './components/KeywordSelector';
import HistoryPanel from './components/HistoryPanel';
import styles from './App.module.css';

/**
 * タブの種類を定義
 */
type TabType = 'keywords' | 'history';

/**
 * タブの設定情報
 */
interface TabConfig {
  id: TabType;
  label: string;
  icon: string;
  ariaLabel: string;
}

/**
 * タブの設定配列
 */
const TABS: readonly TabConfig[] = [
  {
    id: 'keywords',
    label: 'キーワード',
    icon: '🏷️',
    ariaLabel: 'キーワード選択タブ'
  },
  {
    id: 'history',
    label: '履歴',
    icon: '📚',
    ariaLabel: '履歴管理タブ'
  }
] as const;

/**
 * アプリケーションのメインコンポーネント（内部実装）
 * タブの状態管理とレイアウトを担当
 */
const AppContent: React.FC = () => {
  // アクティブなタブの状態
  const [activeTab, setActiveTab] = useState<TabType>('keywords');

  /**
   * タブ切り替えハンドラ
   */
  const handleTabChange = useCallback((tabId: TabType): void => {
    setActiveTab(tabId);
  }, []);

  /**
   * キーボードでのタブ切り替え（矢印キー対応）
   */
  const handleTabKeyDown = useCallback((
    event: React.KeyboardEvent,
    tabId: TabType,
    index: number
  ): void => {
    if (event.key === 'ArrowLeft' && index > 0) {
      // 左矢印: 前のタブへ
      event.preventDefault();
      setActiveTab(TABS[index - 1].id);
    } else if (event.key === 'ArrowRight' && index < TABS.length - 1) {
      // 右矢印: 次のタブへ
      event.preventDefault();
      setActiveTab(TABS[index + 1].id);
    }
  }, []);

  return (
    <div className={styles.app}>
      {/* ヘッダー */}
      <header className={styles.header}>
        <h1 className={styles.appTitle}>
          <span className={styles.appIcon}>✨</span>
          プロンプトビルダー
        </h1>
        <p className={styles.appSubtitle}>
          画像生成AIのためのプロンプト作成ツール
        </p>
      </header>

      {/* メインコンテンツエリア */}
      <main className={styles.main}>
        {/* 上部: プロンプトエディタ */}
        <section className={styles.editorSection} aria-label="プロンプトエディタ">
          <PromptEditor />
        </section>

        {/* 下部: タブ付きパネル */}
        <section className={styles.tabSection} aria-label="キーワードと履歴">
          {/* タブヘッダー */}
          <div className={styles.tabHeader} role="tablist" aria-label="パネル切り替え">
            {TABS.map((tab, index) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`panel-${tab.id}`}
                aria-label={tab.ariaLabel}
                id={`tab-${tab.id}`}
                className={`${styles.tab} ${
                  activeTab === tab.id ? styles.tabActive : ''
                }`}
                onClick={() => handleTabChange(tab.id)}
                onKeyDown={(e) => handleTabKeyDown(e, tab.id, index)}
                tabIndex={activeTab === tab.id ? 0 : -1}
              >
                <span className={styles.tabIcon}>{tab.icon}</span>
                <span className={styles.tabLabel}>{tab.label}</span>
                {activeTab === tab.id && (
                  <span className={styles.tabIndicator} aria-hidden="true" />
                )}
              </button>
            ))}
          </div>

          {/* タブコンテンツ */}
          <div className={styles.tabContent}>
            {/* キーワードパネル */}
            <div
              id="panel-keywords"
              role="tabpanel"
              aria-labelledby="tab-keywords"
              aria-hidden={activeTab !== 'keywords'}
              className={`${styles.tabPanel} ${
                activeTab === 'keywords' ? styles.tabPanelActive : ''
              }`}
            >
              {activeTab === 'keywords' && <KeywordSelector />}
            </div>

            {/* 履歴パネル */}
            <div
              id="panel-history"
              role="tabpanel"
              aria-labelledby="tab-history"
              aria-hidden={activeTab !== 'history'}
              className={`${styles.tabPanel} ${
                activeTab === 'history' ? styles.tabPanelActive : ''
              }`}
            >
              {activeTab === 'history' && <HistoryPanel />}
            </div>
          </div>
        </section>
      </main>

      {/* フッター */}
      <footer className={styles.footer}>
        <p className={styles.footerText}>
          <span className={styles.footerIcon}>💡</span>
          キーワードを選択してプロンプトを作成しよう
        </p>
      </footer>
    </div>
  );
};

/**
 * アプリケーションのルートコンポーネント
 * PromptProviderでラップして状態管理を提供
 */
const App: React.FC = () => {
  return (
    <PromptProvider>
      <AppContent />
    </PromptProvider>
  );
};

export default App;
```

### `src/App.module.css`

```css
/**
 * App コンポーネントのメインスタイル
 * ブラウザ拡張機能のサイドパネル用に最適化
 */

/* ========================================
   グローバル設定
   ======================================== */

:root {
  /* カラーパレット（ライトモード） */
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f9fafb;
  --color-bg-tertiary: #f3f4f6;
  --color-text-primary: #111827;
  --color-text-secondary: #6b7280;
  --color-text-tertiary: #9ca3af;
  --color-border: #e5e7eb;
  --color-border-light: #f3f4f6;
  --color-accent: #3b82f6;
  --color-accent-hover: #2563eb;
  --color-accent-light: rgba(59, 130, 246, 0.1);

  /* 影 */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);

  /* トランジション */
  --transition-fast: 0.15s ease;
  --transition-normal: 0.2s ease;
  --transition-slow: 0.3s ease;

  /* レイアウト */
  --header-height: 5rem;
  --footer-height: 3rem;
  --tab-header-height: 3rem;
}

/* ========================================
   メインコンテナ
   ======================================== */

.app {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  background-color: var(--color-bg-secondary);
  color: var(--color-text-primary);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
               'Helvetica Neue', Arial, sans-serif;
  overflow: hidden;
}

/* ========================================
   ヘッダー
   ======================================== */

.header {
  flex-shrink: 0;
  height: var(--header-height);
  padding: 1rem 1.25rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  box-shadow: var(--shadow-md);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.appTitle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 0.25rem 0;
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.appIcon {
  font-size: 1.5rem;
  animation: sparkle 2s ease-in-out infinite;
}

@keyframes sparkle {
  0%, 100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
  50% {
    transform: scale(1.1) rotate(5deg);
    opacity: 0.8;
  }
}

.appSubtitle {
  margin: 0;
  font-size: 0.75rem;
  font-weight: 400;
  opacity: 0.9;
  letter-spacing: 0.01em;
}

/* ========================================
   メインコンテンツ
   ======================================== */

.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: var(--color-bg-secondary);
}

/* ========================================
   エディタセクション
   ======================================== */

.editorSection {
  flex-shrink: 0;
  background-color: var(--color-bg-primary);
  border-bottom: 2px solid var(--color-border);
  box-shadow: var(--shadow-sm);
}

/* ========================================
   タブセクション
   ======================================== */

.tabSection {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: var(--color-bg-primary);
}

/* ========================================
   タブヘッダー
   ======================================== */

.tabHeader {
  display: flex;
  height: var(--tab-header-height);
  background-color: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
  position: relative;
}

.tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  background-color: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: all var(--transition-normal);
  position: relative;
  user-select: none;
}

.tab:hover:not(.tabActive) {
  color: var(--color-text-primary);
  background-color: var(--color-bg-tertiary);
}

.tab:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: -2px;
  z-index: 1;
}

.tabActive {
  color: var(--color-accent);
  background-color: var(--color-bg-primary);
  font-weight: 600;
}

.tabIcon {
  font-size: 1.125rem;
  transition: transform var(--transition-normal);
}

.tab:hover .tabIcon {
  transform: scale(1.1);
}

.tabActive .tabIcon {
  animation: bounce 0.5s ease;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
}

.tabLabel {
  font-weight: inherit;
}

.tabIndicator {
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background-color: var(--color-accent);
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
}

/* ========================================
   タブコンテンツ
   ======================================== */

.tabContent {
  flex: 1;
  position: relative;
  overflow: hidden;
  background-color: var(--color-bg-primary);
}

.tabPanel {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0;
  visibility: hidden;
  transform: translateY(10px);
  transition: opacity var(--transition-normal),
              transform var(--transition-normal),
              visibility 0s var(--transition-normal);
  overflow: hidden;
}

.tabPanelActive {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
  transition: opacity var(--transition-normal),
              transform var(--transition-normal),
              visibility 0s 0s;
}

/* ========================================
   フッター
   ======================================== */

.footer {
  flex-shrink: 0;
  height: var(--footer-height);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1rem;
  background-color: var(--color-bg-secondary);
  border-top: 1px solid var(--color-border);
}

.footerText {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  text-align: center;
}

.footerIcon {
  font-size: 1rem;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

/* ========================================
   ダークモード対応
   ======================================== */

@media (prefers-color-scheme: dark) {
  :root {
    --color-bg-primary: #1f2937;
    --color-bg-secondary: #111827;
    --color-bg-tertiary: #374151;
    --color-text-primary: #f9fafb;
    --color-text-secondary: #9ca3af;
    --color-text-tertiary: #6b7280;
    --color-border: #374151;
    --color-border-light: #4b5563;
    --color-accent: #3b82f6;
    --color-accent-hover: #60a5fa;
    --color-accent-light: rgba(59, 130, 246, 0.15);

    --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
    --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.4);
    --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.5);
  }

  .header {
    background: linear-gradient(135deg, #4c1d95 0%, #5b21b6 100%);
  }

  .tab:hover:not(.tabActive) {
    background-color: var(--color-bg-tertiary);
  }
}

/* ========================================
   レスポンシブ調整
   ======================================== */

/* 非常に狭い幅（300px以下） */
@media (max-width: 300px) {
  .header {
    height: 4.5rem;
    padding: 0.75rem 1rem;
  }

  .appTitle {
    font-size: 1.125rem;
  }

  .appIcon {
    font-size: 1.25rem;
  }

  .appSubtitle {
    font-size: 0.6875rem;
  }

  .tabHeader {
    height: 2.75rem;
  }

  .tab {
    padding: 0.5rem 0.75rem;
    font-size: 0.8125rem;
  }

  .tabIcon {
    font-size: 1rem;
  }

  .footer {
    height: 2.5rem;
  }

  .footerText {
    font-size: 0.6875rem;
  }
}

/* 中程度の幅（360px以上） */
@media (min-width: 360px) {
  .header {
    padding: 1.25rem 1.5rem;
  }

  .appTitle {
    font-size: 1.375rem;
  }

  .tab {
    gap: 0.625rem;
  }
}

/* 広い幅（480px以上） */
@media (min-width: 480px) {
  .header {
    height: 5.5rem;
    padding: 1.5rem 2rem;
  }

  .appTitle {
    font-size: 1.5rem;
  }

  .appSubtitle {
    font-size: 0.8125rem;
  }

  .tabHeader {
    height: 3.5rem;
  }

  .tab {
    font-size: 0.9375rem;
    padding: 1rem 1.25rem;
  }

  .footer {
    height: 3.5rem;
  }

  .footerText {
    font-size: 0.8125rem;
  }
}

/* ========================================
   アクセシビリティ: 動きを減らす設定
   ======================================== */

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  .appIcon,
  .footerIcon {
    animation: none;
  }
}

/* ========================================
   印刷用スタイル
   ======================================== */

@media print {
  .header,
  .footer,
  .tabHeader {
    display: none;
  }

  .app {
    height: auto;
  }

  .main {
    overflow: visible;
  }

  .tabPanel {
    position: static;
    opacity: 1 !important;
    visibility: visible !important;
    transform: none !important;
  }
}

/* ========================================
   高コントラストモード対応
   ======================================== */

@media (prefers-contrast: high) {
  .tab {
    border: 1px solid var(--border-color);
  }

  .tabActive {
    border-color: var(--color-accent);
    border-width: 2px;
  }

  .header {
    background: var(--color-accent);
  }
}

/* ========================================
   カスタムスクロールバー（Webkit）
   ======================================== */

.tabContent::-webkit-scrollbar {
  width: 8px;
}

.tabContent::-webkit-scrollbar-track {
  background-color: var(--color-bg-secondary);
}

.tabContent::-webkit-scrollbar-thumb {
  background-color: var(--color-border);
  border-radius: 4px;
}

.tabContent::-webkit-scrollbar-thumb:hover {
  background-color: var(--color-text-tertiary);
}
```

---

## 主な機能とデザイン

### 1. 視認性の向上

#### グラデーションヘッダー
- 紫系のグラデーション（`#667eea` → `#764ba2`）で視覚的に魅力的
- ダークモードでは深い紫（`#4c1d95` → `#5b21b6`）に自動切り替え

#### アニメーション効果
- **Sparkle**: アプリアイコン（✨）が回転とスケールで輝く
- **Bounce**: アクティブなタブアイコンが跳ねる
- **Pulse**: フッターアイコン（💡）が点滅して注意を引く
- **SlideIn**: タブインジケーターがスライドイン

#### 明確なタブ切り替え
- アクティブなタブに下線インジケーターを表示
- カラー変更（青系）で現在位置を明確化
- ホバー時に背景色と拡大効果

### 2. 使いやすさの改善

#### キーボード操作
```typescript
const handleTabKeyDown = useCallback((
  event: React.KeyboardEvent,
  tabId: TabType,
  index: number
): void => {
  if (event.key === 'ArrowLeft' && index > 0) {
    // 左矢印: 前のタブへ
    event.preventDefault();
    setActiveTab(TABS[index - 1].id);
  } else if (event.key === 'ArrowRight' && index < TABS.length - 1) {
    // 右矢印: 次のタブへ
    event.preventDefault();
    setActiveTab(TABS[index + 1].id);
  }
}, []);
```
- 矢印キー（← →）でタブ間を移動可能
- キーボードだけで全機能にアクセス可能

#### ホバーフィードバック
- すべてのインタラクティブ要素に視覚的な反応
- タブ: 背景色変更、アイコン拡大
- スムーズなトランジション（0.2秒）

#### スムーズなトランジション
```css
.tabPanel {
  opacity: 0;
  visibility: hidden;
  transform: translateY(10px);
  transition: opacity var(--transition-normal),
              transform var(--transition-normal),
              visibility 0s var(--transition-normal);
}

.tabPanelActive {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
  transition: opacity var(--transition-normal),
              transform var(--transition-normal),
              visibility 0s 0s;
}
```
- タブ切り替え時にフェードイン・スライドアップ効果
- 非アクティブなタブは`visibility: hidden`でアクセシビリティに配慮

### 3. アクセシビリティ

#### ARIA属性の完全実装
```typescript
<div className={styles.tabHeader} role="tablist" aria-label="パネル切り替え">
  {TABS.map((tab, index) => (
    <button
      key={tab.id}
      role="tab"
      aria-selected={activeTab === tab.id}
      aria-controls={`panel-${tab.id}`}
      aria-label={tab.ariaLabel}
      id={`tab-${tab.id}`}
      tabIndex={activeTab === tab.id ? 0 : -1}
    >
      {/* ... */}
    </button>
  ))}
</div>
```

| 属性 | 用途 |
|------|------|
| `role="tablist"` | タブリストであることを明示 |
| `role="tab"` | タブボタンであることを明示 |
| `role="tabpanel"` | タブコンテンツであることを明示 |
| `aria-selected` | 選択状態を通知 |
| `aria-controls` | 制御するパネルを関連付け |
| `aria-label` | 要素の説明を提供 |
| `aria-labelledby` | 関連するラベルを参照 |
| `aria-hidden` | 非表示状態を通知 |
| `tabIndex` | キーボードフォーカスの管理 |

#### キーボードナビゲーション
- `Tab`キー: 次の要素へ移動
- `Shift + Tab`: 前の要素へ移動
- `←→`矢印キー: タブ間を移動
- `Enter/Space`: タブを選択

#### 動きを減らす設定
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  .appIcon,
  .footerIcon {
    animation: none;
  }
}
```
- OSの「動きを減らす」設定に対応
- アニメーションを最小限に抑制

### 4. レスポンシブ対応

#### ブレークポイント

| 幅 | ヘッダー高さ | タイトルサイズ | タブ高さ | 用途 |
|-----|-------------|--------------|---------|------|
| 〜300px | 4.5rem | 1.125rem | 2.75rem | 超狭いパネル |
| 301〜359px | 5rem | 1.25rem | 3rem | 標準パネル |
| 360〜479px | 5rem | 1.375rem | 3rem | 中程度パネル |
| 480px〜 | 5.5rem | 1.5rem | 3.5rem | 広いパネル |

#### ダークモード
```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg-primary: #1f2937;
    --color-bg-secondary: #111827;
    --color-bg-tertiary: #374151;
    --color-text-primary: #f9fafb;
    --color-text-secondary: #9ca3af;
    /* ... */
  }

  .header {
    background: linear-gradient(135deg, #4c1d95 0%, #5b21b6 100%);
  }
}
```
- OSの設定に基づいて自動切り替え
- すべての色がダークモード対応

#### 高コントラストモード
```css
@media (prefers-contrast: high) {
  .tab {
    border: 1px solid var(--color-border);
  }

  .tabActive {
    border-color: var(--color-accent);
    border-width: 2px;
  }

  .header {
    background: var(--color-accent);
  }
}
```
- 視覚障害者向けの高コントラスト表示
- 境界線を強調して要素を明確化

#### 印刷対応
```css
@media print {
  .header,
  .footer,
  .tabHeader {
    display: none;
  }

  .app {
    height: auto;
  }

  .main {
    overflow: visible;
  }

  .tabPanel {
    position: static;
    opacity: 1 !important;
    visibility: visible !important;
    transform: none !important;
  }
}
```
- ヘッダー・フッター・タブヘッダーを非表示
- すべてのコンテンツを展開して印刷

### 5. パフォーマンス最適化

#### 条件付きレンダリング
```typescript
<div
  id="panel-keywords"
  role="tabpanel"
  aria-labelledby="tab-keywords"
  aria-hidden={activeTab !== 'keywords'}
  className={`${styles.tabPanel} ${
    activeTab === 'keywords' ? styles.tabPanelActive : ''
  }`}
>
  {activeTab === 'keywords' && <KeywordSelector />}
</div>
```
- 非アクティブなタブのコンポーネントはレンダリングしない
- 初回レンダリング時のパフォーマンス向上

#### CSS変数の活用
```css
:root {
  --color-bg-primary: #ffffff;
  --color-accent: #3b82f6;
  --transition-normal: 0.2s ease;
  --header-height: 5rem;
  /* ... */
}
```
- 一箇所で定義、全体で利用
- ブラウザの再計算を最小化
- テーマ切り替えが効率的

#### useCallbackによるメモ化
```typescript
const handleTabChange = useCallback((tabId: TabType): void => {
  setActiveTab(tabId);
}, []);

const handleTabKeyDown = useCallback((
  event: React.KeyboardEvent,
  tabId: TabType,
  index: number
): void => {
  // ...
}, []);
```
- イベントハンドラの再生成を防止
- 子コンポーネントの不要な再レンダリングを抑制

### 6. デザインの工夫

#### 視覚的階層
```
┌─────────────────────────┐
│  Header (固定高さ)      │ ← グラデーション背景で目立つ
├─────────────────────────┤
│                         │
│  PromptEditor           │ ← 主要な作業エリア
│  (可変高さ)             │
│                         │
├─────────────────────────┤
│  Tab Header (固定高さ)  │ ← ナビゲーション
├─────────────────────────┤
│                         │
│  Tab Content            │ ← コンテンツ表示エリア
│  (残りの高さを占有)     │
│                         │
├─────────────────────────┤
│  Footer (固定高さ)      │ ← ヒント表示
└─────────────────────────┘
```

#### 適切な余白
- ヘッダー: `padding: 1rem 1.25rem`
- タブ: `gap: 0.5rem`（アイコンとラベル間）
- フッター: `padding: 0.75rem 1rem`
- 過密にならない快適な視覚空間

#### 一貫性
- すべてのコンポーネントで統一されたカラーパレット
- トランジション速度の統一（0.15s/0.2s/0.3s）
- アイコン + テキストの組み合わせパターン
- CSS Modulesによるスタイルの隔離

---

## 技術的なポイント

### タブ実装のベストプラクティス

#### WAI-ARIA Tabsパターン準拠
```typescript
// ✅ ARIA属性の完全実装
role="tablist"          // タブリストコンテナ
role="tab"              // 各タブボタン
role="tabpanel"         // 各タブパネル
aria-selected={boolean} // 選択状態
aria-controls="panel-id" // 制御するパネルID
aria-labelledby="tab-id" // 関連するタブID
aria-hidden={boolean}    // 非表示状態

// ✅ キーボードナビゲーション
tabIndex={activeTab === tab.id ? 0 : -1} // フォーカス管理
onKeyDown={handleTabKeyDown}             // 矢印キー対応
```

参考: [WAI-ARIA Authoring Practices - Tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/)

#### CSS-in-JSではなくCSS Modulesを選択
**理由:**
- サイドパネルは軽量性が重要
- CSS-in-JS（Emotion, styled-components）はランタイムコストがある
- CSS Modulesはビルド時に静的CSSに変換される
- バンドルサイズが小さく、初期ロードが高速

### Context API活用パターン

```typescript
// App.tsx (Provider)
const App: React.FC = () => {
  return (
    <PromptProvider>
      <AppContent />
    </PromptProvider>
  );
};

// 子コンポーネント (Consumer)
import { usePrompt } from '../contexts/PromptContext';

const PromptEditor: React.FC = () => {
  const { promptText, updatePromptText } = usePrompt();
  // ...
};
```

**メリット:**
- Prop Drillingの回避
- グローバルな状態管理
- コンポーネント間の疎結合化

### CSS変数によるテーマ管理

```css
/* ライトモード（デフォルト） */
:root {
  --color-bg-primary: #ffffff;
  --color-text-primary: #111827;
  --color-accent: #3b82f6;
}

/* ダークモード（自動切り替え） */
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg-primary: #1f2937;
    --color-text-primary: #f9fafb;
    --color-accent: #3b82f6;
  }
}

/* 使用箇所 */
.app {
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
}
```

**メリット:**
- 一箇所の変更で全体に反映
- JavaScriptなしでテーマ切り替え
- パフォーマンスへの影響最小

---

## 使用方法

### 基本的な使い方

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### タブの追加方法

```typescript
// TABS配列に新しいタブを追加
const TABS: readonly TabConfig[] = [
  {
    id: 'keywords',
    label: 'キーワード',
    icon: '🏷️',
    ariaLabel: 'キーワード選択タブ'
  },
  {
    id: 'history',
    label: '履歴',
    icon: '📚',
    ariaLabel: '履歴管理タブ'
  },
  // 新しいタブを追加
  {
    id: 'settings',
    label: '設定',
    icon: '⚙️',
    ariaLabel: '設定タブ'
  }
] as const;

// TabTypeを更新
type TabType = 'keywords' | 'history' | 'settings';

// JSXに新しいパネルを追加
<div
  id="panel-settings"
  role="tabpanel"
  aria-labelledby="tab-settings"
  aria-hidden={activeTab !== 'settings'}
  className={`${styles.tabPanel} ${
    activeTab === 'settings' ? styles.tabPanelActive : ''
  }`}
>
  {activeTab === 'settings' && <SettingsPanel />}
</div>
```

---

## テスト戦略

### ユニットテスト

```typescript
// App.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

describe('App', () => {
  test('renders header with title', () => {
    render(<App />);
    expect(screen.getByText('プロンプトビルダー')).toBeInTheDocument();
  });

  test('switches tabs on click', () => {
    render(<App />);
    const historyTab = screen.getByRole('tab', { name: '履歴管理タブ' });
    fireEvent.click(historyTab);
    expect(historyTab).toHaveAttribute('aria-selected', 'true');
  });

  test('switches tabs with keyboard', () => {
    render(<App />);
    const keywordsTab = screen.getByRole('tab', { name: 'キーワード選択タブ' });
    keywordsTab.focus();
    fireEvent.keyDown(keywordsTab, { key: 'ArrowRight' });

    const historyTab = screen.getByRole('tab', { name: '履歴管理タブ' });
    expect(historyTab).toHaveAttribute('aria-selected', 'true');
  });

  test('renders correct ARIA attributes', () => {
    render(<App />);
    const tablist = screen.getByRole('tablist');
    expect(tablist).toHaveAttribute('aria-label', 'パネル切り替え');

    const keywordsPanel = screen.getByRole('tabpanel', { name: 'キーワード選択タブ' });
    expect(keywordsPanel).toBeInTheDocument();
  });
});
```

### アクセシビリティテスト

```typescript
// App.a11y.test.tsx
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import App from './App';

expect.extend(toHaveNoViolations);

describe('App Accessibility', () => {
  test('should not have any accessibility violations', async () => {
    const { container } = render(<App />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

---

## トラブルシューティング

### よくある問題と解決策

#### タブが切り替わらない

**原因:** 状態管理の問題
```typescript
// ❌ 間違い: stateを直接変更
setActiveTab(activeTab);

// ✅ 正解: 新しい値を設定
setActiveTab('history');
```

#### CSSが適用されない

**原因:** CSS Modulesのインポート忘れ
```typescript
// ❌ 間違い: 通常のインポート
import './App.css';

// ✅ 正解: CSS Modulesとしてインポート
import styles from './App.module.css';
```

#### ダークモードが機能しない

**原因:** CSS変数の上書き
```css
/* ❌ 間違い: 直接色を指定 */
.app {
  background-color: #ffffff;
}

/* ✅ 正解: CSS変数を使用 */
.app {
  background-color: var(--color-bg-primary);
}
```

#### アニメーションが重い

**原因:** will-changeの乱用
```css
/* ❌ 間違い: すべての要素にwill-change */
* {
  will-change: transform, opacity;
}

/* ✅ 正解: 必要な要素のみ */
.tabPanel {
  will-change: transform, opacity;
}

.tabPanelActive {
  will-change: auto; /* アニメーション完了後は解除 */
}
```

---

## 関連ドキュメント

### コンポーネント関連
- [PromptContext](../05-contexts/PromptContext.md) - 状態管理の中核
- [PromptEditor](./PromptEditor.md) - プロンプト編集コンポーネント
- [KeywordSelector](./KeywordSelector.md) - キーワード選択コンポーネント
- [HistoryPanel](./HistoryPanel.md) - 履歴管理コンポーネント

### 設計・アーキテクチャ
- [アプリケーション設計](../02-design/application-design.md) - 全体設計
- [コンポーネント設計](../02-design/component-design.md) - コンポーネント設計指針
- [スタイリング戦略](../02-design/styling-strategy.md) - CSSアーキテクチャ

### 開発ガイド
- [開発環境セットアップ](../03-setup/development-setup.md) - 環境構築
- [コーディング規約](../04-guidelines/coding-standards.md) - コード品質
- [アクセシビリティガイド](../04-guidelines/accessibility.md) - a11y実装

---

## 変更履歴

| バージョン | 日付 | 変更内容 | 担当者 |
|-----------|------|---------|--------|
| 1.0.0 | 2025-01-XX | 初版作成 | - |

---

## まとめ

Appコンポーネントは、アプリケーション全体の基盤となる重要なコンポーネントです。以下の特徴により、優れたユーザー体験を提供します：

### 主要な強み
✅ **アクセシビリティ**: WAI-ARIAパターンに準拠した完全なキーボード操作対応
✅ **レスポンシブ**: 300px〜480px+の幅に対応した適応的レイアウト
✅ **パフォーマンス**: 条件付きレンダリング、CSS変数、useCallbackによる最適化
✅ **保守性**: CSS Modules、TypeScript、明確な構造による高いメンテナンス性
✅ **視覚デザイン**: グラデーション、アニメーション、ダークモード対応

### 次のステップ
1. 子コンポーネント（PromptEditor, KeywordSelector, HistoryPanel）の実装
2. ユニットテスト・E2Eテストの追加
3. 実機でのアクセシビリティテスト
4. パフォーマンス計測と最適化

このコンポーネントを基盤として、高品質なプロンプトビルダーアプリケーションを構築していきます。
