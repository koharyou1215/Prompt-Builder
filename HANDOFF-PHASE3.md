# フェーズ3 実装引き継ぎドキュメント

## 📋 プロジェクト概要

**プロジェクト名**: インタラクティブAIプロンプト・ビルダー
**技術スタック**: React 18 + TypeScript 5.3 + Vite 5 + Chrome Extension (Manifest V3)
**現在のステータス**: フェーズ1＆2完了、フェーズ3実装待ち

---

## ✅ 完了済みフェーズ

### フェーズ1: 基盤整備（完了）

**実装内容**:
1. ✅ `src/constants.ts` の作成（アプリケーション全体の定数を一元管理）
2. ✅ `src/utils/id.ts` の作成（ID生成ロジックの統一）
3. ✅ `src/components/ErrorBoundary.tsx` の作成（エラーハンドリング）
4. ✅ 既存コード6ファイルの定数・ID生成の置き換え

**成果**:
- コード削減: 約70行
- 型エラー: 0件
- ビルド: 正常

### フェーズ2: 重複コード削減（完了）

**実装内容**:
1. ✅ `src/hooks/useTranslation.ts` の完全リファクタリング
2. ✅ `useBidirectionalTranslationCore` 共通ロジックの抽出
3. ✅ `useTranslation` と `useNegativeTranslation` をラッパー化

**成果**:
- コード削減: 165行 (31.5%)
- 重複コード: 完全排除
- バンドルサイズ: -1.69 kB

**統合テスト**: ✅ 全テスト合格（6/6テストパス）

---

## 🎯 フェーズ3: スタイリング改善

### 実装目標

**問題**: インラインスタイル、グローバルCSS、CSS-in-JSが混在しており、保守性が低い

**解決策**: CSS Modulesへの段階的移行とスタイルの統一

### 実装タスク

#### タスク1: CSS Modulesのセットアップ確認
- Viteは標準でCSS Modulesをサポート
- `*.module.css` ファイルが自動的にCSS Modulesとして扱われる
- 追加設定は不要

#### タスク2: 優先順位の高いコンポーネントから移行

**Phase 3.1: KeywordSelector.tsx の移行**
- 現状: 大量のインラインスタイル（45-62行目）
- ターゲット: `src/components/KeywordSelector.tsx`
- 作成ファイル: `src/components/KeywordSelector.module.css`

**Phase 3.2: MainPanel.tsx の移行**
- 現状: インラインスタイル（23, 28行目）
- ターゲット: `src/components/MainPanel.tsx`
- 作成ファイル: `src/components/MainPanel.module.css`

**Phase 3.3: ErrorBoundary.tsx の移行**
- 現状: Fallback UIに大量のインラインスタイル（144-307行目）
- ターゲット: `src/components/ErrorBoundary.tsx`
- 作成ファイル: `src/components/ErrorBoundary.module.css`

#### タスク3: グローバルスタイルの最適化
- `src/index.css` のCSS変数を活用
- コンポーネント固有のスタイルをCSS Modulesに移行
- グローバルスタイルは基本スタイルのみに限定

#### タスク4: デザインシステムの確立
- CSS変数の一貫した使用
- 色、スペーシング、タイポグラフィの統一
- `index.css` の既存変数を最大限活用

---

## 📂 プロジェクト構造

```
src/
├── constants.ts              # ✅ 新規作成（フェーズ1）
├── utils/
│   └── id.ts                 # ✅ 新規作成（フェーズ1）
├── components/
│   ├── ErrorBoundary.tsx     # ✅ 新規作成（フェーズ1）
│   ├── KeywordSelector.tsx   # 🔄 スタイル移行対象
│   ├── MainPanel.tsx         # 🔄 スタイル移行対象
│   ├── PromptEditor.tsx
│   ├── TranslationArea.tsx
│   ├── HistoryPanel.tsx
│   ├── SettingsPanel.tsx
│   ├── TabNavigation.tsx
│   └── AddKeywordModal.tsx
├── hooks/
│   ├── useTranslation.ts     # ✅ リファクタリング完了（フェーズ2）
│   ├── useHistory.ts         # ✅ 更新済み（フェーズ1）
│   └── useCustomKeywords.ts  # ✅ 更新済み（フェーズ1）
├── services/
│   ├── translationService.ts # ✅ 更新済み（フェーズ1）
│   └── storageService.ts     # ✅ 更新済み（フェーズ1）
├── contexts/
│   ├── PromptContext.tsx
│   └── SettingsContext.tsx
├── index.css                 # 🔄 グローバルスタイル最適化対象
└── App.tsx                   # ✅ ErrorBoundary統合済み
```

---

## 🔧 技術的な制約・ルール

### 必須ルール（RULES.md準拠）

1. **型安全性**: `any`型は絶対禁止、`unknown`を使用
2. **Read before Edit/Write**: ファイル編集前に必ず読み込み
3. **日本語出力**: ユーザー向けメッセージは日本語
4. **並列実行**: 独立したタスクは並列実行
5. **TodoWrite使用**: 3ステップ以上のタスクで使用

### CSS Modules命名規則

```typescript
// Good
import styles from './Component.module.css';
<div className={styles.container} />

// Bad
<div style={{ padding: '20px' }} />
```

### CSS変数の使用

```css
/* 既存のCSS変数を活用（index.css） */
.container {
  color: var(--color-text);
  background: var(--color-surface);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
}
```

---

## 📝 実装手順（推奨）

### ステップ1: KeywordSelector.tsx の移行

```bash
# 1. 既存ファイルを読み込み
Read src/components/KeywordSelector.tsx

# 2. CSS Moduleファイルを作成
Write src/components/KeywordSelector.module.css

# 3. KeywordSelector.tsxを更新
Edit src/components/KeywordSelector.tsx

# 4. 型チェック
npm run type-check

# 5. ビルド確認
npm run build
```

### ステップ2: MainPanel.tsx の移行

```bash
# 同様の手順を繰り返し
```

### ステップ3: ErrorBoundary.tsx の移行

```bash
# 同様の手順を繰り返し
```

### ステップ4: 統合テスト

```bash
# 型チェック
npm run type-check

# ビルド
npm run build

# バンドルサイズ確認
# 期待: さらなるサイズ削減
```

---

## 🎨 スタイリングガイドライン

### インラインスタイルの例（Before）

```tsx
// ❌ 悪い例（現状）
<div style={{
  padding: '20px',
  backgroundColor: '#f9fafb',
  borderRadius: '8px'
}}>
  {children}
</div>
```

### CSS Modulesの例（After）

```css
/* Component.module.css */
.container {
  padding: var(--spacing-lg);
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
}
```

```tsx
// ✅ 良い例
import styles from './Component.module.css';

<div className={styles.container}>
  {children}
</div>
```

---

## 📊 期待される成果

### コード品質

- **可読性**: インラインスタイル削減により大幅向上
- **保守性**: CSS Modulesにより変更が容易
- **再利用性**: スタイルの共通化とCSS変数の活用
- **バンドルサイズ**: 未使用CSSの削除により削減

### 定量的目標

- インラインスタイル: 70%以上削減
- CSS Modulesファイル: 3-5個作成
- バンドルサイズ: 追加で1-2 kB削減（期待値）
- 型エラー: 0件維持

---

## 🚀 実装開始コマンド

新しいセッションで以下のコマンドを実行してください：

```
フェーズ3（スタイリング改善）を実装してください。

対象:
1. src/components/KeywordSelector.tsx のCSS Modules化
2. src/components/MainPanel.tsx のCSS Modules化
3. src/components/ErrorBoundary.tsx のCSS Modules化

実装後、型チェックとビルド検証を行ってください。
```

---

## 📌 重要な注意事項

### 必ず確認すること

1. ✅ `src/index.css` の既存CSS変数を優先的に使用
2. ✅ TypeScript型エラーが発生しないこと
3. ✅ ビルドが正常に完了すること
4. ✅ 既存機能への影響がないこと（UIは変更なし）

### やってはいけないこと

1. ❌ UIの見た目を変更する（スタイルの内容は同じに保つ）
2. ❌ グローバルCSSを完全に削除する（基本スタイルは残す）
3. ❌ 複数コンポーネントを同時に変更する（1つずつ移行）
4. ❌ 型安全性を犠牲にする

---

## 📈 進捗管理

### フェーズ3チェックリスト

```
[ ] KeywordSelector.module.css の作成
[ ] KeywordSelector.tsx の更新
[ ] MainPanel.module.css の作成
[ ] MainPanel.tsx の更新
[ ] ErrorBoundary.module.css の作成
[ ] ErrorBoundary.tsx の更新
[ ] 型チェック（npm run type-check）
[ ] ビルド検証（npm run build）
[ ] バンドルサイズ確認
[ ] 統合テスト実施
```

---

## 💡 参考情報

### 既存のCSS変数（index.css）

```css
/* 色 */
--color-primary: #3b82f6
--color-background: #ffffff
--color-surface: #f9fafb
--color-border: #e5e7eb
--color-text: #111827
--color-text-secondary: #6b7280

/* スペーシング */
--spacing-xs: 0.25rem
--spacing-sm: 0.5rem
--spacing-md: 1rem
--spacing-lg: 1.5rem
--spacing-xl: 2rem

/* ボーダー半径 */
--radius-sm: 0.25rem
--radius-md: 0.5rem
--radius-lg: 0.75rem
```

### Vite CSS Modules設定

Viteは自動的に `*.module.css` をCSS Modulesとして処理します。追加設定は不要です。

```typescript
// 自動的に型が推論される
import styles from './Component.module.css';
// styles.className の形式でアクセス
```

---

## 🎓 学習リソース

- [CSS Modules公式ドキュメント](https://github.com/css-modules/css-modules)
- [Vite CSS Modules](https://vitejs.dev/guide/features.html#css-modules)
- [React CSS Modules](https://create-react-app.dev/docs/adding-a-css-modules-stylesheet/)

---

## 📞 トラブルシューティング

### 問題: CSS Modulesの型エラー

**解決策**: `src/vite-env.d.ts` に型定義があることを確認

```typescript
/// <reference types="vite/client" />
```

### 問題: スタイルが適用されない

**解決策**:
1. ファイル名が `*.module.css` であることを確認
2. インポート文が正しいことを確認
3. クラス名が存在することを確認

---

**このドキュメントを使用して、新しいセッションでフェーズ3をスムーズに開始できます。**

**実装開始時の推奨プロンプト**:
```
このプロジェクトのフェーズ3（スタイリング改善）を実装します。
HANDOFF-PHASE3.md を読み込んで、実装手順に従ってください。
```
