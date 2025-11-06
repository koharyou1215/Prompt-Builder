# レスポンシブデザイン設計

> **ドキュメント情報**
> 作成日: 2025-10-19
> カテゴリ: UI/スタイリング
> 関連: [デザインシステム](design-system.md) | [App設計](../06-components/App.md) | [概要](../00-overview.md)

---

## 📖 概要

このプロジェクトは**iPhone 15 Pro Max（430x932 viewport）** を主要ターゲットとしたモバイルファーストのレスポンシブデザインです。

---

## 🎯 ターゲットデバイス

### プライマリターゲット

| デバイス | 解像度 | ビューポート | 備考 |
|---------|-------|------------|------|
| **iPhone 15 Pro Max** | 430x932px | メイン | iOS Safari最適化 |
| **iPhone 15 Pro** | 393x852px | サブ | 同様の体験 |

### セカンダリターゲット

| デバイスカテゴリ | 解像度範囲 | 備考 |
|-----------------|-----------|------|
| **小型スマートフォン** | 360px-480px | 最小サポート |
| **タブレット** | 768px-1024px | iPad等 |
| **デスクトップ** | 1024px+ | 拡張サポート |

---

## 📐 ブレークポイント戦略

### ブレークポイント定義

```css
:root {
  /* 最小サポート（小型スマホ） */
  --breakpoint-xs: 360px;

  /* 標準スマホ（iPhone SE等） */
  --breakpoint-sm: 480px;

  /* タブレット（iPad等） */
  --breakpoint-md: 768px;

  /* デスクトップ（小型） */
  --breakpoint-lg: 1024px;

  /* デスクトップ（大型） */
  --breakpoint-xl: 1280px;
}
```

### レイアウト戦略

```
360px-767px   : モバイル（単一カラム）
768px-1023px  : タブレット（2カラム）
1024px+       : デスクトップ（3カラム可能）
```

---

## 📱 モバイルファースト設計

### 基本原則

1. **モバイルを基準に設計** - 最小画面から始める
2. **プログレッシブエンハンスメント** - 画面が大きくなるにつれて機能追加
3. **タッチ優先** - タップターゲットは最小44x44pt
4. **シンプルなナビゲーション** - モバイルでは最小限のUI

### モバイルファーストCSS

```css
/* ベース（モバイル: 360px+） */
.container {
  padding: var(--space-md);
  width: 100%;
}

/* タブレット（768px+） */
@media (min-width: 768px) {
  .container {
    padding: var(--space-lg);
    max-width: 720px;
    margin: 0 auto;
  }
}

/* デスクトップ（1024px+） */
@media (min-width: 1024px) {
  .container {
    max-width: 960px;
    display: grid;
    grid-template-columns: 250px 1fr 300px;
  }
}
```

---

## 🍎 iOS Safari最適化

### セーフエリア対応

```css
.app-container {
  /* iOSのノッチ・ホームインジケーター対応 */
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}
```

### ビューポート設定

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
```

### iOS特有のスタイル

```css
/* iOS Safariのタップハイライト無効化 */
* {
  -webkit-tap-highlight-color: transparent;
}

/* iOS Safariのスクロールバウンス無効化（オプション） */
body {
  overscroll-behavior-y: none;
}

/* iOS Safariのスムーズスクロール */
* {
  -webkit-overflow-scrolling: touch;
}
```

---

## 🎨 レスポンシブレイアウトパターン

### パターン1: モバイル単一カラム → デスクトップ複数カラム

```css
.main-layout {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

@media (min-width: 768px) {
  .main-layout {
    flex-direction: row;
    gap: var(--space-lg);
  }

  .main-layout > .sidebar {
    width: 250px;
    flex-shrink: 0;
  }

  .main-layout > .content {
    flex: 1;
  }
}
```

### パターン2: グリッドレイアウト

```css
.keyword-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: var(--space-sm);
}

@media (min-width: 768px) {
  .keyword-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: var(--space-md);
  }
}
```

### パターン3: フレキシブルなカード

```css
.history-card {
  padding: var(--space-md);
  font-size: var(--font-size-sm);
}

@media (min-width: 768px) {
  .history-card {
    padding: var(--space-lg);
    font-size: var(--font-size-base);
  }
}
```

---

## 🖱️ タッチ対応

### タップターゲットサイズ

```css
/* 最小タップターゲット: 44x44pt（iOS推奨） */
.button,
.keyword-button,
.history-item {
  min-width: 44px;
  min-height: 44px;
  padding: var(--space-sm) var(--space-md);
}
```

### タッチフィードバック

```css
.button {
  transition: transform 0.1s ease;
}

.button:active {
  transform: scale(0.95);
}

/* iOSのタップハイライト色をカスタマイズ */
.button {
  -webkit-tap-highlight-color: rgba(99, 102, 241, 0.1);
}
```

---

## 📏 フォントサイズのスケーリング

### ベースフォントサイズ

```css
:root {
  /* モバイル: 14px */
  font-size: 14px;
}

@media (min-width: 768px) {
  :root {
    /* タブレット: 15px */
    font-size: 15px;
  }
}

@media (min-width: 1024px) {
  :root {
    /* デスクトップ: 16px */
    font-size: 16px;
  }
}
```

### レスポンシブタイポグラフィ

```css
.heading-1 {
  font-size: clamp(1.5rem, 4vw, 2.5rem);
  line-height: var(--line-height-tight);
}

.heading-2 {
  font-size: clamp(1.25rem, 3vw, 2rem);
}

.body-text {
  font-size: clamp(0.875rem, 2vw, 1rem);
  line-height: var(--line-height-normal);
}
```

---

## 🖼️ イメージとメディア

### レスポンシブ画像

```css
img {
  max-width: 100%;
  height: auto;
  display: block;
}

picture {
  width: 100%;
}
```

### アイコンサイズ

```css
.icon {
  width: 20px;
  height: 20px;
}

@media (min-width: 768px) {
  .icon {
    width: 24px;
    height: 24px;
  }
}
```

---

## 📊 コンテナクエリ（将来的）

```css
/* コンテナクエリによるコンポーネントレベルのレスポンシブ */
.card-container {
  container-type: inline-size;
}

@container (min-width: 400px) {
  .card {
    display: grid;
    grid-template-columns: 100px 1fr;
  }
}
```

---

## ♿ アクセシビリティ

### ズーム対応

```css
/* テキストサイズのユーザー設定に追従 */
body {
  font-size: 1rem; /* ブラウザのデフォルト設定を尊重 */
}

/* remベースで全サイズを定義 */
.button {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}
```

### スクリーンリーダー対応

```css
/* 視覚的に隠すが、スクリーンリーダーでは読み上げ */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

---

## 🧪 テスト戦略

### デバイステスト

| デバイス | テスト内容 |
|---------|-----------|
| **iPhone 15 Pro Max** | 主要機能すべて |
| **iPhone SE（第3世代）** | 最小画面での動作 |
| **iPad** | タブレットレイアウト |
| **Chrome DevTools** | 各ブレークポイント |

### チェックリスト

- [ ] タップターゲットは44x44pt以上
- [ ] セーフエリア対応済み
- [ ] 横向きモード対応
- [ ] フォントサイズがユーザー設定に追従
- [ ] 画像が画面をはみ出さない
- [ ] スクロールがスムーズ

---

## 📚 関連ドキュメント

- [デザインシステム](design-system.md) - カラー、スペーシング、タイポグラフィ
- [App設計](../06-components/App.md) - レスポンシブレイアウト実例
- [PromptEditor設計](../06-components/PromptEditor.md) - モバイル最適化例
- [プロジェクト概要](../00-overview.md) - 開発環境とターゲット

---

## 🔄 次のステップ

1. 各コンポーネントでモバイルファーストCSS実装
2. iPhone 15 Pro Maxで実機テスト
3. セーフエリア対応の確認
4. パフォーマンス最適化
