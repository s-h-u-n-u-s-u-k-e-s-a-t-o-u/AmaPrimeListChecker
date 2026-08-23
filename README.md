# Ama Prime List Checker

Amazon Prime Video の Watch list から未視聴の作品を見つけ、個別ページを別タブで開いて未視聴の作品だけを残す Chrome 拡張です。

## 使い方

1. Chrome で `chrome://extensions` を開く
2. 右上の「デベロッパーモード」をオンにする
3. 「パッケージ化されていない拡張機能を読み込む」を選ぶ
4. このフォルダを選択する
5. 拡張機能のアイコンをクリックして Watch list を確認する

## 動作概要

- icon click で Amazon Prime の Watch list（`https://www.amazon.co.jp/gp/video/mystuff`）を開く
- Watch list 内の動画リンクを収集する
- 各動画ページを新しいタブで開く
- 視聴済みと見なされるページは自動で閉じる
- 未視聴とみなされるページだけ残す
- 追加課金が必要な動画は除外する

## 注意事項

- Amazon にログイン済みであることが前提です
- 未ログインの場合は Amazon のログイン画面へ遷移します
- Prime Video のページ構造変更により判定パターンがズレる場合があります
