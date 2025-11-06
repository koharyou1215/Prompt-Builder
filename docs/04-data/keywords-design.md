# キーワードデータ設計仕様

## ドキュメント情報

**ファイル名**: `keywords-design.md`
**カテゴリ**: データ設計
**作成日**: 2025-10-19
**関連ファイル**: `src/data/keywords.ts`

---

## 概要

インタラクティブAIプロンプト・ビルダーで使用するキーワードデータの設計仕様を定義します。ポジティブプロンプトとネガティブプロンプトの両方に対応したカテゴリ別キーワードデータを管理します。

---

## 設計方針

### 1. データの不変性

すべてのキーワードデータは読み取り専用（`readonly`）として定義し、実行時の意図しない変更を防止します。

```typescript
export const KEYWORD_CATEGORIES: readonly KeywordCategory[] = [
  // ...
] as const;
```

### 2. 日英バイリンガル対応

各キーワードは日本語（`ja`）と英語（`en`）の両方を持ち、ユーザーインターフェースと実際のプロンプト生成の両方に対応します。

### 3. カテゴリベースの構造化

キーワードを意味的なカテゴリに分類し、ユーザーが目的のキーワードを見つけやすくします。各カテゴリには表示順序（`order`）を設定し、UI上での一貫した並び順を保証します。

### 4. 説明文の提供

各キーワードには説明文（`description`）を付与し、ユーザーがキーワードの効果を理解しやすくします。

---

## データ構造

### KeywordCategory型

```typescript
interface KeywordCategory {
  id: string;              // カテゴリの一意識別子
  name: string;            // カテゴリの表示名（日本語）
  order: number;           // 表示順序（1から開始）
  keywords: Keyword[];     // このカテゴリに属するキーワード配列
}

interface Keyword {
  ja: string;              // 日本語キーワード
  en: string;              // 英語キーワード（プロンプト生成用）
  description: string;     // キーワードの説明
}
```

---

## ポジティブプロンプトのカテゴリ

### 1. 品質（quality）

**表示順序**: 1
**目的**: 画像の全体的な品質を向上させるキーワード

**キーワード**:
- 傑作（masterpiece） - 最高品質の作品を生成
- 最高品質（best quality） - 高品質な画像を生成
- 超詳細（ultra detailed） - 非常に詳細な描写
- 高解像度（high resolution） - 高解像度の画像
- 8K（8k） - 8K解像度相当の品質

### 2. キャラクター（character）

**表示順序**: 2
**目的**: キャラクターの人数や属性を指定

**キーワード**:
- 1人の女の子（1girl） - 女性キャラクター1人
- 1人の男の子（1boy） - 男性キャラクター1人
- 複数の女の子（multiple girls） - 複数の女性キャラクター
- ソロ（solo） - 単独のキャラクター
- 少女（loli） - 幼い女の子

### 3. 外見（appearance）

**表示順序**: 3
**目的**: キャラクターの外見的特徴を指定

**キーワード**:
- 長い髪（long hair） - 長い髪型
- ツインテール（twintails） - ツインテールヘアスタイル
- 青い目（blue eyes） - 青い瞳
- 赤い髪（red hair） - 赤色の髪
- 笑顔（smile） - 笑顔の表情

### 4. 服装（clothing）

**表示順序**: 4
**目的**: キャラクターの衣装や服装を指定

**キーワード**:
- 学校の制服（school uniform） - 学生服
- ドレス（dress） - ドレス衣装
- 和服（japanese clothes） - 日本の伝統衣装
- ゴシックロリータ（gothic lolita） - ゴシックロリータファッション
- 白いシャツ（white shirt） - 白いシャツ

### 5. 画風（art_style）

**表示順序**: 5
**目的**: イラストの全体的なスタイルを指定

**キーワード**:
- アニメ風（anime style） - アニメ調の画風
- リアル（realistic） - 写実的な画風
- 水彩画（watercolor） - 水彩画タッチ
- サイバーパンク（cyberpunk） - サイバーパンク風
- 90年代アニメ（1990s \\(style\\)） - 90年代アニメスタイル

### 6. 構図（composition）

**表示順序**: 6
**目的**: カメラアングルや構図を指定

**キーワード**:
- 全身（full body） - 全身を含む構図
- バストアップ（upper body） - 上半身中心の構図
- クローズアップ（close-up） - 顔のクローズアップ
- 上から（from above） - 上からのアングル
- 下から（from below） - 下からのアングル

### 7. 背景（background）

**表示順序**: 7
**目的**: 背景のシーンや環境を指定

**キーワード**:
- シンプルな背景（simple background） - シンプルな背景
- 白い背景（white background） - 白色の背景
- 屋外（outdoors） - 屋外シーン
- 室内（indoors） - 室内シーン
- 夜空（night sky） - 夜の空

### 8. ライティング（lighting）

**表示順序**: 8
**目的**: 照明効果や光の表現を指定

**キーワード**:
- 柔らかい光（soft light） - 柔らかい照明
- 劇的なライティング（dramatic lighting） - ドラマチックな照明効果
- 逆光（backlighting） - 背後からの光
- 夕暮れ（sunset） - 夕暮れの光
- ネオンライト（neon lights） - ネオン照明

### 9. ポーズ（pose）

**表示順序**: 9
**目的**: キャラクターの姿勢や動作を指定

**キーワード**:
- 立っている（standing） - 立ち姿勢
- 座っている（sitting） - 座っている姿勢
- 歩いている（walking） - 歩行中の姿勢
- 手を振っている（waving） - 手を振るポーズ
- 見上げている（looking up） - 上を見上げる姿勢

### 10. エフェクト（effects）

**表示順序**: 10
**目的**: 視覚効果や特殊効果を指定

**キーワード**:
- ブルーム効果（bloom） - 光の滲み効果
- 被写界深度（depth of field） - ピントのボケ効果
- レンズフレア（lens flare） - レンズフレア効果
- モーションブラー（motion blur） - 動きのブレ効果
- パーティクル（particles） - パーティクルエフェクト

---

## ネガティブプロンプトのカテゴリ

### 1. 品質（ネガティブ）（negative_quality）

**表示順序**: 1
**目的**: 低品質な画像を除外

**キーワード**:
- 低品質（low quality） - 低品質を除外
- 最悪品質（worst quality） - 最低品質を除外
- ぼやけ（blurry） - ぼやけた画像を除外
- ノイズ（noisy） - ノイズの多い画像を除外
- アーティファクト（artifacts） - 画像の乱れを除外

### 2. 解剖学的問題（negative_anatomy）

**表示順序**: 2
**目的**: 解剖学的に不自然な描写を除外

**キーワード**:
- 悪い手（bad hands） - 手の描写の問題を除外
- 欠けた指（missing fingers） - 指の欠損を除外
- 余分な手足（extra limbs） - 余分な手足を除外
- 変形した体（deformed） - 体の変形を除外
- 不自然な体（bad anatomy） - 解剖学的に不自然な描写を除外

### 3. コンテンツ（negative_content）

**表示順序**: 3
**目的**: 不適切なコンテンツを除外

**キーワード**:
- NSFW（nsfw） - 不適切なコンテンツを除外
- グロテスク（grotesque） - グロテスクな表現を除外
- 暴力的（violence） - 暴力的な表現を除外
- 不快（disturbing） - 不快な表現を除外

### 4. スタイル（negative_style）

**表示順序**: 4
**目的**: 望ましくないスタイル要素を除外

**キーワード**:
- 単純すぎる（simple） - 単純すぎる描写を除外
- モノクロ（monochrome） - モノクロ画像を除外
- テキスト（text） - 画像内のテキストを除外
- 透かし（watermark） - 透かしを除外
- 署名（signature） - 署名を除外

---

## ヘルパー関数

### getCategoryById

指定されたカテゴリIDに対応するカテゴリオブジェクトを取得します。

```typescript
export const getCategoryById = (
  categoryId: string,
  isNegative = false
): KeywordCategory | undefined => {
  const categories = isNegative ? NEGATIVE_KEYWORD_CATEGORIES : KEYWORD_CATEGORIES;
  return categories.find((category) => category.id === categoryId);
};
```

### getAllCategories

ポジティブとネガティブの全カテゴリを結合して取得します。

```typescript
export const getAllCategories = (): readonly KeywordCategory[] => {
  return [...KEYWORD_CATEGORIES, ...NEGATIVE_KEYWORD_CATEGORIES] as const;
};
```

### getTotalKeywordCount

指定されたタイプ（ポジティブ/ネガティブ）の総キーワード数を計算します。

```typescript
export const getTotalKeywordCount = (isNegative = false): number => {
  const categories = isNegative ? NEGATIVE_KEYWORD_CATEGORIES : KEYWORD_CATEGORIES;
  return categories.reduce((total, category) => total + category.keywords.length, 0);
};
```

---

## キーワードデータの追加方法

### 新しいカテゴリの追加

1. `KEYWORD_CATEGORIES`または`NEGATIVE_KEYWORD_CATEGORIES`配列に新しいオブジェクトを追加
2. 以下のプロパティを設定:
   - `id`: 一意のカテゴリID（スネークケース推奨）
   - `name`: 日本語のカテゴリ名
   - `order`: 表示順序（既存カテゴリとの順序を考慮）
   - `keywords`: キーワード配列

```typescript
{
  id: 'new_category',
  name: '新しいカテゴリ',
  order: 11,
  keywords: [
    // キーワードを追加
  ]
}
```

### 既存カテゴリへのキーワード追加

1. 対象のカテゴリオブジェクトを見つける
2. `keywords`配列に新しいキーワードオブジェクトを追加
3. 以下のプロパティを設定:
   - `ja`: 日本語キーワード
   - `en`: 英語キーワード（実際のプロンプトで使用）
   - `description`: キーワードの説明

```typescript
{
  ja: '新しいキーワード',
  en: 'new keyword',
  description: 'このキーワードの効果説明'
}
```

### 注意事項

- **英語キーワードの精度**: `en`フィールドは実際のAI画像生成に使用されるため、正確な英語表記を使用してください
- **特殊文字のエスケープ**: 必要に応じて特殊文字をエスケープ（例: `1990s \\(style\\)`）
- **説明文の簡潔性**: `description`は簡潔かつ分かりやすく記述してください
- **順序の一貫性**: `order`プロパティは連続した整数を使用し、論理的な順序を保ってください

---

## 関連ドキュメント

- **型定義**: [型システム設計仕様](../02-types/types-design.md)
- **コンポーネント**: [キーワード選択UI設計](../03-components/keyword-selector-design.md)
- **状態管理**: [Zustand ストア設計](../05-state/store-design.md)

---

## 統計情報

**ポジティブカテゴリ数**: 10
**ネガティブカテゴリ数**: 4
**ポジティブキーワード総数**: 50
**ネガティブキーワード総数**: 19

---

## 更新履歴

| 日付 | 変更内容 |
|------|---------|
| 2025-10-19 | 初版作成 - 元設計図から抽出 |
