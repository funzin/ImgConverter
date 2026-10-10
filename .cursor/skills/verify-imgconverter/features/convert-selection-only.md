# Convert only selected markdown

ユーザーが markdown 画像構文を含む部分文字列を選択しているとき、その選択範囲だけが置換され、textarea の残りは変わらない。

## Sub-features

- `selection-replace` — 選択が markdown 画像トークンを含む。
- `selection-no-op` — 選択が markdown 画像テキストを含まない（変化なしを期待）。空選択（`start === end`）は convert-all 分岐になり全文変換される点に注意。

## How to get to it (user POV)

- 対応サイトの textarea にフォーカスし、本文に markdown 画像テキストがある状態にする。
- markdown 画像行、またはコンバータ正規表現にまだマッチする部分を選択する。
- ImgConverter のツールバーアイコンをクリックする。

## Driving it with Playwright Chromium

前提:

- [convert-markdown-images](./convert-markdown-images.md) と同じ。

- **自動化:** `control-imgconverter drive-convert-selection`。フィクスチャ `#comment` に markdown を入れ、`selectionStart` / `selectionEnd` を markdown トークンに合わせてから注入する。続けてプレーンテキストだけの非空選択で no-op を証明する。
- **証跡:** `$IMGCONVERTER_ARTIFACTS_DIR/convert-selection-only/` 配下の `textarea-before.txt`、`textarea-after.txt`、`textarea-noop-after.txt`、`fixture-after.png`、`proof.json`。
- ロジック単体は Karma `spec/js/convert-to-img-tag-spec.js`（`convertOnlySelectionToImgTag`）でもカバーされる。

## Gotchas

- 選択が有効な markdown 画像構文と重ならないと、注入スクリプトはフィールドを変えずに戻る。
- 「選択なし」（`start === end`）は selection 変換ではなく全文 convert-all になる。`selection-no-op` は markdown を含まない**非空**選択で証明する。
