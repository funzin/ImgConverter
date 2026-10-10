# ImgConverter verification map

Maintained source for verifying user-facing extension behavior. Read this index before driving; use the matching feature file as the recipe.

## Baseline preconditions

- Repo dependencies installed (`npm ci` at repo root for unit tests; `npm install --prefix .cursor/skills/verify-imgconverter/helpers` for drives).
- Playwright Chromium installed: `npx --prefix .cursor/skills/verify-imgconverter/helpers playwright install chromium`.
- Set `IMGCONVERTER_RUN_ID` to a unique value per verification run.
- Set `IMGCONVERTER_ARTIFACTS_DIR` (default `/opt/cursor/artifacts/imgconverter-verify`).
- Run `control-imgconverter doctor` and require `"ok": true`.
- Never drive a Chrome profile or patched extension tree you did not create in this run.

## Driving conventions

- Use the wrapper `helpers/control-imgconverter` so Linux CI gets `xvfb-run` when `DISPLAY` is unset.
- Start from the GitHub-style fixture unless a feature file says otherwise.
- Prefer stable DOM ids (`#comment`, `#width`, `#height`, `#save`) over layout selectors.
- Restore disposable state via `cleanup`; do not delete proof artifacts during cleanup.

## Proof and skip reporting

- Capture markdown input and textarea value after conversion, not only a screenshot.
- Record `feature` id and fixture URL in `proof.json`.
- If a feature entry point is unreachable, report the command and unmet precondition; do not claim another entry point covers it.

## Feature entry contract

Each feature file uses H1 plus four H2 sections: `Sub-features`, `How to get to it (user POV)`, `Driving it with Playwright Chromium`, `Gotchas`.

## Features

- [Convert markdown images in textarea](./convert-markdown-images.md) — full-text conversion with default width on the fixture page.
- [Convert only selected markdown](./convert-selection-only.md) — selection-scoped replacement (manual / future harness).
- [Options default width and height](./options-default-size.md) — options page storage (manual / future harness).
