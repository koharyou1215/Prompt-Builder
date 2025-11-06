# アーキテクチャ設計

> **ドキュメント情報**
> 作成日: 2025-10-19
> カテゴリ: システム設計
> 関連: [プロジェクト概要](00-overview.md) | [型定義設計](02-types-design.md) | [ビルド設定](08-deployment/build-config.md)

---

## 🏗️ システムアーキテクチャ

このプロジェクトは、React + TypeScript + Viteで構築されるChrome拡張機能（Manifest V3）です。

### 技術スタック

| レイヤー | 技術 | バージョン | 用途 |
|---------|------|-----------|------|
| **UI Framework** | React | ^18.2.0 | UIコンポーネント構築 |
| **Type System** | TypeScript | ^5.3.3 | 型安全性の保証 |
| **Build Tool** | Vite | ^5.0.8 | 高速ビルド・HMR |
| **Extension Plugin** | @crxjs/vite-plugin | ^2.0.0-beta.21 | Chrome拡張ビルド |
| **Platform** | Chrome Extension | Manifest V3 | ブラウザ統合 |

---

## 📁 プロジェクト構造

```
prompt-builder-extension/
├── public/                      # 静的アセット
│   └── icons/                   # 拡張機能アイコン
│       ├── icon16.png           # ツールバーアイコン（16x16）
│       ├── icon48.png           # 拡張機能管理ページ（48x48）
│       └── icon128.png          # Chromeウェブストア（128x128）
│
├── src/                         # ソースコード
│   ├── assets/                  # アプリケーション内アセット
│   │
│   ├── components/              # Reactコンポーネント
│   │   ├── PromptEditor.tsx     # プロンプト編集エリア
│   │   ├── KeywordSelector.tsx  # キーワード選択UI
│   │   ├── HistoryPanel.tsx     # 履歴管理パネル
│   │   └── TranslationArea.tsx  # 翻訳表示エリア
│   │
│   ├── hooks/                   # カスタムフック
│   │   ├── useAutoSave.ts       # 自動保存ロジック
│   │   ├── useTranslation.ts    # 双方向翻訳ロジック
│   │   └── useHistory.ts        # 履歴管理ロジック
│   │
│   ├── services/                # ビジネスロジック層
│   │   ├── translationService.ts # 翻訳API通信
│   │   └── storageService.ts    # Chrome Storage操作
│   │
│   ├── data/                    # 静的データ
│   │   └── keywords.ts          # キーワードマスターデータ
│   │
│   ├── contexts/                # React Context
│   │   └── PromptContext.tsx    # プロンプト状態管理
│   │
│   ├── types.ts                 # 型定義ファイル
│   ├── App.tsx                  # ルートコンポーネント
│   ├── main.tsx                 # エントリポイント（開発用）
│   └── sidepanel.tsx            # サイドパネルエントリ
│
├── manifest.json                # Chrome拡張設定
├── package.json                 # 依存関係管理
├── tsconfig.json                # TypeScript設定
├── vite.config.ts               # Viteビルド設定
└── README.md                    # プロジェクト説明
```

---

## 📦 依存関係（package.json）

### プロダクション依存関係

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}
```

### 開発依存関係

```json
{
  "devDependencies": {
    "@crxjs/vite-plugin": "^2.0.0-beta.21",
    "@types/chrome": "^0.0.254",
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.3.3",
    "vite": "^5.0.8"
  }
}
```

### NPMスクリプト

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "type-check": "tsc --noEmit"
  }
}
```

---

## ⚙️ Vite設定（vite.config.ts）

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { crx } from '@crxjs/vite-plugin';
import manifest from './manifest.json';

export default defineConfig({
  plugins: [
    react(),
    crx({ manifest })
  ],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        sidepanel: 'sidepanel.html'
      }
    }
  }
});
```

### 設定のポイント

- **`@vitejs/plugin-react`**: React Fast Refresh有効化
- **`@crxjs/vite-plugin`**: Chrome拡張のビルド自動化
  - manifest.jsonの自動読み込み
  - HMR（Hot Module Replacement）対応
- **`rollupOptions.input`**: サイドパネル用のHTMLをエントリポイントに指定

---

## 🔧 TypeScript設定（tsconfig.json）

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    // モジュール解決
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,

    // 出力設定
    "noEmit": true,
    "jsx": "react-jsx",

    // 型チェック厳格性
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,

    // Chrome API型定義
    "types": ["chrome"]
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### 厳格な型チェック設定

> **🔴 重要**: `any`型の使用を完全に禁止するため、以下の設定を有効化

- **`strict: true`**: すべての厳格チェックを有効化
- **`noImplicitAny: true`**: 暗黙的なany型を禁止
- **`strictNullChecks: true`**: null/undefined の厳密チェック
- **`noUncheckedIndexedAccess: true`**: 配列・オブジェクトアクセスの安全性向上

---

## 🧩 Chrome拡張設定（manifest.json）

```json
{
  "manifest_version": 3,
  "name": "インタラクティブAIプロンプト・ビルダー",
  "version": "1.0.0",
  "description": "AI画像生成のプロンプトを日本語と英語の双方向翻訳で構築・管理",

  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  },

  "permissions": [
    "storage",
    "sidePanel"
  ],

  "side_panel": {
    "default_path": "sidepanel.html"
  },

  "action": {
    "default_title": "プロンプトビルダーを開く"
  },

  "background": {
    "service_worker": "src/background.ts",
    "type": "module"
  }
}
```

### Manifest V3の特徴

| 項目 | 設定 | 説明 |
|------|------|------|
| **permissions** | `storage` | Chrome Storage APIの使用許可 |
|  | `sidePanel` | サイドパネル機能の使用許可 |
| **side_panel** | `default_path` | サイドパネルのHTML |
| **background** | `service_worker` | バックグラウンド処理（Service Worker） |
| **action** | `default_title` | 拡張機能アイコンのツールチップ |

---

## 🔄 データフロー

```
┌─────────────────────────────────────────────────┐
│            User Interface (React)               │
│  ┌──────────────┐  ┌──────────────┐            │
│  │PromptEditor  │  │KeywordSelector│            │
│  └──────┬───────┘  └──────┬────────┘            │
│         │                 │                      │
│         └────────┬────────┘                      │
│                  ▼                               │
│         ┌────────────────┐                       │
│         │PromptContext   │ ◄── React Context    │
│         └────────┬───────┘                       │
│                  │                               │
│         ┌────────┴────────┐                      │
│         ▼                 ▼                      │
│  ┌──────────────┐  ┌──────────────┐             │
│  │useTranslation│  │ useHistory   │             │
│  └──────┬───────┘  └──────┬───────┘             │
└─────────┼──────────────────┼───────────────────  ┘
          │                  │
          ▼                  ▼
  ┌───────────────┐  ┌───────────────┐
  │Translation    │  │Storage        │
  │Service        │  │Service        │
  └───────┬───────┘  └───────┬───────┘
          │                  │
          ▼                  ▼
  ┌───────────────┐  ┌───────────────┐
  │Google Apps    │  │Chrome Storage │
  │Script API     │  │API            │
  └───────────────┘  └───────────────┘
```

### レイヤー分離の利点

1. **UI Layer**: Reactコンポーネント（表示のみ）
2. **State Layer**: React Context（状態管理）
3. **Logic Layer**: Custom Hooks（ビジネスロジック）
4. **Service Layer**: Services（外部API通信）
5. **Platform Layer**: Chrome API（プラットフォーム依存）

---

## 🚀 ビルドフロー

### 開発モード

```bash
npm run dev
```

1. Vite開発サーバー起動
2. HMR（Hot Module Replacement）有効化
3. TypeScriptリアルタイム型チェック
4. Chrome拡張の`chrome-extension://`プロトコル対応

### プロダクションビルド

```bash
npm run build
```

1. **TypeScript型チェック**: `tsc --noEmit`
2. **Viteビルド**: 最適化・バンドル
3. **出力**: `dist/`ディレクトリ
4. **Chrome拡張パッケージング**: manifest.json + 必要ファイル

### 出力ディレクトリ構造

```
dist/
├── sidepanel.html
├── assets/
│   ├── sidepanel-[hash].js
│   └── sidepanel-[hash].css
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── manifest.json
```

---

## 🔐 セキュリティ考慮事項

### Content Security Policy（CSP）

Chrome Manifest V3では、インラインスクリプトが禁止されています。

**対応策**:
- すべてのJavaScriptを外部ファイル化
- `unsafe-inline`や`unsafe-eval`を使用しない
- Viteが自動的にCSP準拠のビルドを生成

### ストレージセキュリティ

- Chrome Storage APIは暗号化されたストレージを使用
- 機密情報（APIキー等）は環境変数で管理（`.env`ファイル）
- ユーザーデータはローカルに保存（外部送信なし）

---

## 📚 関連ドキュメント

| ドキュメント | 説明 |
|-------------|------|
| [型定義設計](02-types-design.md) | TypeScript型定義の詳細 |
| [状態管理設計](03-state-management.md) | React Context設計 |
| [ビルド設定](08-deployment/build-config.md) | 詳細なビルド設定 |
| [Chrome拡張インストール](08-deployment/chrome-extension.md) | 拡張機能のインストール手順 |

---

## 🔄 次のステップ

1. [型定義設計](02-types-design.md) で型安全性を理解
2. [状態管理設計](03-state-management.md) でReact Contextの実装を確認
3. 各コンポーネントの設計ドキュメントで実装詳細を把握
