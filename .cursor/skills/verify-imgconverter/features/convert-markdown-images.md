# Convert markdown images in textarea

On a GitHub-style comment box, the user focuses a textarea containing markdown image syntax, clicks the ImgConverter toolbar icon, and every matching `![...](https://...)` line becomes an `<img>` tag with default sizing when no options are saved.

## Sub-features

- `convert-all-default-width` — no selection; default `width=50%` when storage is empty.
- `convert-all-custom-width` — after saving width on the options page (see options feature).
- `convert-multi-image` — multiple markdown images in one textarea.

## How to get to it (user POV)

- Open an issue, pull request, or comment field on a supported site (GitHub, esa, Docbase, etc.).
- Paste or upload content so the textarea includes `![title](https://...png|jpg|jpeg|gif)`.
- Focus the textarea.
- Click the ImgConverter browser toolbar icon.

## Driving it with Playwright Chromium

Preconditions:

- `control-imgconverter doctor` succeeded for this `IMGCONVERTER_RUN_ID`.
- Fixture server will serve `http://127.0.0.1:$IMGCONVERTER_FIXTURE_PORT/github-comment.html`.

- **Load fixture.** Run `control-imgconverter drive-convert-all`. Playwright opens the fixture URL.
- **Enter markdown.** Fill `#comment` with text that includes `![title](https://user-images.githubusercontent.com/test0.png)` surrounded by plain text lines.
- **Focus.** Focus `#comment` (required for `document.activeElement` in injected scripts).
- **Toolbar-equivalent inject.** The helper runs service-worker `chrome.scripting.executeScript` for `src/js/markdown-image.js` then `src/js/convert-to-img-tag.js`.
- **Proof.** Read `#comment` value; expect default tag ` <img src=https://user-images.githubusercontent.com/test0.png  width=50%> ` embedded in the surrounding lines. Artifacts: `textarea-before.txt`, `textarea-after.txt`, `fixture-after.png`, `proof.json` under `$IMGCONVERTER_ARTIFACTS_DIR/convert-markdown-images/`.

## Gotchas

- Production uses `activeTab`; the verification copy adds localhost `host_permissions` — do not ship that manifest to the store.
- System Google Chrome may ignore `--load-extension`; the harness uses Playwright's Chromium build.
- Headless system Chrome often loads zero extensions; drives use headed Chromium under `xvfb-run` on Linux.
- If `actual` differs only by spacing around `width=`, compare against `createParams` output in `src/js/convert-to-img-tag.js`.
