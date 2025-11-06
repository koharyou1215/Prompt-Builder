# プロンプト構文保護機能

## 概要

翻訳時にAI画像生成プロンプトの特殊な構文（重み付けや強調表現）を保護する機能を実装しました。

## 問題

翻訳APIに以下のような特殊な構文を含むテキストを送信すると、不正なレスポンスとして弾かれる問題がありました：

- `(keyword:1.2)` - 明示的な重み付け
- `((keyword))` - ネスト括弧による強調（重み 1.21）
- `{keyword}` - 波括弧
- `[keyword]` - 角括弧

## 解決方法

翻訳前に特殊構文をプレースホルダーに置き換え、翻訳後に復元する「マスキング」機能を実装しました。

### 処理フロー

```
元のテキスト
  ↓
特殊構文を抽出してプレースホルダーに置換（マスキング）
  ↓
マスクされたテキストを翻訳APIに送信
  ↓
翻訳結果を受け取る
  ↓
プレースホルダーを元の特殊構文に復元（アンマスキング）
  ↓
最終結果
```

### 例

**入力:**
```
美しい少女, (青い目:1.2), ((傑作)), 長い髪
```

**マスキング後:**
```
美しい少女, __PROMPTSYNTAX__0__, __PROMPTSYNTAX__1__, 長い髪
```

**翻訳後（マスク状態）:**
```
beautiful girl, __PROMPTSYNTAX__0__, __PROMPTSYNTAX__1__, long hair
```

**最終結果（アンマスキング後）:**
```
beautiful girl, (青い目:1.2), ((傑作)), long hair
```

## 実装ファイル

### 新規作成

1. **`src/utils/promptSyntaxProtector.ts`**
   - マスキング/アンマスキング処理の実装
   - 主要な関数：
     - `maskPromptSyntax()` - 特殊構文をプレースホルダーに置換
     - `unmaskPromptSyntax()` - プレースホルダーを元に戻す
     - `hasPromptSyntax()` - 特殊構文の存在確認
     - `extractPromptSyntax()` - 特殊構文の抽出

### 変更ファイル

2. **`src/services/translationService.ts`**
   - Gemini API翻訳にマスキング処理を統合
   - 翻訳前にマスク、翻訳後にアンマスク

3. **`src/services/googleTranslateService.ts`**
   - Google翻訳にマスキング処理を統合
   - 翻訳前にマスク、翻訳後にアンマスク

### テスト/サンプル

4. **`tests/promptSyntaxProtector.test.ts`**
   - ユニットテスト（Vitestが必要）

5. **`tests/promptSyntaxProtector.example.ts`**
   - 使用例のデモコード

## 対応する特殊構文

| 構文 | 説明 | 例 |
|------|------|-----|
| `(keyword)` | 括弧強調 (重み 1.1) | `(blue eyes)` |
| `((keyword))` | 二重括弧強調 (重み 1.21) | `((masterpiece))` |
| `(keyword:1.2)` | 明示的重み指定 | `(detailed:1.3)` |
| `{keyword}` | 波括弧 | `{bad anatomy}` |
| `[keyword]` | 角括弧 | `[slight emphasis]` |

## 使用方法

通常の使用では特に何もする必要はありません。翻訳処理内で自動的にマスキング/アンマスキングが行われます。

### 手動で使用する場合

```typescript
import { maskPromptSyntax, unmaskPromptSyntax } from './utils/promptSyntaxProtector';

// マスキング
const input = 'a girl, (blue eyes:1.2), ((masterpiece))';
const { maskedText, mappings } = maskPromptSyntax(input);

// 翻訳（例）
const translated = await someTranslationAPI(maskedText);

// アンマスキング
const result = unmaskPromptSyntax(translated, mappings);
```

## テスト

TypeScript型チェック:
```bash
npm run type-check
```

ビルドテスト:
```bash
npm run build
```

## 注意事項

- プレースホルダーは `__PROMPTSYNTAX__N__` の形式（Nは連番）
- マスキングは翻訳APIへの送信直前に実行
- アンマスキングは翻訳APIからの受信直後に実行
- 元の構文が完全に保持されることを保証

## 開発者向け情報

### 正規表現パターン

```typescript
/(\(+[^()]+?\)+(?::[0-9]+\.?[0-9]*)?|\{+[^{}]+?\}+|\[+[^\[\]]+?\]+)/g
```

このパターンは以下にマッチします：
- 括弧で囲まれたテキスト + オプションの重み指定
- 波括弧で囲まれたテキスト
- 角括弧で囲まれたテキスト

### ログ出力

開発モード（`DEV`環境）では、以下の情報がログ出力されます：
- マスキング処理の詳細（構文の数、テキスト長）
- アンマスキング処理の詳細

本番環境ではログは出力されません。
