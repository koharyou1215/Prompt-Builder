# ビルド設定詳細

> **ドキュメント情報**
> 作成日: 2025-10-19
> カテゴリ: デプロイメント
> 関連: [アーキテクチャ](../01-architecture.md) | [Chrome拡張インストール](chrome-extension.md)

---

## 📖 概要

このドキュメントでは、Viteビルド設定、環境変数管理、最適化オプションの詳細を説明します。

---

## ⚙️ Vite設定ファイル

### `vite.config.ts`

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { crx } from '@crxjs/vite-plugin';
import manifest from './manifest.json';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    crx({ manifest })
  ],

  build: {
    outDir: 'dist',
    sourcemap: process.env.NODE_ENV === 'development',
    minify: 'terser',

    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: true
      }
    },

    rollupOptions: {
      input: {
        sidepanel: resolve(__dirname, 'sidepanel.html')
      },

      output: {
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },

    // Chrome拡張の最大サイズ制限に注意
    chunkSizeWarningLimit: 1000
  },

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@hooks': resolve(__dirname, 'src/hooks'),
      '@services': resolve(__dirname, 'src/services'),
      '@types': resolve(__dirname, 'src/types')
    }
  },

  server: {
    port: 3000,
    strictPort: true,
    hmr: {
      port: 3000
    }
  }
});
```

---

## 🔐 環境変数管理

### `.env`ファイル

```env
# 翻訳API設定
VITE_TRANSLATION_API_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec

# オプション: APIキー（セキュリティ強化時）
VITE_TRANSLATION_API_KEY=your_secret_api_key_here

# 開発環境設定
VITE_APP_ENV=development
VITE_DEBUG_MODE=true
```

### `.env.production`（プロダクション用）

```env
# 翻訳API設定
VITE_TRANSLATION_API_URL=https://script.google.com/macros/s/YOUR_PRODUCTION_DEPLOYMENT_ID/exec
VITE_TRANSLATION_API_KEY=your_production_api_key

# プロダクション設定
VITE_APP_ENV=production
VITE_DEBUG_MODE=false
```

### `.env.example`（テンプレート）

```env
# 翻訳API設定
# GAS翻訳APIのデプロイURLを設定してください
VITE_TRANSLATION_API_URL=

# オプション: APIキー
# セキュリティ強化時にGAS側で発行したAPIキーを設定
VITE_TRANSLATION_API_KEY=

# 環境設定
VITE_APP_ENV=development
VITE_DEBUG_MODE=true
```

### TypeScriptでの環境変数型定義

```typescript
// src/vite-env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TRANSLATION_API_URL: string;
  readonly VITE_TRANSLATION_API_KEY?: string;
  readonly VITE_APP_ENV: 'development' | 'production';
  readonly VITE_DEBUG_MODE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

---

## 📦 package.jsonスクリプト

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "build:prod": "tsc && vite build --mode production",
    "preview": "vite preview",
    "type-check": "tsc --noEmit",
    "lint": "eslint src --ext ts,tsx",
    "lint:fix": "eslint src --ext ts,tsx --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,css}\"",
    "clean": "rm -rf dist node_modules/.vite"
  }
}
```

---

## 🎨 PostCSS設定（オプション）

### `postcss.config.js`

```javascript
export default {
  plugins: {
    autoprefixer: {},
    cssnano: {
      preset: 'default'
    }
  }
};
```

---

## 📊 ビルド最適化

### コード分割

```typescript
// 動的インポートでコード分割
const HistoryPanel = lazy(() => import('./components/HistoryPanel'));

<Suspense fallback={<Loading />}>
  <HistoryPanel />
</Suspense>
```

### Tree Shaking

Viteは自動的にTree Shakingを実行しますが、より効果的にするため：

```typescript
// ❌ 悪い例
import _ from 'lodash';

// ✅ 良い例
import debounce from 'lodash/debounce';
```

### バンドルサイズの確認

```bash
npm run build

# ビルド後にdist/フォルダのサイズを確認
du -sh dist/
```

---

## 🔍 開発ツール

### TypeScript型チェック

```bash
# エラーのみ表示
npm run type-check

# watchモード
tsc --noEmit --watch
```

### ESLint設定

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-module-boundary-types": "warn",
    "react/react-in-jsx-scope": "off"
  }
}
```

---

## 🚀 ビルドフロー

### 開発ビルド

```bash
# 1. 依存関係インストール
npm install

# 2. 開発サーバー起動
npm run dev

# 3. Chromeで http://localhost:3000 を開く
# または拡張機能として dist/ を読み込み
```

### プロダクションビルド

```bash
# 1. 型チェック
npm run type-check

# 2. ビルド
npm run build:prod

# 3. dist/フォルダを確認
ls -la dist/

# 4. Chrome拡張としてロード
# chrome://extensions で dist/ フォルダを選択
```

---

## 📁 ビルド出力

### ディレクトリ構造

```
dist/
├── sidepanel.html           # サイドパネルHTML
├── assets/
│   ├── sidepanel-abc123.js  # メインJSバンドル
│   ├── sidepanel-def456.css # スタイルシート
│   └── vendor-ghi789.js     # ベンダーバンドル
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── manifest.json            # Chrome拡張マニフェスト
```

### ファイルサイズの目安

| ファイル | 推奨サイズ | 説明 |
|---------|-----------|------|
| `sidepanel-*.js` | < 500KB | メインバンドル |
| `vendor-*.js` | < 300KB | React等のライブラリ |
| `sidepanel-*.css` | < 50KB | スタイルシート |
| **合計** | **< 1MB** | Chrome拡張の推奨サイズ |

---

## 🔧 トラブルシューティング

### ビルドエラー

**エラー**: `Cannot find module '@/components/...'`

**解決策**: `tsconfig.json`と`vite.config.ts`のパスエイリアスを確認

```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### 環境変数が読み込まれない

**解決策**:
1. `.env`ファイルがプロジェクトルートにあることを確認
2. 環境変数名が`VITE_`で始まることを確認
3. 開発サーバーを再起動

---

## 📚 関連ドキュメント

- [Vite公式ドキュメント](https://vitejs.dev/)
- [Chrome拡張インストール](chrome-extension.md)
- [アーキテクチャ設計](../01-architecture.md)
- [@crxjs/vite-plugin](https://crxjs.dev/vite-plugin/)

---

## 🔄 次のステップ

1. `.env.example`を`.env`にコピーして環境変数を設定
2. `npm run dev`で開発サーバーを起動
3. `npm run build`でプロダクションビルドを実行
4. [Chrome拡張インストール](chrome-extension.md)でChromeに読み込み
