# Convert only selected markdown

When the user selects a substring that contains markdown image syntax, only that selection is replaced; the rest of the textarea stays unchanged.

## Sub-features

- `selection-replace` — selection spans the markdown image token.
- `selection-no-op` — selection excludes markdown image text (expect no change). Note: an empty selection (`start === end`) takes the convert-all branch and rewrites the whole field.

## How to get to it (user POV)

- Focus a textarea on a supported site with markdown image text in the body.
- Select the markdown image line or a portion that still matches the converter regex.
- Click the ImgConverter toolbar icon.

## Driving it with Playwright Chromium

Preconditions:

- Same as [convert-markdown-images](./convert-markdown-images.md).

- **Automated:** `control-imgconverter drive-convert-selection`. Fills fixture `#comment`, sets `selectionStart` / `selectionEnd` to the markdown token, then injects. Also proves a no-op with a non-empty selection over plain text only.
- **Artifacts:** `textarea-before.txt`, `textarea-after.txt`, `textarea-noop-after.txt`, `fixture-after.png`, `proof.json` under `$IMGCONVERTER_ARTIFACTS_DIR/convert-selection-only/`.
- Logic is also covered by Karma `spec/js/convert-to-img-tag-spec.js` (`convertOnlySelectionToImgTag`).

## Gotchas

- Selection must overlap valid markdown image syntax or the injected script returns without changing the field.
- “No selection” (`start === end`) is full convert-all, not selection conversion. Prove `selection-no-op` with a **non-empty** selection that contains no markdown image match.
