# Convert only selected markdown

When the user selects a substring that contains markdown image syntax, only that selection is replaced; the rest of the textarea stays unchanged.

## Sub-features

- `selection-replace` — selection spans the markdown image token.
- `selection-no-op` — selection excludes markdown image text (expect no change).

## How to get to it (user POV)

- Focus a textarea on a supported site with markdown image text in the body.
- Select the markdown image line or a portion that still matches the converter regex.
- Click the ImgConverter toolbar icon.

## Driving it with Playwright Chromium

Preconditions:

- Same as [convert-markdown-images](./convert-markdown-images.md).

- **Not yet automated in `control-imgconverter`.** Prove via Karma specs in `spec/js/convert-to-img-tag-spec.js` (`convertOnlySelectionToImgTag`) for logic, or extend the helper with `drive-convert-selection` that sets `selectionStart` / `selectionEnd` on `#comment` before inject.
- **Manual proof:** use the fixture page in a headed Chromium session, select text, trigger inject, capture before/after textarea values.

## Gotchas

- Selection must overlap valid markdown image syntax or the injected script returns without changing the field.
- Karma covers selection math; full extension inject path should mirror `drive-convert-all` once automated.
