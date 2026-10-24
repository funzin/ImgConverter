---
name: verify-imgconverter
description: Drive ImgConverter (Chrome MV3 extension) on a GitHub-style textarea fixture and options page; use when proving markdown-to-img conversion, GitHub upload tags, or default width/height behavior after code changes.
---

# Verify ImgConverter

ImgConverter is a browser extension: the user focuses a textarea on GitHub (or similar), clicks the toolbar icon, and markdown image lines become `<img>` tags. A second surface is the options page (`width` / `height` defaults stored in `chrome.storage.sync`).

Unit tests (`npm test`) cover conversion helpers but not the full inject-on-click path. This skill loads the **unpacked extension in Playwright Chromium** and drives the same script injection the service worker runs on toolbar click.

## Launch

One-shot drives (`doctor`, `drive-*`) launch and tear down Chrome themselves. For repeated drives in one session, keep a single run id and profile.

1. From the repo root, install dependencies once. The helper runs `node scripts/bundle.mjs` before it copies the extension, and that script needs the repo `devDependencies`.

   ```bash
   npm ci
   npm install --prefix .cursor/skills/verify-imgconverter/helpers
   npx --prefix .cursor/skills/verify-imgconverter/helpers playwright install chromium
   ```

2. Set an isolated run id (required for side-by-side agents):

   ```bash
   export IMGCONVERTER_RUN_ID="verify-$(date +%s)-$$"
   export IMGCONVERTER_ARTIFACTS_DIR="/opt/cursor/artifacts/imgconverter-verify"
   ```

3. Optional: pin fixture port (default `8765`):

   ```bash
   export IMGCONVERTER_FIXTURE_PORT=8765
   ```

4. Run any drive command below via the wrapper (uses `xvfb-run` on Linux when `DISPLAY` is unset):

   ```bash
   .cursor/skills/verify-imgconverter/helpers/control-imgconverter doctor
   ```

**Ready when:** `doctor` prints `"ok": true` with a non-empty `extensionId`, an `optionsUrl` that loads `#save`, `"scriptsOk": true`, and a `serviceWorkerUrl` ending in `/src/js/background.js`.

**Verification scaffolding.** Each run bundles classic scripts into `src/js`. Git ignores those esbuild IIFE files. The helper copies the repo to `/tmp/imgconverter-ext-$IMGCONVERTER_RUN_ID` without `node_modules` or `.git`. It adds host permission `http://127.0.0.1:$IMGCONVERTER_FIXTURE_PORT/*` under `host_permissions` so `executeScript` can reach the local fixture. Production relies on `activeTab` after a real toolbar click. Cleanup removes the copy and the Chrome profile. The bundle files in the repo checkout stay.

**Teardown:** `.cursor/skills/verify-imgconverter/helpers/control-imgconverter cleanup` — removes only the profile and patched extension tree for `IMGCONVERTER_RUN_ID`. Never kill Chrome by process name.

## Doctor

Read-only gate before driving:

```bash
.cursor/skills/verify-imgconverter/helpers/control-imgconverter doctor
```

Require JSON `"ok": true`, `manifestVersion` `3`, `version` matching `manifest.json`, `"scriptsOk": true`, a `serviceWorkerUrl` ending in `/src/js/background.js`, and options page reachable at `chrome-extension://<extensionId>/src/html/options.html` with `#save` present. `scriptsOk` means the extension can fetch `src/js/background.js`, `src/js/options.js`, and `src/js/convert-to-img-tag.js`.

## Drive

Harness: **Playwright Chromium** (bundled via `helpers/` — not system Google Chrome, which often ignores `--load-extension`).

**Toolbar click path:** the helper focuses the fixture textarea, then runs `chrome.scripting.executeScript` with `files: ['src/js/convert-to-img-tag.js']` in the active tab. That file list matches `src/js/background.ts`. The helper does not call `chrome.action.onClicked`. The drive opens the fixture page first so that page is the active tab. The injected script selects the whole control and writes the result with `document.execCommand("insertText")`.

Read `.cursor/skills/verify-imgconverter/features/README.md` and the feature file for the behavior under test.

| Command | Feature map |
|---------|----------------|
| `drive-convert-all` | [convert-markdown-images](./features/convert-markdown-images.md) |
| `drive-convert-selection` | [convert-selection-only](./features/convert-selection-only.md) |
| `drive-convert-upload` | [convert-github-uploads](./features/convert-github-uploads.md) |
| `drive-convert-react` | [convert-react-editor](./features/convert-react-editor.md) |
| `drive-options-width` | [options-default-size](./features/options-default-size.md) |

Example:

```bash
.cursor/skills/verify-imgconverter/helpers/control-imgconverter drive-convert-all
```

## Evidence

Proof artifacts live under `$IMGCONVERTER_ARTIFACTS_DIR/<feature-id>/` (default `/opt/cursor/artifacts/imgconverter-verify/`).

For `convert-markdown-images`:

- `textarea-before.txt` — input markdown
- `textarea-after.txt` — textarea value after conversion
- `fixture-after.png` — screenshot of the fixture page
- `proof.json` — `expected` vs `actual` equality

**Proof standards:** drive the user-visible textarea path on the fixture; capture both action input and resulting value; compare to the default quoted tag `<img src="https://user-images.githubusercontent.com/test0.png" alt="title" width="50%">`; do not use the unit tests as the sole proof when this skill is invoked. `npm test` remains a fast regression check for pure functions. `drive-convert-upload` compares a GitHub user-attachments tag to `<img src="https://github.com/user-attachments/assets/2346e618-890a-4baf-ab76-b69353fbb68a" alt="Screenshot 2026-10-16 125850" width="50%">`.

## Cleanup

After a successful or failed drive:

```bash
.cursor/skills/verify-imgconverter/helpers/control-imgconverter cleanup
```

Confirm proof files under `$IMGCONVERTER_ARTIFACTS_DIR` still exist after cleanup.

## Helpers

All commands go through:

```bash
.cursor/skills/verify-imgconverter/helpers/control-imgconverter <command>
```

Implementation: `helpers/control-imgconverter.mjs` (Node ESM + Playwright). The bash wrapper adds `xvfb-run` when needed.

Environment:

| Variable | Purpose |
|----------|---------|
| `IMGCONVERTER_RUN_ID` | Isolates `/tmp/imgconverter-verify-*` and `/tmp/imgconverter-ext-*` |
| `IMGCONVERTER_REPO_ROOT` | Unpacked extension source (default: repo root) |
| `IMGCONVERTER_ARTIFACTS_DIR` | Proof output root |
| `IMGCONVERTER_FIXTURE_PORT` | Fixture HTTP server port |

## Maintenance

When routes, manifest, or conversion rules change, run `/maintain-verification-skill` to refresh the feature map and re-prove each feature.
