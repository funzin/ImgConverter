# Options default width and height

ユーザーは拡張のオプションページを開き、デフォルトの `width` および/または `height` 文字列を設定して保存する。以降の変換では、生成される `<img>` タグにそれらの属性が付く。

## Sub-features

- `options-save-width` — width のみ。
- `options-save-height` — height のみ。
- `options-save-both` — width と height。
- `options-empty-default` — 空のまま保存すると空文字が格納され、変換時に両方空なら `width=50%` にフォールバック。

## How to get to it (user POV)

- ImgConverter のツールバーアイコンを右クリック → **Options**、またはブラウザの拡張オプション UI を開く。
- **width** / **height** 欄に値を入れる。
- **Save** をクリックする。

## Driving it with Playwright Chromium

前提:

- `control-imgconverter doctor` が成功している（`chrome-extension://<id>/src/html/options.html` を開く）。

- **自動化:** `control-imgconverter drive-options-width`。オプション URL で `#width` に `200px` を入れ `#save` をクリックし、フィクスチャ上で変換して `width=200px` を証明する。続けて両欄を空にして保存し、デフォルト `width=50%` を再証明する。
- **証跡:** `$IMGCONVERTER_ARTIFACTS_DIR/options-default-size/` 配下の `options-after-save.png`、`textarea-after-custom.txt`、`textarea-after-default.txt`、`fixture-after.png`、`proof.json`。
- Karma `spec/js/options-spec.js` と `createParams` テストはモック付きでストレージ配線をカバーする。

## Gotchas

- オプションページは jQuery と `chrome.storage.sync` を使う。drive は HTTP フィクスチャではなく拡張オリジンを使う。
- 空の保存は `{ width: "", height: "" }` を残す。変換時に両方が空ならデフォルト `width=50%` が適用される。
