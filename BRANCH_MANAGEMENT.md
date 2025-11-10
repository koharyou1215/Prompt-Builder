# ブランチ管理戦略

## 問題
複数のブランチで作業していると、変更がどこにあるか分からなくなり、同じ修正を何度も行う必要がある。

## 解決方法

### 1. mainブランチを「真実の源」にする

すべての重要な変更はmainブランチに統合します。

```bash
# 現在のブランチの変更をmainにマージ
git checkout main
git pull origin main  # 最新のmainを取得
git merge your-feature-branch
git push origin main  # mainにプッシュ（PRが必要な場合はPR作成）
```

### 2. 他のブランチにmainの変更を取り込む

mainにマージした後、他のブランチを更新します：

```bash
# 作業中のブランチに切り替え
git checkout your-other-branch

# mainの変更を取り込む（2つの方法）

# 方法A: マージ（安全・推奨）
git merge main

# 方法B: リベース（履歴がきれいになる）
git rebase main
```

### 3. 今回の修正を他のブランチに適用する

特定のコミットだけを他のブランチに適用したい場合：

```bash
# 適用したいブランチに切り替え
git checkout target-branch

# cherry-pickで特定のコミットを適用
git cherry-pick 7429c0a  # キーワード削除の確認ダイアログ削除のコミット

# プッシュ（ブランチ名がclaudeで始まり、正しいセッションIDで終わることを確認）
git push origin target-branch
```

## 推奨ワークフロー

### 新機能開発時

1. **mainから新しいブランチを作成**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b claude/your-feature-SESSIONID
   ```

2. **変更を加えてコミット**
   ```bash
   git add .
   git commit -m "Your changes"
   git push -u origin claude/your-feature-SESSIONID
   ```

3. **PRを作成してmainにマージ**
   - GitHub上でPull Requestを作成
   - レビュー後、mainにマージ

4. **他のブランチを更新**
   ```bash
   git checkout other-branch
   git merge main  # またはgit rebase main
   ```

### 緊急の修正（複数ブランチに適用したい場合）

1. **mainブランチで修正**
   ```bash
   git checkout main
   git pull origin main
   # 修正を加える
   git add .
   git commit -m "Fix: important bug fix"
   git push origin main
   ```

2. **cherry-pickで各ブランチに適用**
   ```bash
   # コミットハッシュを確認
   git log --oneline -1  # 例: abc1234 Fix: important bug fix

   # 各ブランチに適用
   git checkout branch1
   git cherry-pick abc1234
   git push

   git checkout branch2
   git cherry-pick abc1234
   git push
   ```

## 今回のケース：キーワード削除ダイアログの修正

### 実行したコマンド

```bash
# 1. mainに変更をマージ（ローカル）
git checkout main
git merge claude/remove-keyword-delete-dialog-011CUyxWUyNZR8RUhSrTqYhk

# 2. 他のブランチに適用する場合
git checkout claude/add-bulk-delete-button-011CUyxWUyNZR8RUhSrTqYhk
git cherry-pick 7429c0a

git checkout claude/fix-typescript-errors-011CUyf3EzGtdbgemzBvE5kC
git cherry-pick 7429c0a
```

### 修正内容
- **コミット**: `7429c0a`
- **ファイル**: `src/components/CategoryManagementModal.tsx`
- **変更**: キーワード削除時の確認ダイアログを削除

## ベストプラクティス

1. **常にmainから始める**: 新しいブランチはmainから作成
2. **頻繁にmainを取り込む**: `git merge main`で定期的に更新
3. **小さなコミットにする**: cherry-pickしやすくなる
4. **コミットメッセージを明確に**: 後で探しやすくなる

## トラブルシューティング

### Q: どのブランチに何があるか分からない

```bash
# すべてのブランチを表示
git branch -a

# 特定のファイルがどのブランチにあるか確認
git branch --contains HEAD -- src/components/CategoryManagementModal.tsx

# 各ブランチの最新コミットを表示
git branch -v
```

### Q: 間違ったブランチで作業してしまった

```bash
# 変更を一時保存
git stash

# 正しいブランチに切り替え
git checkout correct-branch

# 変更を適用
git stash pop
```

### Q: cherry-pickでコンフリクトが発生した

```bash
# コンフリクトを手動で解決
# 該当ファイルを編集

# 解決後
git add .
git cherry-pick --continue
```
