# Convert only selected markdown

When the user selects a substring that contains a complete markdown image match, only that selection is replaced; the rest of the textarea stays unchanged.

## Sub-features

- `selection-replace` — selection contains at least one full markdown image match (may be exactly the token or wider and still include it).
- `selection-no-op` — non-empty selection with no complete match (plain text, or a truncated token) → no change. Note: an empty selection (`start === end`) takes the convert-all branch and rewrites the whole field.

## How to get to it (user POV)

- Focus a textarea on a page with markdown image text in the body.
- Select a range that includes a complete `![...](https://...)` match (not merely overlapping a fragment).
- Click the ImgConverter toolbar icon.

## Driving it with Playwright Chromium

Preconditions:

- Same as [convert-markdown-images](./convert-markdown-images.md).

- **Automated:** `control-imgconverter drive-convert-selection`. Fills fixture `#comment`, sets `selectionStart` / `selectionEnd` to the markdown token, then injects. Also proves a no-op with a non-empty selection over plain text only.
- **Artifacts:** `textarea-before.txt`, `textarea-after.txt` (selection-replace result), `textarea-noop-after.txt`, `fixture-after.png` (captured after the no-op leg, so the screenshot still shows markdown), `proof.json` under `$IMGCONVERTER_ARTIFACTS_DIR/convert-selection-only/`.
- Logic is also covered by Karma `spec/js/convert-to-img-tag-spec.js` (`convertOnlySelectionToImgTag` ranges that contain the token). Collapsed-caret → convert-all is exercised by `drive-convert-all`, not this drive.

## Gotchas

- The selected substring must itself contain a full regex match, or the injected script returns without changing the field. Overlap that truncates the token is a no-op.
- “No selection” (`start === end`) is full convert-all, not selection conversion. Prove `selection-no-op` with a **non-empty** selection that contains no markdown image match.
