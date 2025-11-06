# Chrome拡張機能デプロイメントガイド

## ドキュメント情報

| 項目 | 内容 |
|------|------|
| **作成日** | 2025-10-19 |
| **対象者** | 開発者、エンドユーザー |
| **前提知識** | Chrome拡張機能の基本的な理解 |
| **関連ドキュメント** | [プロジェクト概要](../01-overview/project-summary.md)、[アーキテクチャ設計](../02-architecture/system-architecture.md) |

---

## 概要

このドキュメントでは、インタラクティブAIプロンプト・ビルダーをChrome拡張機能（サイドパネル形式）としてデプロイする方法を説明します。

### サイドパネルとは

Chrome拡張機能のサイドパネルは、ブラウザの右側に表示される専用のパネルです。通常のポップアップと異なり、常に表示され続けるため、作業中に頻繁にアクセスする必要があるツールに最適です。

**サイドパネルの利点**
- ブラウザの横に常駐し、閉じられることなく利用可能
- 十分な表示スペースで複雑なUIを提供できる
- 他のタブを開いたままツールにアクセス可能

---

## Chrome拡張機能のインストール手順

### 前提条件

インストールを開始する前に、以下の準備が整っていることを確認してください。

**必要な環境**
- Google Chrome（バージョン 114以降推奨）
- Node.js（バージョン 18以上）
- npm（Node.jsに同梱）

**必要なファイル**
- プロジェクトのソースコード一式
- ビルド済みの拡張機能（`dist`フォルダ）

### ステップ1: プロジェクトのビルド

拡張機能を使用する前に、プロジェクトをビルドして本番環境用のファイルを生成する必要があります。

#### 1.1 依存パッケージのインストール

プロジェクトのルートディレクトリで以下のコマンドを実行します。

```bash
npm install
```

このコマンドにより、`package.json`に記載されているすべての依存パッケージがインストールされます。

#### 1.2 本番用ビルドの実行

次に、本番環境用にアプリケーションをビルドします。

```bash
npm run build
```

**ビルド処理の内容**
1. TypeScriptファイルを型チェック
2. Reactコンポーネントをバンドル
3. コードの最小化（minify）
4. `dist`フォルダに出力ファイルを生成

**成功時の出力例**
```
vite v5.0.8 building for production...
✓ 127 modules transformed.
dist/sidepanel.html                 2.31 kB
dist/assets/react-vendor-a1b2c3d4.js  145.23 kB
dist/assets/sidepanel-e5f6g7h8.js     89.45 kB
✓ built in 3.42s
```

ビルドが完了すると、プロジェクトのルートに`dist`フォルダが作成されます。

### ステップ2: Chrome拡張機能の読み込み

ビルドした拡張機能をChromeに読み込みます。

#### 2.1 拡張機能管理画面を開く

1. Google Chromeを起動
2. アドレスバーに`chrome://extensions/`と入力してEnterキーを押す
3. 拡張機能管理画面が表示されます

**ショートカット方法**
- メニューアイコン（右上の3点）→「その他のツール」→「拡張機能」

#### 2.2 デベロッパーモードを有効化

拡張機能管理画面の右上にある「デベロッパーモード」トグルをONにします。

![デベロッパーモード切り替え](画像はイメージです)

**重要**: デベロッパーモードを有効にしないと、パッケージ化されていない拡張機能を読み込むことができません。

#### 2.3 拡張機能を読み込む

1. 「パッケージ化されていない拡張機能を読み込む」ボタンをクリック
2. ファイル選択ダイアログが表示される
3. プロジェクトの`dist`フォルダを選択
4. 「フォルダーの選択」をクリック

**正常に読み込まれた場合**
- 拡張機能のカードが表示される
- アイコン、名前「Prompt Builder」、説明が表示される
- エラーメッセージが表示されない

**エラーが表示された場合**
- 「エラー」をクリックして詳細を確認
- [トラブルシューティング](#トラブルシューティング)セクションを参照

### ステップ3: サイドパネルの起動

拡張機能が読み込まれたら、サイドパネルを開きます。

#### 3.1 拡張機能アイコンをクリック

1. Chromeツールバー（アドレスバーの右側）に表示される拡張機能アイコンをクリック
2. 「Prompt Builder」のアイコンを探す
3. アイコンをクリック

**アイコンが見つからない場合**
- ツールバーの拡張機能メニュー（パズルピースアイコン）をクリック
- リストから「Prompt Builder」を探す
- ピン留めアイコンをクリックしてツールバーに固定

#### 3.2 サイドパネルの表示確認

アイコンをクリックすると、ブラウザの右側にサイドパネルが表示されます。

**初回起動時の動作**
1. ローディング画面が数秒間表示される
2. アプリケーションが正常に読み込まれる
3. プロンプトビルダーのメインUIが表示される

**正常動作の確認ポイント**
- サイドパネルが右側に表示される
- UIが正しくレンダリングされている
- インタラクションが機能する（ボタンのクリック、入力など）

---

## サイドパネルの仕組み

### アーキテクチャ概要

Chrome拡張機能のサイドパネルは、以下のコンポーネントで構成されています。

```
┌─────────────────────────────────────┐
│        Chrome Browser               │
│  ┌───────────────────────────────┐  │
│  │     Side Panel Window         │  │
│  │  ┌─────────────────────────┐  │  │
│  │  │   sidepanel.html        │  │  │
│  │  │  ┌───────────────────┐  │  │  │
│  │  │  │  React App        │  │  │  │
│  │  │  │  (sidepanel.tsx)  │  │  │  │
│  │  │  └───────────────────┘  │  │  │
│  │  └─────────────────────────┘  │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

### ファイル構成

**エントリーポイント**: `sidepanel.html`

このHTMLファイルがサイドパネルのベースとなります。

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>プロンプトビルダー</title>
</head>
<body>
  <div id="root">
    <!-- 初期ローディング表示 -->
    <div class="loading-screen">
      <div class="loading-spinner"></div>
      <p class="loading-text">読み込み中...</p>
    </div>
  </div>

  <!-- Reactアプリのエントリーポイント -->
  <script type="module" src="/src/sidepanel.tsx"></script>
</body>
</html>
```

**主な特徴**
- シンプルなHTML構造
- ルート要素`#root`にReactアプリをマウント
- 初期ローディング画面を表示
- グローバルエラーハンドラを実装

**React初期化**: `src/sidepanel.tsx`

Reactアプリケーションを初期化するエントリーポイントです。

```typescript
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

function initializeApp(): void {
  const rootElement = document.getElementById('root');

  if (!rootElement) {
    console.error('Root element not found');
    return;
  }

  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

// DOM読み込み完了後に初期化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
```

**処理フロー**
1. DOM読み込み完了を待機
2. `#root`要素を取得
3. React 18の`createRoot`でルートを作成
4. `App`コンポーネントをレンダリング

**マニフェスト設定**: `manifest.json`

Chrome拡張機能の設定ファイルです。

```json
{
  "manifest_version": 3,
  "name": "Prompt Builder",
  "version": "1.0.0",
  "description": "画像生成AIのためのプロンプト作成ツール",
  "side_panel": {
    "default_path": "sidepanel.html"
  },
  "permissions": [
    "sidePanel",
    "storage"
  ],
  "action": {
    "default_title": "プロンプトビルダーを開く"
  }
}
```

**重要な設定**
- `manifest_version: 3`: Manifest V3を使用（最新仕様）
- `side_panel.default_path`: サイドパネルのHTMLファイルパス
- `permissions`: 必要な権限（サイドパネル、ストレージ）
- `action`: ツールバーアイコンの設定

### データフロー

```
[User Interaction]
        ↓
[React Components]
        ↓
[State Management (Context API)]
        ↓
[Chrome Storage API]
        ↓
[Persistent Storage]
```

**状態管理**
- Reactの`Context API`を使用
- `chrome.storage.local`にデータを永続化
- サイドパネルを閉じてもデータが保持される

---

## 開発モードとプロダクションモード

### 開発モード

開発中は、リアルタイムで変更を確認できる開発モードを使用します。

#### 開発サーバーの起動

```bash
npm run dev
```

**開発モードの特徴**
- ホットモジュールリプレースメント（HMR）対応
- ファイル変更時に自動リロード
- ソースマップ生成（デバッグが容易）
- TypeScript型エラーをリアルタイム表示

**開発サーバーの確認**

起動成功時の出力例:
```
VITE v5.0.8  ready in 432 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
➜  press h to show help
```

ブラウザで`http://localhost:5173/`を開いて動作確認できます。

#### 拡張機能での開発モード使用

開発モードでビルドした拡張機能をChromeに読み込む場合:

1. 開発サーバーを起動したまま維持
2. Chrome拡張機能管理画面で「更新」ボタンをクリック
3. コード変更後、拡張機能を再読み込み

**注意事項**
- 開発モードのビルドは最適化されていないため、パフォーマンスが低下する可能性があります
- エンドユーザーに配布する場合は必ずプロダクションビルドを使用してください

### プロダクションモード

本番環境用に最適化されたビルドを生成します。

#### プロダクションビルドの実行

```bash
npm run build
```

**最適化内容**
- コードの最小化（minify）
- 不要なコメント・空白の削除
- Dead Code Elimination（使用されていないコードの削除）
- チャンク分割（効率的なロード）
- ソースマップの除外（オプション）

#### ビルド結果の確認

プロダクションビルド後、`dist`フォルダの内容を確認します。

```
dist/
├── sidepanel.html           # サイドパネルHTML
├── manifest.json            # マニフェストファイル
├── assets/
│   ├── react-vendor-[hash].js    # Reactライブラリ
│   ├── sidepanel-[hash].js       # アプリケーションコード
│   └── sidepanel-[hash].css      # スタイルシート
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

**ファイルサイズの目安**
- `react-vendor-[hash].js`: 約145KB（Reactライブラリ）
- `sidepanel-[hash].js`: 約90KB（アプリケーションコード）
- 合計: 約235KB（gzip圧縮前）

### モード切り替えのベストプラクティス

| シチュエーション | 使用モード | 理由 |
|---------------|----------|------|
| 新機能開発 | 開発モード | HMRで即座に変更確認 |
| バグ修正 | 開発モード | ソースマップでデバッグが容易 |
| パフォーマンステスト | プロダクションモード | 本番環境と同じ最適化状態で評価 |
| リリース前確認 | プロダクションモード | 本番環境と同じ動作確認 |
| ユーザー配布 | プロダクションモード | 最適化済み、ファイルサイズ削減 |

---

## トラブルシューティング

### よくあるエラーと解決方法

#### エラー1: 拡張機能の読み込み失敗

**症状**
```
マニフェストファイルが見つかりません
または
無効なマニフェスト
```

**原因**
- `dist`フォルダが正しくビルドされていない
- `manifest.json`が存在しない、または不正な形式

**解決方法**

1. ビルドを再実行
```bash
npm run build
```

2. `dist`フォルダに`manifest.json`が存在することを確認

3. `manifest.json`の内容を検証（JSON形式が正しいか）

#### エラー2: サイドパネルが表示されない

**症状**
- 拡張機能アイコンをクリックしても何も起こらない
- サイドパネルが開かない

**原因**
- `sidepanel.html`のパスが正しくない
- 権限が不足している

**解決方法**

1. `manifest.json`の`side_panel.default_path`を確認
```json
{
  "side_panel": {
    "default_path": "sidepanel.html"
  }
}
```

2. 権限に`sidePanel`が含まれているか確認
```json
{
  "permissions": [
    "sidePanel"
  ]
}
```

3. 拡張機能を再読み込み
   - `chrome://extensions/`で「更新」ボタンをクリック

#### エラー3: JavaScriptエラー

**症状**
- サイドパネルが開くが、コンソールにエラーが表示される
- 一部の機能が動作しない

**原因**
- TypeScriptのビルドエラー
- 依存パッケージの不整合
- ランタイムエラー

**解決方法**

1. TypeScript型チェックを実行
```bash
npm run type-check
```

2. エラーメッセージを確認し、該当箇所を修正

3. 依存パッケージを再インストール
```bash
rm -rf node_modules package-lock.json
npm install
```

4. 再ビルド
```bash
npm run build
```

#### エラー4: ローディング画面から進まない

**症状**
- サイドパネルが開く
- ローディング画面（スピナー）が表示されたまま
- アプリケーションが起動しない

**原因**
- `sidepanel.tsx`の初期化エラー
- `App`コンポーネントのレンダリングエラー
- 依存ライブラリの読み込み失敗

**解決方法**

1. ブラウザのデベロッパーツールを開く
   - サイドパネル内で右クリック → 「検証」

2. コンソールタブでエラーメッセージを確認

3. エラーメッセージに応じて該当コードを修正

4. 拡張機能を再読み込み

#### エラー5: ビルド失敗

**症状**
```
Error: Build failed with errors
または
TypeScript compilation errors
```

**原因**
- TypeScript型エラー
- 依存パッケージの欠落
- ビルド設定の問題

**解決方法**

1. エラーメッセージの詳細を確認
```bash
npm run build 2>&1 | tee build-error.log
```

2. TypeScript型エラーの修正
   - エラーメッセージに表示されたファイル・行番号を確認
   - 型定義を修正

3. 依存パッケージの確認
```bash
npm list
```

4. 不足している依存パッケージをインストール
```bash
npm install <missing-package>
```

### デバッグ方法

#### ブラウザデベロッパーツールの使用

1. サイドパネルを開く
2. サイドパネル内で右クリック
3. 「検証」を選択
4. デベロッパーツールが開く

**利用できる機能**
- **Console**: ログメッセージ、エラー確認
- **Elements**: DOM構造の確認
- **Network**: リソース読み込みの確認
- **Application**: ストレージ（chrome.storage）の確認
- **Sources**: ソースコードのデバッグ、ブレークポイント設定

#### ログ出力の活用

開発中は積極的に`console.log`を使用してデバッグします。

```typescript
// 状態の確認
console.log('Current state:', state);

// 関数の実行確認
console.log('Function called:', functionName);

// エラーのキャッチ
try {
  // 処理
} catch (error) {
  console.error('Error occurred:', error);
}
```

#### React Developer Toolsの使用

React Developer Tools拡張機能をインストールすると、Reactコンポーネントの状態を詳細に確認できます。

**インストール方法**
1. Chrome Web Storeで「React Developer Tools」を検索
2. 拡張機能をインストール
3. サイドパネルのデベロッパーツールに「Components」「Profiler」タブが追加される

**使用方法**
- **Components**: コンポーネントツリー、Props、Stateの確認
- **Profiler**: レンダリングパフォーマンスの測定

---

## 関連ドキュメント

| ドキュメント | 説明 | パス |
|------------|------|------|
| **プロジェクト概要** | プロジェクト全体の概要と目的 | `docs/01-overview/project-summary.md` |
| **システムアーキテクチャ** | アーキテクチャ設計と技術スタック | `docs/02-architecture/system-architecture.md` |
| **開発環境セットアップ** | 開発環境の構築手順 | `docs/03-setup/development-environment.md` |
| **コンポーネント設計** | Reactコンポーネントの設計指針 | `docs/04-components/component-design.md` |
| **ビルド設定** | Viteビルド設定の詳細 | `docs/08-deployment/build-configuration.md` |

---

## 付録

### A. Vite設定の詳細

`vite.config.ts`は、ビルドプロセスを制御する重要な設定ファイルです。

**主要設定項目**

```typescript
export default defineConfig({
  plugins: [
    react(),           // React Fast Refresh対応
    crx({ manifest }), // Chrome拡張機能プラグイン
  ],

  build: {
    outDir: 'dist',                    // 出力ディレクトリ
    sourcemap: process.env.NODE_ENV === 'development', // ソースマップ
    minify: process.env.NODE_ENV === 'production',     // 最小化
    rollupOptions: {
      input: {
        sidepanel: 'sidepanel.html',  // エントリーポイント
      },
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'], // チャンク分割
        },
      },
    },
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),            // パスエイリアス
      '@components': path.resolve(__dirname, './src/components'),
    },
  },
});
```

### B. package.jsonスクリプト

利用可能なnpmスクリプトの一覧です。

```json
{
  "scripts": {
    "dev": "vite",                    // 開発サーバー起動
    "build": "tsc && vite build",     // プロダクションビルド
    "preview": "vite preview",        // ビルド結果のプレビュー
    "lint": "eslint . --ext ts,tsx",  // ESLint実行
    "type-check": "tsc --noEmit"      // TypeScript型チェック
  }
}
```

**各スクリプトの用途**
- `npm run dev`: 開発時に使用
- `npm run build`: リリース前に実行
- `npm run preview`: ビルド結果をローカルで確認
- `npm run lint`: コード品質チェック
- `npm run type-check`: TypeScript型エラーのチェック

### C. 必要な権限

Chrome拡張機能で使用する権限の説明です。

| 権限 | 用途 | 必須/オプション |
|------|------|--------------|
| `sidePanel` | サイドパネル機能の使用 | 必須 |
| `storage` | データの永続化（chrome.storage） | 必須 |
| `tabs` | タブ情報の取得（将来の機能拡張用） | オプション |

**権限の追加方法**

`manifest.json`の`permissions`配列に追加します。

```json
{
  "permissions": [
    "sidePanel",
    "storage"
  ]
}
```

---

## まとめ

このドキュメントでは、インタラクティブAIプロンプト・ビルダーをChrome拡張機能としてデプロイする方法を説明しました。

**重要なポイント**
1. **ビルド**: `npm run build`でプロダクションビルドを生成
2. **読み込み**: `chrome://extensions/`から`dist`フォルダを読み込み
3. **起動**: ツールバーのアイコンをクリックしてサイドパネルを開く
4. **デバッグ**: ブラウザデベロッパーツールを活用
5. **開発/本番**: 用途に応じてモードを切り替え

問題が発生した場合は、[トラブルシューティング](#トラブルシューティング)セクションを参照してください。

---

**次のステップ**
- [ユーザーガイド](../09-user-guide/getting-started.md): エンドユーザー向けの使い方
- [API連携設定](../05-api/api-integration.md): Gemini APIの設定方法
- [カスタマイズガイド](../10-customization/ui-customization.md): UIのカスタマイズ方法
