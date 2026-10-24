# Convert markdown images in textarea

On a GitHub-style comment box, the user focuses a textarea containing markdown image syntax, clicks the ImgConverter toolbar icon, and every matching `![...](https://...)` token becomes an `<img>` tag with default sizing when no options are saved.

## Sub-features

- `convert-all-default-width` — no selection; default `width=50%` when storage is empty.
- `convert-all-custom-width` — after saving width on the options page (see options feature).
- `convert-multi-image` — multiple markdown images in one textarea. `spec/js/convert-to-img-tag.test.js` covers that path. `drive-convert-all` proves a single image.

## How to get to it (user POV)

- Open a page with a textarea or text input (commonly GitHub, esa, Docbase, and similar comment boxes). The extension does not restrict hosts. The click reads a string `.value`, selects the whole control, and inserts the replacement with `insertText`.
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
- **Toolbar-equivalent inject.** The helper runs service-worker `chrome.scripting.executeScript` for the bundled file `src/js/convert-to-img-tag.js` in the active tab. The helper bundles that file before launch. It does not call `chrome.action.onClicked`.
- **Proof.** Read `#comment` value; expect the default tag `<img src="https://user-images.githubusercontent.com/test0.png" alt="title" width="50%">` embedded in the surrounding lines. Attributes are double-quoted. The alt text is `title`. Artifacts: `textarea-before.txt`, `textarea-after.txt`, `fixture-after.png`, `proof.json` under `$IMGCONVERTER_ARTIFACTS_DIR/convert-markdown-images/`.

## Gotchas

- Production uses `activeTab`; the verification copy adds localhost `host_permissions` — do not ship that manifest to the store.
- System Google Chrome may ignore `--load-extension`; the harness uses Playwright's Chromium build.
- Headless system Chrome often loads zero extensions; drives use headed Chromium under `xvfb-run` on Linux.
- The proof tag quotes `src`, `alt`, and `width`. One space separates attributes.
- GitHub upload tags are a separate feature. See [convert-github-uploads](./convert-github-uploads.md).
- A plain textarea does not show the React preview path. See [convert-react-editor](./convert-react-editor.md).
