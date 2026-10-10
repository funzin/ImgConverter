---
name: verify-imgconverter
description: GitHub風 textarea フィクスチャとオプションページ上で ImgConverter（Chrome MV3 拡張）を駆動する。コード変更後に markdown→img 変換やデフォルト width/height の挙動を証明するときに使う。
---

# Verify ImgConverter

ImgConverter はブラウザ拡張です。ユーザーが GitHub（など）の textarea にフォーカスし、ツールバーアイコンをクリックすると、markdown 画像行が `<img>` タグに変わります。もう一つの画面がオプションページ（`chrome.storage.sync` に保存する `width` / `height` のデフォルト）です。

ユニットテスト（`npm test`、Karma）は変換ヘルパーをカバーしますが、クリック時の注入パス全体はカバーしません。このスキルは **Playwright Chromium にアンパック拡張を読み込み**、ツールバークリック時に background が走らせるのと同じスクリプト注入を駆動します。

## Launch

ワンショットの drive（`doctor`、`drive-*`）は Chrome の起動と後始末を自分で行います。同一セッションで何度も drive する場合は、run id とプロファイルをひとつに固定してください。

1. リポジトリルートで、ハーネス依存を一度だけ入れる:

   ```bash
   npm install --prefix .cursor/skills/verify-imgconverter/helpers
   npx --prefix .cursor/skills/verify-imgconverter/helpers playwright install chromium
   ```

2. 隔離用の run id を設定する（並列エージェント必須）:

   ```bash
   export IMGCONVERTER_RUN_ID="verify-$(date +%s)-$$"
   export IMGCONVERTER_ARTIFACTS_DIR="/opt/cursor/artifacts/imgconverter-verify"
   ```

3. 任意: フィクスチャ用ポートを固定（既定 `8765`）:

   ```bash
   export IMGCONVERTER_FIXTURE_PORT=8765
   ```

4. 下記の drive コマンドはラッパー経由で実行する（Linux で `DISPLAY` 未設定時は `xvfb-run` を使う）:

   ```bash
   .cursor/skills/verify-imgconverter/helpers/control-imgconverter doctor
   ```

**Ready when:** `doctor` が `"ok": true` を出し、空でない `extensionId` と、`#save` が載る `optionsUrl` を返す。

**Verification scaffolding:** 各 run はリポジトリを `/tmp/imgconverter-ext-$IMGCONVERTER_RUN_ID` にコピーし、ホスト権限 `http://127.0.0.1:$IMGCONVERTER_FIXTURE_PORT/*` を `host_permissions` に足す（本番は実ツールバークリック後の `activeTab` に依存）。cleanup はコピーと Chrome プロファイルを削除する。

**Teardown:** `.cursor/skills/verify-imgconverter/helpers/control-imgconverter cleanup` — `IMGCONVERTER_RUN_ID` 用のプロファイルとパッチ済み拡張ツリーだけ削除する。プロセス名で Chrome を kill しない。

## Doctor

drive 前の読み取り専用ゲート:

```bash
.cursor/skills/verify-imgconverter/helpers/control-imgconverter doctor
```

JSON の `"ok": true`、`manifestVersion` `3`、`version` が `manifest.json` と一致、オプションページが `chrome-extension://<extensionId>/src/html/options.html` で開き `#save` があること。

## Drive

ハーネス: **Playwright Chromium**（`helpers/` 経由で同梱 — システム Google Chrome はしばしば `--load-extension` を無視する）。

**ツールバークリック相当:** ヘルパーはフィクスチャの textarea にフォーカスし、拡張の service worker から `src/js/background.js` と同じ `chrome.scripting.executeScript` のファイル一覧を実行する（検証用コピーにホスト権限を付与したうえで、action クリックと同等）。

対象の挙動は `.cursor/skills/verify-imgconverter/features/README.md` と各 feature ファイルを読む。

| コマンド | Feature map |
|---------|----------------|
| `drive-convert-all` | [convert-markdown-images](./features/convert-markdown-images.md) |
| `drive-convert-selection` | [convert-selection-only](./features/convert-selection-only.md) |
| `drive-options-width` | [options-default-size](./features/options-default-size.md) |

例:

```bash
.cursor/skills/verify-imgconverter/helpers/control-imgconverter drive-convert-all
```

## Evidence

証跡は `$IMGCONVERTER_ARTIFACTS_DIR/<feature-id>/` 配下（既定 `/opt/cursor/artifacts/imgconverter-verify/`）。

`convert-markdown-images` の場合:

- `textarea-before.txt` — 入力 markdown
- `textarea-after.txt` — 変換後の textarea 値
- `fixture-after.png` — フィクスチャページのスクリーンショット
- `proof.json` — `expected` と `actual` の一致

**Proof standards:** フィクスチャ上のユーザー可視 textarea パスを駆動する。入力と結果の両方を残す。デフォルトの `width=50%` タグ形は `createParams` に合わせる。このスキル起動時は Karma だけのヘルパーを唯一の証明にしない。`npm test` は純粋関数の速い回帰チェックとして残す。

## Cleanup

成功・失敗のどちらの drive のあとでも:

```bash
.cursor/skills/verify-imgconverter/helpers/control-imgconverter cleanup
```

cleanup 後も `$IMGCONVERTER_ARTIFACTS_DIR` 配下の証跡が残っていることを確認する。

## Helpers

コマンドはすべて次経由:

```bash
.cursor/skills/verify-imgconverter/helpers/control-imgconverter <command>
```

実装: `helpers/control-imgconverter.mjs`（Node ESM + Playwright）。bash ラッパーは必要時に `xvfb-run` を付ける。

環境変数:

| 変数 | 用途 |
|----------|---------|
| `IMGCONVERTER_RUN_ID` | `/tmp/imgconverter-verify-*` と `/tmp/imgconverter-ext-*` を隔離 |
| `IMGCONVERTER_REPO_ROOT` | アンパック拡張のソース（既定: リポジトリルート） |
| `IMGCONVERTER_ARTIFACTS_DIR` | 証跡の出力ルート |
| `IMGCONVERTER_FIXTURE_PORT` | フィクスチャ HTTP サーバのポート |

## Maintenance

ルート・manifest・変換ルールが変わったら `/maintain-verification-skill` で feature map を更新し、各 feature を再証明する。
