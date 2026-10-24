# Options default width and height

The user opens the extension options page, sets default `width` and/or `height` strings, saves, and later conversions append those attributes to generated `<img>` tags.

## Sub-features

- `options-save-width` — width only.
- `options-save-height` — height only (no default width added).
- `options-save-both` — width and height.
- `options-empty-default` — empty save stores blank fields; conversion falls back to `width=50%` when both empty at convert time.

## How to get to it (user POV)

- Right-click the ImgConverter toolbar icon → **Options**, or open the extension options UI from the browser.
- Enter values in the **width** and **height** fields.
- Click **Save**.

## Driving it with Playwright Chromium

Preconditions:

- `control-imgconverter doctor` succeeded (opens `chrome-extension://<id>/src/html/options.html`).

- **Automated:** `control-imgconverter drive-options-width`. On the options URL, fill `#width` with `200px`, clear `#height`, click `#save`, convert on the fixture and expect `width="200px"`. Then clear both fields, save again, and re-prove default `width="50%"`. Height-only and both-set stay on unit tests. `createParams` lives in `src/pure/css-size.ts`. `spec/js/convert-to-img-tag.test.js` covers the attribute strings. `spec/js/options.test.js` covers save and load.
- **Artifacts:** `options-after-save.png`, `textarea-before.txt`, `textarea-after-custom.txt`, `textarea-after-default.txt`, `fixture-after.png`, `proof.json` under `$IMGCONVERTER_ARTIFACTS_DIR/options-default-size/`.
- `spec/js/options.test.js` covers options save and load with the storage mock. `createParams` cases in `spec/js/convert-to-img-tag.test.js` cover attribute strings with in-memory objects, not `chrome.storage`. The test runner is `node --test` from `package.json`.

## Gotchas

- Options page uses `chrome.storage.sync`; drives must use the extension origin, not the HTTP fixture.
- Empty save persists `{ width: "", height: "" }`; default `width=50%` applies at conversion time when both are empty.
- Height-only saves produce a quoted `height` and no default `width`.
- A value other than digits with an optional `px` or `%` suffix blocks the whole save. The typed text stays. The status line says nothing was saved. The previous stored record stays.
