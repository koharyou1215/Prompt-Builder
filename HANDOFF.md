# 🔄 プロジェクト引き継ぎドキュメント

> **作成日**: 2025-10-19
> **プロジェクト**: インタラクティブAIプロンプト・ビルダー
> **進捗**: Phase 2完了 → Phase 3開始（オプションA: 段階的実装）

---

## 📊 現在の完了状況

### ✅ Phase 1: Core Infrastructure（完了）
- プロジェクト構造セットアップ
- 型定義システム（`src/types.ts`） - 完全型安全、any型禁止
- **Gemini API翻訳サービス**（`src/services/translationService.ts`）
  - 参考スクリプト（AutoHotkey）のパターンを移植
  - 承認済みモデルID使用（`gemini-2.5-pro`）
  - リトライロジック、タイムアウト処理実装済み
- **Chrome Storage API サービス**（`src/services/storageService.ts`）
  - 自動保存、履歴管理機能
- バックグラウンドサービスワーカー（`src/background.ts`）
- HTML/Reactエントリポイント

### ✅ Phase 2: State Management（完了）
- **PromptContext**（`src/contexts/PromptContext.tsx`）
  - 自動保存機能統合
  - グローバル状態管理
- **useTranslation**（`src/hooks/useTranslation.ts`）
  - 英語⇔日本語の双方向翻訳
  - デバウンス処理、キャンセル処理実装
  - Gemini API統合済み
- **useHistory**（`src/hooks/useHistory.ts`）
  - 履歴保存・復元・削除機能

### ⏳ Phase 3: UI Components（次のステップ）
**実装方針**: オプションA - 段階的実装

### ⏳ Phase 4: Data & Configuration（保留中）

---

## 🎯 次のセッションで実装すべきタスク

### Step 1: キーワードデータ作成（Phase 4の一部先行実装）

**ファイル**: `src/data/keywords.ts`

**実装内容**:
```typescript
// AI画像生成用のキーワードマスターデータ
// カテゴリ: 品質、キャラクター、画風、構図、服装、外見

export const keywordCategories: ReadonlyArray<KeywordCategory> = [
  {
    categoryName: '品質',
    keywords: [
      { ja: '傑作', en: 'masterpiece' },
      { ja: '最高品質', en: 'best quality' },
      { ja: '高解像度', en: 'absurdres' },
      // ... 他のキーワード
    ]
  },
  // ... 他のカテゴリ
];
```

**参考**:
- `docs/04-data/keywords-design.md` に仕様あり
- 日本語表示（ja）と英語プロンプト（en）のペア
- 最低でも各カテゴリ10個以上のキーワード推奨

---

### Step 2: 最小限のUIコンポーネント実装

#### 2-1. PromptEditor.tsx（基本版）

**ファイル**: `src/components/PromptEditor.tsx`

**実装内容**:
- ポジティブプロンプトのテキストエリア（英語）
- ネガティブプロンプトのテキストエリア（英語）
- PromptContextと連携

**要件**:
```typescript
import { usePromptContext } from '../contexts/PromptContext';

const PromptEditor: React.FC = () => {
  const { promptState, setPositivePrompt, setNegativePrompt } = usePromptContext();

  return (
    <div>
      <textarea value={promptState.positive} onChange={...} />
      <textarea value={promptState.negative} onChange={...} />
    </div>
  );
};
```

---

#### 2-2. TranslationArea.tsx（基本版）

**ファイル**: `src/components/TranslationArea.tsx`

**実装内容**:
- ポジティブプロンプトの日本語翻訳表示＆編集
- ネガティブプロンプトの日本語翻訳表示＆編集
- useTranslation / useNegativeTranslation と連携

**要件**:
```typescript
import { useTranslation, useNegativeTranslation } from '../hooks/useTranslation';

const TranslationArea: React.FC = () => {
  const {
    translatedText: posTranslated,
    handleJapaneseChange: handlePosChange,
    isTranslating: posTranslating
  } = useTranslation();

  const {
    translatedText: negTranslated,
    handleJapaneseChange: handleNegChange,
    isTranslating: negTranslating
  } = useNegativeTranslation();

  return (
    <div>
      <textarea value={posTranslated} onChange={(e) => handlePosChange(e.target.value)} />
      <textarea value={negTranslated} onChange={(e) => handleNegChange(e.target.value)} />
    </div>
  );
};
```

---

#### 2-3. KeywordSelector.tsx（基本版）

**ファイル**: `src/components/KeywordSelector.tsx`

**実装内容**:
- キーワードカテゴリの表示
- キーワードボタン（日本語表示）
- クリックで英語キーワードを追加
- PromptContextの`appendKeyword`使用

**要件**:
```typescript
import { usePromptContext } from '../contexts/PromptContext';
import { keywordCategories } from '../data/keywords';

const KeywordSelector: React.FC = () => {
  const { appendKeyword } = usePromptContext();

  return (
    <div>
      {keywordCategories.map(category => (
        <div key={category.categoryName}>
          <h3>{category.categoryName}</h3>
          {category.keywords.map(keyword => (
            <button
              key={keyword.en}
              onClick={() => appendKeyword('positive', keyword.en)}
            >
              {keyword.ja}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
};
```

---

### Step 3: App.tsx更新（基本UI統合）

**ファイル**: `src/App.tsx`

**実装内容**:
- PromptProviderでラップ
- 作成したコンポーネントを配置
- 基本レイアウト

```typescript
import { PromptProvider } from './contexts/PromptContext';
import PromptEditor from './components/PromptEditor';
import TranslationArea from './components/TranslationArea';
import KeywordSelector from './components/KeywordSelector';

const App: React.FC = () => {
  return (
    <PromptProvider>
      <div className="app-container">
        <h1>インタラクティブAIプロンプト・ビルダー</h1>
        <PromptEditor />
        <TranslationArea />
        <KeywordSelector />
      </div>
    </PromptProvider>
  );
};
```

---

## 🏗️ プロジェクト構造

```
インタラクティブAIプロンプト・ビルダー/
├── package.json                   # 依存関係
├── tsconfig.json                  # TypeScript設定（strict mode）
├── vite.config.ts                 # Viteビルド設定
├── manifest.json                  # Chrome拡張設定
├── .env                           # 環境変数（Gemini APIキー設定済み）
├── .env.example                   # 環境変数テンプレート
├── .gitignore                     # Git除外設定
├── README.md                      # セットアップ手順
├── HANDOFF.md                     # この引き継ぎドキュメント
├── sidepanel.html                 # サイドパネルHTML
├── index.html                     # 開発用HTML
├── docs/                          # 設計ドキュメント（参考資料）
│   ├── 00-overview.md
│   ├── 01-architecture.md
│   ├── 02-types-design.md
│   ├── 03-state-management.md
│   ├── 04-data/
│   ├── 05-hooks/
│   ├── 06-components/
│   ├── 07-services/
│   └── 08-deployment/
└── src/
    ├── types.ts                   # ✅ 型定義（完成）
    ├── App.tsx                    # ⏳ 仮実装→要更新
    ├── main.tsx                   # ✅ 開発用エントリ
    ├── sidepanel.tsx              # ✅ サイドパネルエントリ
    ├── index.css                  # ✅ グローバルスタイル
    ├── background.ts              # ✅ バックグラウンドワーカー
    ├── services/
    │   ├── translationService.ts  # ✅ Gemini API翻訳（完成）
    │   └── storageService.ts      # ✅ Chrome Storage（完成）
    ├── contexts/
    │   └── PromptContext.tsx      # ✅ グローバル状態管理（完成）
    ├── hooks/
    │   ├── useTranslation.ts      # ✅ 双方向翻訳（完成）
    │   └── useHistory.ts          # ✅ 履歴管理（完成）
    ├── components/                # ⏳ 次に作成
    │   ├── PromptEditor.tsx       # Step 2-1
    │   ├── TranslationArea.tsx    # Step 2-2
    │   └── KeywordSelector.tsx    # Step 2-3
    └── data/                      # ⏳ 次に作成
        └── keywords.ts            # Step 1
```

---

## 🔑 重要な設計決定事項

### 1. Gemini API統合（Phase 1で完了）

**選択**: Gemini API Native（直接呼び出し）

**理由**:
- ✅ 無料枠がある（15 RPM）
- ✅ 高品質な翻訳（プロンプトの文脈理解）
- ✅ シンプル（GAS不要、直接API呼び出し）
- ❌ Google翻訳APIは有料（$20/100万文字）

**実装**:
- `src/services/translationService.ts:translateText()`
- 承認済みモデルID: `gemini-2.5-pro`
- リトライロジック（最大2回）、タイムアウト30秒

---

### 2. 型安全性（最重要）

**ルール**: `any`型の使用を完全に禁止

**実装**:
- `tsconfig.json`: `strict: true`, `noImplicitAny: true`
- すべての関数、変数に明示的な型定義
- `readonly`を活用して不変性を保証

**例**:
```typescript
✅ const data: PromptState = { positive: '', negative: '' };
❌ const data: any = { positive: '', negative: '' };
```

---

### 3. 自動保存機能（Phase 2で完了）

**実装**:
- `PromptContext`がプロンプト変更を検知
- 自動的にChrome Storage APIに保存
- 次回起動時に復元

**コード**: `src/contexts/PromptContext.tsx:90-107`

---

### 4. 双方向翻訳（Phase 2で完了）

**機能**:
- 英語プロンプト変更 → 自動で日本語翻訳
- 日本語翻訳編集 → 自動で英語プロンプト更新（逆翻訳）
- デバウンス処理（500ms）でAPI呼び出し削減

**コード**: `src/hooks/useTranslation.ts`

---

## 🚀 環境セットアップ（次のセッションで確認）

### 1. 依存関係のインストール

```bash
cd "C:\projects\インタラクティブAIプロンプト・ビルダー\インタラクティブAIプロンプト・ビルダー"
npm install
```

### 2. 環境変数の確認

`.env`ファイルに以下が設定されているか確認:

```env
VITE_GEMINI_API_KEY=AIzaSyAxDVhVHHtinT9IBrS6WeMK7IS5-GELypM
VITE_GEMINI_MODEL=gemini-2.5-pro
```

### 3. 開発サーバー起動（実装後に確認）

```bash
npm run dev
```

### 4. ビルド確認（実装後）

```bash
npm run build
```

---

## 📋 次のセッション用チェックリスト

### 開始前に確認
- [ ] 依存関係がインストール済み（`npm install`）
- [ ] `.env`ファイルにAPIキーが設定済み
- [ ] Phase 1, 2の実装ファイルが存在することを確認

### Step 1: キーワードデータ作成
- [ ] `src/data/keywords.ts`を作成
- [ ] 品質カテゴリのキーワード（10個以上）
- [ ] キャラクターカテゴリのキーワード（10個以上）
- [ ] 画風カテゴリのキーワード（10個以上）
- [ ] 構図カテゴリのキーワード（10個以上）
- [ ] 服装カテゴリのキーワード（10個以上）
- [ ] 外見カテゴリのキーワード（10個以上）

### Step 2: 基本UIコンポーネント実装
- [ ] `src/components/PromptEditor.tsx`（基本版）
- [ ] `src/components/TranslationArea.tsx`（基本版）
- [ ] `src/components/KeywordSelector.tsx`（基本版）

### Step 3: App.tsx更新
- [ ] `src/App.tsx`にコンポーネント統合
- [ ] 基本レイアウト実装

### 動作確認
- [ ] `npm run dev`で開発サーバー起動
- [ ] キーワードクリックでプロンプト追加
- [ ] 英語プロンプト変更で日本語翻訳表示
- [ ] 日本語編集で英語プロンプト更新（逆翻訳）
- [ ] ブラウザリロード後も状態が復元される（自動保存）

---

## 💡 実装時の注意事項

### TypeScript厳格性
```typescript
// ✅ 正しい
const keyword: Keyword = { ja: '傑作', en: 'masterpiece' };

// ❌ 間違い
const keyword: any = { ja: '傑作', en: 'masterpiece' };
```

### readonly の活用
```typescript
// ✅ 正しい
interface KeywordCategory {
  readonly categoryName: string;
  readonly keywords: ReadonlyArray<Keyword>;
}

// ❌ 間違い
interface KeywordCategory {
  categoryName: string;
  keywords: Keyword[];
}
```

### Import パスの確認
```typescript
// 相対パスを正しく使用
import { usePromptContext } from '../contexts/PromptContext';
import { keywordCategories } from '../data/keywords';
```

---

## 📚 参考ドキュメント

| ドキュメント | パス | 用途 |
|-------------|------|------|
| プロジェクト概要 | `docs/00-overview.md` | 全体像の理解 |
| 型定義設計 | `docs/02-types-design.md` | 型システムの詳細 |
| 状態管理設計 | `docs/03-state-management.md` | PromptContextの仕様 |
| キーワード設計 | `docs/04-data/keywords-design.md` | キーワードデータ構造 |
| useTranslation | `docs/05-hooks/useTranslation.md` | 双方向翻訳の詳細 |
| コンポーネント設計 | `docs/06-components/` | UI設計の参考 |
| 翻訳サービス設計 | `docs/07-services/translation-service.md` | Gemini API統合 |

---

## 🎯 次のセッションの開始プロンプト例

```
次の実装を段階的に進めます：

## 現在の状況
- Phase 1（Core Infrastructure）✅ 完了
- Phase 2（State Management）✅ 完了
- Phase 3（UI Components）⏳ 次のステップ

## 実装方針
オプションA: 段階的実装

## 次に実装するタスク

### Step 1: キーワードデータ作成
`src/data/keywords.ts`を作成してください。

要件:
- 6つのカテゴリ（品質、キャラクター、画風、構図、服装、外見）
- 各カテゴリ最低10個のキーワード
- 日本語表示（ja）と英語プロンプト（en）のペア
- 参考: `docs/04-data/keywords-design.md`

型定義は`src/types.ts`に既に存在します。

実装を開始してください。
```

---

## ✅ Phase 3完了後の次のステップ

Phase 3基本実装完了後、以下を実施:

1. **動作確認**
   - 開発サーバーで動作テスト
   - 各機能の動作確認

2. **Phase 3拡張版実装**（オプション）
   - HistoryPanel.tsx（履歴管理UI）
   - 各コンポーネントのスタイリング強化
   - エラー表示の改善

3. **Phase 4実装**
   - コンポーネント個別CSS
   - レスポンシブデザイン対応

4. **ビルド＆デプロイ**
   - Chrome拡張としてビルド
   - 動作テスト

---

**引き継ぎドキュメント作成日**: 2025-10-19
**次回セッション開始時にこのドキュメントを参照してください**
