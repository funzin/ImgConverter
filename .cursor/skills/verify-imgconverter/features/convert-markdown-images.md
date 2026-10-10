# Convert markdown images in textarea

GitHub 風コメント欄で、markdown 画像構文を含む textarea にフォーカスし、ImgConverter のツールバーアイコンをクリックすると、一致する `![...](https://...)` 行がすべて `<img>` タグになる。オプション未保存時はデフォルトサイズが付く。

## Sub-features

- `convert-all-default-width` — 選択なし。storage が空のときデフォルト `width=50%`。
- `convert-all-custom-width` — オプションページで width を保存したあと（options feature 参照）。
- `convert-multi-image` — 1 つの textarea に複数の markdown 画像。

## How to get to it (user POV)

- 対応サイト（GitHub、esa、Docbase など）で issue / PR / コメント欄を開く。
- textarea に `![title](https://...png|jpg|jpeg|gif)` が含まれるよう貼り付けまたは入力する。
- textarea にフォーカスする。
- ImgConverter のブラウザツールバーアイコンをクリックする。

## Driving it with Playwright Chromium

前提:

- この `IMGCONVERTER_RUN_ID` で `control-imgconverter doctor` が成功している。
- フィクスチャサーバが `http://127.0.0.1:$IMGCONVERTER_FIXTURE_PORT/github-comment.html` を返す。

- **フィクスチャを開く。** `control-imgconverter drive-convert-all` を実行。Playwright がフィクスチャ URL を開く。
- **markdown を入れる。** `#comment` に、通常のテキスト行に囲まれた `![title](https://user-images.githubusercontent.com/test0.png)` を入れる。
- **フォーカス。** `#comment` にフォーカス（注入スクリプトの `document.activeElement` に必要）。
- **ツールバー相当の注入。** ヘルパーが service worker から `chrome.scripting.executeScript` で `src/js/markdown-image.js` のあと `src/js/convert-to-img-tag.js` を実行する。
- **Proof。** `#comment` の値を読む。周囲の行に挟まれたデフォルトタグ ` <img src=https://user-images.githubusercontent.com/test0.png  width=50%> ` を期待。証跡: `$IMGCONVERTER_ARTIFACTS_DIR/convert-markdown-images/` 配下の `textarea-before.txt`、`textarea-after.txt`、`fixture-after.png`、`proof.json`。

## Gotchas

- 本番は `activeTab`。検証用コピーは localhost の `host_permissions` を足す — その manifest をストアに出さない。
- システム Google Chrome は `--load-extension` を無視することがある。ハーネスは Playwright 同梱の Chromium を使う。
- ヘッドレスのシステム Chrome は拡張を 0 個読み込むことが多い。Linux では `xvfb-run` 配下の headed Chromium で drive する。
- `actual` が `width=` 周りの空白だけ違う場合は、`src/js/convert-to-img-tag.js` の `createParams` 出力と比較する。
