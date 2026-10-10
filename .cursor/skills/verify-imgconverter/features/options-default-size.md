# Options default width and height

The user opens the extension options page, sets default `width` and/or `height` strings, saves, and later conversions append those attributes to generated `<img>` tags.

## Sub-features

- `options-save-width` — width only.
- `options-save-height` — height only.
- `options-save-both` — width and height.
- `options-empty-default` — empty save stores blank fields; conversion falls back to `width=50%` when both empty at convert time.

## How to get to it (user POV)

- Right-click the ImgConverter toolbar icon → **Options**, or open the extension options UI from the browser.
- Enter values in the **width** and **height** fields.
- Click **Save**.

## Driving it with Playwright Chromium

Preconditions:

- `control-imgconverter doctor` succeeded (opens `chrome-extension://<id>/src/html/options.html`).

- **Automated:** `control-imgconverter drive-options-width`. On the options URL, fill `#width` with `200px`, click `#save`, convert on the fixture and expect `width=200px`. Then clear both fields, save again, and re-prove default `width=50%`.
- **Artifacts:** `options-after-save.png`, `textarea-after-custom.txt`, `textarea-after-default.txt`, `fixture-after.png`, `proof.json` under `$IMGCONVERTER_ARTIFACTS_DIR/options-default-size/`.
- Karma `spec/js/options-spec.js` and `createParams` tests cover storage wiring with mocks.

## Gotchas

- Options page uses `chrome.storage.sync`; drives must use the extension origin, not the HTTP fixture.
- Empty save persists `{ width: "", height: "" }`; default `width=50%` applies at conversion time when both are empty.
