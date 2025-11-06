# インタラクティブAIプロンプト・ビルダー 設計ドキュメント

> **プロジェクト情報**
> バージョン: 1.0.0
> 最終更新: 2025-10-19
> ステータス: 設計フェーズ完了

---

## 📚 ドキュメント概要

このディレクトリには、**インタラクティブAIプロンプト・ビルダー** Chrome拡張機能の完全な設計ドキュメントが含まれています。

元の単一ファイル設計図（5919行）を、保守性と可読性を向上させるため、**17個の専門ドキュメント**に分散化しました。

---

## 🎯 クイックスタート

### 初めての方

1. **[📖 プロジェクト概要](00-overview.md)** - 機能仕様と要件を理解
2. **[🏗️ アーキテクチャ設計](01-architecture.md)** - 技術スタック と構成を把握
3. **[📝 型定義設計](02-types-design.md)** - TypeScript型システムを確認

### 実装開始の方

1. **[🔧 ビルド設定](08-deployment/build-config.md)** - 環境構築
2. **[🔄 状態管理設計](03-state-management.md)** - React Contextの実装
3. **[🧩 コンポーネント設計](06-components/)** - UIコンポーネントの実装

### デプロイの方

1. **[☁️ GAS翻訳APIデプロイ](08-deployment/gas-deployment.md)** - 翻訳API設定
2. **[🚀 Chrome拡張インストール](08-deployment/chrome-extension.md)** - 拡張機能の読み込み

---

## 📁 ドキュメント構成

### 🏁 基礎ドキュメント

| ファイル | 内容 | 対象読者 |
|---------|------|---------|
| [00-overview.md](00-overview.md) | プロジェクト概要、機能仕様 | 全員 |
| [01-architecture.md](01-architecture.md) | システムアーキテクチャ、技術選定 | 全員 |
| [02-types-design.md](02-types-design.md) | TypeScript型定義の詳細 | 開発者 |
| [03-state-management.md](03-state-management.md) | React Context状態管理設計 | 開発者 |

---

### 📊 データレイヤー

| ディレクトリ/ファイル | 内容 |
|-------------------|------|
| [04-data/keywords-design.md](04-data/keywords-design.md) | キーワードマスターデータ設計 |

**キーワード統計**:
- カテゴリ数: 14（ポジティブ10 + ネガティブ4）
- キーワード総数: 69

---

### 🪝 カスタムフックレイヤー

| ファイル | 内容 | 依存関係 |
|---------|------|---------|
| [05-hooks/useTranslation.md](05-hooks/useTranslation.md) | 双方向翻訳フック設計 | PromptContext, translationService |
| [05-hooks/useHistory.md](05-hooks/useHistory.md) | 履歴管理フック設計 | PromptContext, storageService |

**重要**: useTranslationには **コード重複の改善提案** が含まれています。

---

### 🧩 コンポーネントレイヤー

| ファイル | 内容 | 主な機能 |
|---------|------|---------|
| [06-components/App.md](06-components/App.md) | メインアプリケーションレイアウト | 全体構成、タブUI |
| [06-components/PromptEditor.md](06-components/PromptEditor.md) | プロンプト編集コンポーネント | 双方向翻訳UI、コピー機能 |
| [06-components/HistoryPanel.md](06-components/HistoryPanel.md) | 履歴管理パネル | 検索、保存、復元 |

**含まれるコード**: TypeScript実装 + CSS Modules

---

### 🔌 サービスレイヤー

| ファイル | 内容 | 外部依存 |
|---------|------|---------|
| [07-services/translation-service.md](07-services/translation-service.md) | 翻訳API通信サービス | Google Apps Script API |
| [07-services/storage-service.md](07-services/storage-service.md) | Chrome Storage操作サービス | Chrome Storage API |

**セキュリティ**: 環境変数管理とエラーハンドリングの実装例を含む

---

### 🚀 デプロイメントレイヤー

| ファイル | 内容 | 対象環境 |
|---------|------|---------|
| [08-deployment/gas-deployment.md](08-deployment/gas-deployment.md) | GAS翻訳APIのデプロイ手順 | Google Apps Script |
| [08-deployment/build-config.md](08-deployment/build-config.md) | Viteビルド設定詳細 | Vite, TypeScript |
| [08-deployment/chrome-extension.md](08-deployment/chrome-extension.md) | Chrome拡張インストール手順 | Chrome |

**重要**: GASデプロイには **セキュリティ警告** が含まれています（APIキー認証推奨）。

---

### 🎨 UI/スタイリングレイヤー

| ファイル | 内容 |
|---------|------|
| [09-ui-styling/design-system.md](09-ui-styling/design-system.md) | カラー、タイポグラフィ、コンポーネントスタイル |
| [09-ui-styling/responsive-design.md](09-ui-styling/responsive-design.md) | モバイルファースト設計、ブレークポイント |

**ターゲットデバイス**: iPhone 15 Pro Max（430x932 viewport）

---

## 🔗 ドキュメント間の関係

### データフロー

```
[00-overview] プロジェクト概要
      ↓
[01-architecture] システム構成
      ↓
[02-types] 型定義 ←→ [03-state-management] 状態管理
      ↓                       ↓
[04-data/keywords] ←→ [05-hooks/useTranslation]
                        [05-hooks/useHistory]
      ↓                       ↓
[06-components/PromptEditor, HistoryPanel, App]
      ↓
[07-services/translation, storage]
      ↓
[08-deployment/gas, build-config, chrome-extension]
      ↓
[09-ui-styling/design-system, responsive-design]
```

---

## 🎓 学習パス

### レベル1: 概要理解（30分）

1. [00-overview.md](00-overview.md) - 機能仕様
2. [01-architecture.md](01-architecture.md) - システム全体像
3. [09-ui-styling/responsive-design.md](09-ui-styling/responsive-design.md) - ターゲットデバイス

### レベル2: 技術詳細（2時間）

1. [02-types-design.md](02-types-design.md) - 型システム
2. [03-state-management.md](03-state-management.md) - 状態管理
3. [04-data/keywords-design.md](04-data/keywords-design.md) - データ構造
4. [05-hooks/useTranslation.md](05-hooks/useTranslation.md) - 翻訳ロジック

### レベル3: 実装（4時間）

1. [06-components/](06-components/) - 全コンポーネント
2. [07-services/](07-services/) - サービス層
3. [09-ui-styling/design-system.md](09-ui-styling/design-system.md) - スタイリング

### レベル4: デプロイ（1時間）

1. [08-deployment/build-config.md](08-deployment/build-config.md) - ビルド
2. [08-deployment/gas-deployment.md](08-deployment/gas-deployment.md) - API設定
3. [08-deployment/chrome-extension.md](08-deployment/chrome-extension.md) - 拡張機能インストール

---

## 📊 ドキュメント統計

| カテゴリ | ファイル数 | 総行数（概算） |
|---------|-----------|--------------|
| 基礎ドキュメント | 4 | ~2,000 |
| データ | 1 | ~500 |
| フック | 2 | ~1,200 |
| コンポーネント | 3 | ~2,500 |
| サービス | 2 | ~800 |
| デプロイメント | 3 | ~1,500 |
| UI/スタイリング | 2 | ~800 |
| **合計** | **17** | **~9,300** |

**元の設計図**: 5,919行 → **分散化**: 9,300行（詳細説明の追加により増加）

---

## 🔧 実装チェックリスト

### フェーズ1: 環境構築

- [ ] Node.js、npm インストール
- [ ] プロジェクト初期化（`npm install`）
- [ ] `.env` ファイル作成（[build-config.md](08-deployment/build-config.md)参照）
- [ ] TypeScript設定確認（[01-architecture.md](01-architecture.md)参照）

### フェーズ2: コア機能実装

- [ ] 型定義実装（[02-types-design.md](02-types-design.md)）
- [ ] PromptContext実装（[03-state-management.md](03-state-management.md)）
- [ ] キーワードデータ作成（[04-data/keywords-design.md](04-data/keywords-design.md)）
- [ ] ストレージサービス実装（[07-services/storage-service.md](07-services/storage-service.md)）

### フェーズ3: 翻訳機能実装

- [ ] GAS翻訳APIデプロイ（[08-deployment/gas-deployment.md](08-deployment/gas-deployment.md)）
- [ ] 翻訳サービス実装（[07-services/translation-service.md](07-services/translation-service.md)）
- [ ] useTranslationフック実装（[05-hooks/useTranslation.md](05-hooks/useTranslation.md)）

### フェーズ4: UI実装

- [ ] デザインシステム適用（[09-ui-styling/design-system.md](09-ui-styling/design-system.md)）
- [ ] PromptEditor実装（[06-components/PromptEditor.md](06-components/PromptEditor.md)）
- [ ] HistoryPanel実装（[06-components/HistoryPanel.md](06-components/HistoryPanel.md)）
- [ ] Appレイアウト実装（[06-components/App.md](06-components/App.md)）

### フェーズ5: デプロイ

- [ ] プロダクションビルド（[08-deployment/build-config.md](08-deployment/build-config.md)）
- [ ] Chrome拡張として読み込み（[08-deployment/chrome-extension.md](08-deployment/chrome-extension.md)）
- [ ] iPhone 15 Pro Maxでテスト（[09-ui-styling/responsive-design.md](09-ui-styling/responsive-design.md)）

---

## ⚠️ 重要な注意事項

### 🔴 セキュリティ

- **GAS翻訳API**: [APIキー認証の実装を強く推奨](08-deployment/gas-deployment.md#セキュリティ強化)
- **環境変数**: APIキー等は`.env`で管理、Gitにコミットしない
- **型安全性**: `any`型の使用は一切禁止

### 🟡 パフォーマンス

- **React Context**: [パフォーマンス最適化が必要](03-state-management.md#パフォーマンス最適化)
- **翻訳キャッシュ**: [LRUキャッシュ実装を推奨](07-services/translation-service.md#パフォーマンス最適化)
- **コード重複**: [useTranslationのリファクタリングを推奨](05-hooks/useTranslation.md#コード重複の分析と改善提案)

### 🟢 品質

- **アクセシビリティ**: 全コンポーネントでWAI-ARIA準拠
- **レスポンシブ**: モバイルファースト設計を徹底
- **型チェック**: `npm run type-check`を実装前に実行

---

## 🤝 貢献ガイド

### ドキュメント更新

1. 該当するドキュメントファイルを編集
2. 関連ドキュメントへのリンクを更新
3. このREADME.mdの統計情報を更新

### 新規ドキュメント追加

1. 適切なディレクトリに配置（`04-data/`, `05-hooks/`, etc.）
2. ドキュメント情報ヘッダーを含める
3. このREADME.mdに追加

---

## 📞 サポート

### ドキュメント内リンク切れ

各ドキュメントの「関連ドキュメント」セクションを確認してください。

### 実装サポート

1. 該当する設計ドキュメントを参照
2. コード例とベストプラクティスを確認
3. トラブルシューティングセクションを確認

---

## 🎉 次のステップ

1. **[プロジェクト概要](00-overview.md)** を読んで全体像を理解
2. **[アーキテクチャ設計](01-architecture.md)** で技術スタックを確認
3. **実装チェックリスト** に従って開発開始

---

**Happy Coding! 🚀**
