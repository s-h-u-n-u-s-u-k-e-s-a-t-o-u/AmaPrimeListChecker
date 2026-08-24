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

ユーザーのwatch listのページ（https://www.amazon.co.jp/gp/video/mystuff/watchlist/tv?ref_=atv_hm_mys_c_4i2srv_1_mys_lnd_wl_tv ） を表示する。
ページ内のビデオの個別ページをchromeの新しいタブで表示する。
各タブのページのうち未見のビデオがあればそのままにする、未見のビデオがなければタブを閉じる。

### 別途課金を要求するvideo
dアニメストアやアニメタイムズなどの課金が追加で必要なvideoは、未見のvideoに含まない。

videoにentitlement-iconが付いているものは課金を要求するvideoの一つ。