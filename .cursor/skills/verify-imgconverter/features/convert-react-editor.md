# Convert a React-controlled textarea

Some comment boxes keep the textarea value in React state. A direct write to `.value` skips the input handler, and the next preview puts the markdown back. ImgConverter selects the whole control and inserts the replacement with `insertText`, so preview still shows the `<img>` tag.

## Sub-features

- `react-preview-keeps-tag`. After the click, clicking Preview leaves `width="50%"` in the textarea.

## How to get to it (user POV)

- Open a page whose textarea is a React controlled input.
- Put a markdown image in that textarea.
- Focus the textarea.
- Click the ImgConverter toolbar icon.
- Click Preview. The img tag is still the textarea value.

## Driving it with Playwright Chromium

Preconditions:

- `control-imgconverter doctor` succeeded for this `IMGCONVERTER_RUN_ID`.
- `npm ci` has installed `react` and `react-dom` at the repo root. The drive loads the UMD builds with `addScriptTag`. Those files are not inside the extension copy.

- **Automated:** `control-imgconverter drive-convert-react`. The helper opens the fixture, renders a controlled `#react-comment`, focuses it, and injects `src/js/convert-to-img-tag.js` through the service worker. It then clicks `#react-preview`.
- **Proof.** Both the value just after injection and the value after preview equal `<img src="https://user-images.githubusercontent.com/test.png" alt="title" width="50%">`. Artifacts: `textarea-before.txt`, `textarea-after-inject.txt`, `textarea-after-preview.txt`, `fixture-after.png`, `proof.json` under `$IMGCONVERTER_ARTIFACTS_DIR/convert-react-editor/`.

## Gotchas

- `spec/browser/react-editor.spec.js` loads the converter with `addScriptTag` in the page world. This drive injects the extension file from the service worker instead. Submit and undo stay on that product test.
- The fixture page still has `#comment`. The drive focuses `#react-comment` before the inject.
