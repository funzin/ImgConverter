# ImgConverter 検証マップ

ユーザー向け拡張の挙動を検証するためのメンテ対象ソース。drive 前にこの索引を読み、対応する feature ファイルをレシピとして使う。

## Baseline preconditions

- 依存インストール済み（ユニットテストはリポジトリルートで `npm ci`、drive は `npm install --prefix .cursor/skills/verify-imgconverter/helpers`）。
- Playwright Chromium 導入済み: `npx --prefix .cursor/skills/verify-imgconverter/helpers playwright install chromium`。
- 検証 run ごとに一意の `IMGCONVERTER_RUN_ID` を設定する。
- `IMGCONVERTER_ARTIFACTS_DIR` を設定する（既定 `/opt/cursor/artifacts/imgconverter-verify`）。
- `control-imgconverter doctor` を実行し `"ok": true` を必須とする。
- この run で作っていない Chrome プロファイルやパッチ済み拡張ツリーを drive しない。

## Driving conventions

- Linux CI で `DISPLAY` 未設定のときに `xvfb-run` が付くよう、ラッパー `helpers/control-imgconverter` を使う。
- feature ファイルに別指定がなければ GitHub 風フィクスチャから始める。
- レイアウトセレクタより安定 DOM id（`#comment`、`#width`、`#height`、`#save`）を優先する。
- 使い捨て状態は `cleanup` で戻す。cleanup 中に証跡を消さない。

## Proof and skip reporting

- スクリーンショットだけでなく、変換前の markdown 入力と変換後の textarea 値を残す。
- `proof.json` に `feature` id とフィクスチャ URL を記録する。
- feature の入口に届かないときは、コマンドと満たせなかった前提を報告し、別入口でカバーしたと主張しない。

## Feature entry contract

各 feature ファイルは H1 に加え、次の 4 つの H2 を使う: `Sub-features`、`How to get to it (user POV)`、`Driving it with Playwright Chromium`、`Gotchas`。

## Features

- [Convert markdown images in textarea](./convert-markdown-images.md) — フィクスチャ上での全文変換（デフォルト width）。
- [Convert only selected markdown](./convert-selection-only.md) — 選択範囲だけの置換。
- [Options default width and height](./options-default-size.md) — オプションページのストレージと変換への反映。
