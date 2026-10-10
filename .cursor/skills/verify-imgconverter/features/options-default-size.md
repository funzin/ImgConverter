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

- **Open options.** Navigate to the options URL from `doctor` output.
- **Set fields.** Fill `#width` / `#height`, click `#save`.
- **Convert on fixture.** Run a convert drive; expect `createParams` attributes in the `<img>` tag.
- **Proof (manual / future `drive-options-width`).** Screenshot options page after save; convert on fixture; capture textarea-after showing matching attributes. Karma `spec/js/options-spec.js` and `createParams` tests cover storage wiring with mocks.

## Gotchas

- Options page uses jQuery and `chrome.storage.sync`; drives must use the extension origin, not the HTTP fixture.
- Empty save persists `{ width: "", height: "" }`; default `width=50%` applies at conversion time when both are empty.
