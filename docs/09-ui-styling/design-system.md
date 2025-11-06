# デザインシステム

> **ドキュメント情報**
> 作成日: 2025-10-19
> カテゴリ: UI/スタイリング
> 関連: [レスポンシブデザイン](responsive-design.md) | [App設計](../06-components/App.md)

---

## 📖 概要

このプロジェクトのデザインシステムは、一貫性のある美しいUIを実現するための設計ガイドラインです。

---

## 🎨 カラーパレット

### プライマリカラー

```css
:root {
  /* メインブランドカラー */
  --color-primary: #6366f1;      /* Indigo 500 */
  --color-primary-dark: #4f46e5; /* Indigo 600 */
  --color-primary-light: #818cf8; /* Indigo 400 */

  /* アクセントカラー */
  --color-accent: #8b5cf6;       /* Violet 500 */
  --color-accent-light: #a78bfa; /* Violet 400 */
}
```

### ニュートラルカラー

```css
:root {
  /* 背景 */
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f9fafb;  /* Gray 50 */
  --color-bg-tertiary: #f3f4f6;   /* Gray 100 */

  /* テキスト */
  --color-text-primary: #111827;  /* Gray 900 */
  --color-text-secondary: #6b7280; /* Gray 500 */
  --color-text-tertiary: #9ca3af;  /* Gray 400 */

  /* ボーダー */
  --color-border: #e5e7eb;        /* Gray 200 */
  --color-border-hover: #d1d5db;  /* Gray 300 */
}
```

### ステータスカラー

```css
:root {
  /* 成功 */
  --color-success: #10b981;       /* Green 500 */
  --color-success-bg: #d1fae5;    /* Green 100 */

  /* エラー */
  --color-error: #ef4444;         /* Red 500 */
  --color-error-bg: #fee2e2;      /* Red 100 */

  /* 警告 */
  --color-warning: #f59e0b;       /* Amber 500 */
  --color-warning-bg: #fef3c7;    /* Amber 100 */

  /* 情報 */
  --color-info: #3b82f6;          /* Blue 500 */
  --color-info-bg: #dbeafe;       /* Blue 100 */
}
```

### ダークモード

```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg-primary: #111827;     /* Gray 900 */
    --color-bg-secondary: #1f2937;   /* Gray 800 */
    --color-bg-tertiary: #374151;    /* Gray 700 */

    --color-text-primary: #f9fafb;   /* Gray 50 */
    --color-text-secondary: #d1d5db; /* Gray 300 */
    --color-text-tertiary: #9ca3af;  /* Gray 400 */

    --color-border: #374151;         /* Gray 700 */
    --color-border-hover: #4b5563;   /* Gray 600 */
  }
}
```

---

## 📏 スペーシング

### スペーススケール

```css
:root {
  --space-xs: 0.25rem;   /* 4px */
  --space-sm: 0.5rem;    /* 8px */
  --space-md: 1rem;      /* 16px */
  --space-lg: 1.5rem;    /* 24px */
  --space-xl: 2rem;      /* 32px */
  --space-2xl: 3rem;     /* 48px */
  --space-3xl: 4rem;     /* 64px */
}
```

### 使用例

```css
.button {
  padding: var(--space-sm) var(--space-md);
  margin-bottom: var(--space-md);
}

.section {
  padding: var(--space-lg);
  gap: var(--space-md);
}
```

---

## ✍️ タイポグラフィ

### フォントファミリー

```css
:root {
  --font-family-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                      'Helvetica Neue', Arial, sans-serif;
  --font-family-mono: 'SF Mono', 'Consolas', 'Monaco', monospace;
  --font-family-jp: 'Hiragino Sans', 'Yu Gothic', 'Meiryo', sans-serif;
}

body {
  font-family: var(--font-family-sans), var(--font-family-jp);
}
```

### フォントサイズ

```css
:root {
  --font-size-xs: 0.75rem;    /* 12px */
  --font-size-sm: 0.875rem;   /* 14px */
  --font-size-base: 1rem;     /* 16px */
  --font-size-lg: 1.125rem;   /* 18px */
  --font-size-xl: 1.25rem;    /* 20px */
  --font-size-2xl: 1.5rem;    /* 24px */
  --font-size-3xl: 1.875rem;  /* 30px */
}
```

### フォントウェイト

```css
:root {
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
}
```

### 行間

```css
:root {
  --line-height-tight: 1.25;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.75;
}
```

---

## 🔘 ボタンスタイル

### プライマリボタン

```css
.button-primary {
  background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
  color: white;
  padding: var(--space-sm) var(--space-lg);
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-medium);
  transition: all 0.2s ease;
}

.button-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.button-primary:active {
  transform: translateY(0);
}
```

### セカンダリボタン

```css
.button-secondary {
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  padding: var(--space-sm) var(--space-lg);
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
}

.button-secondary:hover {
  background: var(--color-bg-tertiary);
  border-color: var(--color-border-hover);
}
```

### 危険なアクション

```css
.button-danger {
  background: var(--color-error);
  color: white;
  padding: var(--space-sm) var(--space-lg);
  border-radius: var(--radius-md);
}

.button-danger:hover {
  background: #dc2626; /* Red 600 */
}
```

---

## 📦 ボーダー半径

```css
:root {
  --radius-sm: 0.25rem;   /* 4px */
  --radius-md: 0.5rem;    /* 8px */
  --radius-lg: 0.75rem;   /* 12px */
  --radius-xl: 1rem;      /* 16px */
  --radius-full: 9999px;  /* 完全な円形 */
}
```

---

## 🌑 シャドウ

```css
:root {
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
               0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
               0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
               0 10px 10px -5px rgba(0, 0, 0, 0.04);
}
```

---

## 🎭 アニメーション

### トランジション

```css
:root {
  --transition-fast: 150ms ease-in-out;
  --transition-base: 200ms ease-in-out;
  --transition-slow: 300ms ease-in-out;
}
```

### イージング

```css
:root {
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
}
```

### キーフレーム

```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideIn {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}
```

---

## 📱 ブレークポイント

```css
:root {
  --breakpoint-xs: 360px;
  --breakpoint-sm: 480px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
}
```

### メディアクエリ

```css
/* モバイル（最小360px） */
@media (min-width: 360px) { ... }

/* タブレット（最小768px） */
@media (min-width: 768px) { ... }

/* デスクトップ（最小1024px） */
@media (min-width: 1024px) { ... }
```

---

## ♿ アクセシビリティ

### フォーカススタイル

```css
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.button:focus-visible {
  ring: 2px solid var(--color-primary);
  ring-offset: 2px;
}
```

### 動きを減らす設定

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 📚 関連ドキュメント

- [レスポンシブデザイン](responsive-design.md) - ブレークポイント詳細
- [App設計](../06-components/App.md) - デザイン適用例
- [PromptEditor設計](../06-components/PromptEditor.md) - スタイリング実例

---

## 🔄 次のステップ

1. `src/index.css`にCSS変数を設定
2. 各コンポーネントでデザインシステムを活用
3. ダークモード対応を実装
