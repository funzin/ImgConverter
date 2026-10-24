# Convert GitHub upload tags

On a GitHub-style comment box, a pasted GitHub upload is an `<img>` tag with numeric width and height, an alt, and a `src` under `https://github.com/user-attachments/assets/`. The user focuses the textarea and clicks the ImgConverter toolbar icon. That tag becomes the same quoted `<img>` the markdown path writes, with the saved size instead of the upload's pixel size.

## Sub-features

- `upload-default-width`. No selection and empty storage. The tag is `width="50%"` and has no height attribute.
- `upload-keeps-alt`. The alt text is copied. `&amp;` in the alt stays escaped in the result. `spec/js/convert-to-img-tag.test.js` covers that case. This drive uses a plain alt.

## How to get to it (user POV)

- Open a page with a textarea.
- Paste a GitHub upload tag whose attributes are in this order: `width`, `height`, `alt`, `src`, closed by ` />`.
- The `src` is `https://github.com/user-attachments/assets/` plus a hex id.
- Focus the textarea.
- Click the ImgConverter toolbar icon.

## Driving it with Playwright Chromium

Preconditions:

- `control-imgconverter doctor` succeeded for this `IMGCONVERTER_RUN_ID`.
- Fixture server will serve `http://127.0.0.1:$IMGCONVERTER_FIXTURE_PORT/github-comment.html`.

- **Load fixture.** Run `control-imgconverter drive-convert-upload`. Playwright opens the fixture URL.
- **Enter the upload tag.** Fill `#comment` with plain lines around `<img width="640" height="131" alt="Screenshot 2026-10-16 125850" src="https://github.com/user-attachments/assets/2346e618-890a-4baf-ab76-b69353fbb68a" />`.
- **Focus.** Focus `#comment`.
- **Toolbar-equivalent inject.** The helper runs service-worker `chrome.scripting.executeScript` for the bundled file `src/js/convert-to-img-tag.js` in the active tab.
- **Proof.** Read `#comment`. Expect `<img src="https://github.com/user-attachments/assets/2346e618-890a-4baf-ab76-b69353fbb68a" alt="Screenshot 2026-10-16 125850" width="50%">` between the surrounding lines. Artifacts: `textarea-before.txt`, `textarea-after.txt`, `fixture-after.png`, `proof.json` under `$IMGCONVERTER_ARTIFACTS_DIR/convert-github-uploads/`.

## Gotchas

- The matcher requires that attribute order and the ` />` closing. A different `<img>` stays unchanged.
- Selection uses the same splice as markdown. A non-empty selection must contain the whole upload tag. `drive-convert-selection` proves that rule on a markdown token, not on an upload tag.
- Production uses `activeTab`. The verification copy adds localhost `host_permissions`.
