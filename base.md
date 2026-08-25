# Chrome拡張を作るぞ

## 拡張機能の名前

Ama Prime List Checker

## なにをする拡張機能か

Amazon prime VideoのWatch listから未見のvideoを見つけて、chromeの新しいタブに表示する。

## ユーザーの操作

chrome上の拡張機能のアイコンをクリックする。

## 前提条件

ユーザーはchromeでamazon primeにログイン済みである。
ログインしていない場合は、amazon primeのログイン画面を表示する。

## 本拡張機能の動作

 - ユーザーのwatch listのページ（https://www.amazon.co.jp/gp/video/mystuff/watchlist/tv?ref_=atv_hm_mys_c_4i2srv_1_mys_lnd_wl_tv ） を表示する。
 - ページ内のビデオの個別ページをchromeの新しいタブで表示する。
 - 各タブのページのうち未見のビデオがあればそのままにする、未見のビデオがなければタブを閉じる。
 - watch list 内のサムネイルには `data-is-watched` の状態が付与されている。`data-is-watched="false"` のvideoは未見として扱い、`data-is-watched="true"` のvideoは視聴済みとして扱う。
 - 判定は文字列のマッチだけでなく、サムネイル要素の `data-is-watched` / `class` 状態を優先して使用する。特に `data-is-watched="false"` を持つvideoは未見リストの対象から除外しない。

watch listページは非同期で読み込みを行っているので、その点を考慮すること。

** 動作が完了したら、途中で登録したEventLisnerを解除すること **

### 課金を要求するvideo

追加で課金が必要なvideoは、未見のvideoに含まない。
videoにentitlement-iconが付いているものは課金を要求するvideoの一つ。

例
  - dアニメストア
  - アニメタイムズ


