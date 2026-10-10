# Convert markdown images in textarea

On a GitHub-style comment box, the user focuses a textarea containing markdown image syntax, clicks the ImgConverter toolbar icon, and every matching `![...](https://...)` token becomes an `<img>` tag with default sizing when no options are saved.

## Sub-features

- `convert-all-default-width` — no selection; default `width=50%` when storage is empty.
- `convert-all-custom-width` — after saving width on the options page (see options feature).
- `convert-multi-image` — multiple markdown images in one textarea (same `matchAll` path; unit-tested; `drive-convert-all` proves a single image).

## How to get to it (user POV)

- Open a page with a focusable text field (commonly GitHub, esa, Docbase, and similar comment boxes). The extension does not restrict hosts; it converts whatever focused element exposes a string `.value`.
- Paste or type content that includes `![title](https://...)` markdown image tokens (`https:` URLs only; the matcher does not require a particular file extension).
- Focus the textarea.
- Click the ImgConverter browser toolbar icon.

## Driving it with Playwright Chromium

Preconditions:

- `control-imgconverter doctor` succeeded for this `IMGCONVERTER_RUN_ID`.
- Fixture server will serve `http://127.0.0.1:$IMGCONVERTER_FIXTURE_PORT/github-comment.html`.

- **Load fixture.** Run `control-imgconverter drive-convert-all`. Playwright opens the fixture URL.
- **Enter markdown.** Fill `#comment` with text that includes `![title](https://user-images.githubusercontent.com/test0.png)` surrounded by plain text lines.
- **Focus.** Focus `#comment` (required for `document.activeElement` in injected scripts).
- **Toolbar-equivalent inject.** The helper runs service-worker `chrome.scripting.executeScript` for `src/js/convert-to-img-tag.js`.
- **Proof.** Read `#comment` value; expect the default tag `<img src=https://user-images.githubusercontent.com/test0.png width=50%>` embedded in the surrounding lines (no padding spaces around the tag; one space before `width` comes from `createParams`). Artifacts: `textarea-before.txt`, `textarea-after.txt`, `fixture-after.png`, `proof.json` under `$IMGCONVERTER_ARTIFACTS_DIR/convert-markdown-images/`.

## Gotchas

- Production uses `activeTab`; the verification copy adds localhost `host_permissions` — do not ship that manifest to the store.
- System Google Chrome may ignore `--load-extension`; the harness uses Playwright's Chromium build.
- Headless system Chrome often loads zero extensions; drives use headed Chromium under `xvfb-run` on Linux.
- The proof tag has one space before `width`. `createParams` already starts with that space. The template must not add another.
