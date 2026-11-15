---
name: verify-imgconverter-flow
description: "Check ImgConverter's options save/load order and toolbar click with TLC and the race tests. Use when editing src/js/options.ts, src/js/convert-to-img-tag.ts, src/js/background.ts, or spec/tla."
paths:
  - src/js/options.ts
  - src/js/convert-to-img-tag.ts
  - src/js/background.ts
  - spec/tla
---

# Verify the options form and the toolbar click

A saved width and height is what every later image tag uses. A click that follows the wrong field converts text the user was not editing. The unit tests call `chrome.storage.sync.get` synchronously, so they never see a load that returns after Save, or a focus change during that read. This check explores those orders.

The models are the ones in `docs/statecharts.md`. TypeScript has no model checker that runs on this code. The question is which orders of the storage callback, Save, and focus are possible, so the check is TLC on a model of those steps, plus the race tests that drive the real scripts.

## Run

From the repo root, after `npm ci`:

```bash
node .cursor/skills/verify-imgconverter-flow/scripts/check.mjs
```

`PASS` and exit 0 means the race tests passed and TLC printed `No error has been found` for `OptionsForm`, `ToolbarClick`, `SizeFreeze`, `ClickWithoutTab`, and `SecondClick`. The script prints each spec's state count. Java 11 or later must be on `PATH`. Set `JAVA` to another binary. The first run downloads tla2tools 1.7.4 (sha256 `936a262061c914694dfd669a543be24573c45d5aa0ff20a8b96b23d01e050e88`) into `/tmp/imgconverter-tlc-1.7.4`. Set `TLA2TOOLS` to that jar to skip the download.

Read a TLC failure with `/statechart`. It gives the shortest path in plain words. Do not copy `/statechart`'s commands into this skill or into `check.mjs`.

## What a pass means

Each sentence is one rule in `spec/tla`. A pass covers that model, not the whole extension.

- After Save, the fields keep that size until you type again. A load that was already in flight does not paint the old size over them, and it does not replace a draft.
- Save does not store the blank fields while the first load is still in flight. Clearing the fields after the load has arrived, then clicking Save, still stores the empty pair.
- A save never stores a rejected size. The Saved message means a write happened. A rejected Save leaves the typed text.
- When the form is idle and you are not editing, the fields show the canonical stored size.
- The toolbar callback does not skip a picture on the element that was focused when the script started, even if focus has moved. It reads that element's value and selection in one step.
- The size on the converted tag is the size frozen when the browser finished the get, not a save that lands after that.
- `executeScript` runs only for a click that saw a tab id.
- Two overlapping clicks convert the picture once. The second callback does not write again.
- None of these models has a state with no step out of it.

## Read a failure

A failing race test is the real script. The test name is the broken promise. Report the input and the field values. Do not weaken the test to make it pass, and do not change product code unless the user asks.

A TLC failure is a path through `spec/tla`. Read it with `/statechart`. If a step is not one of the actions in that spec, the model is wrong. Fix the model. If the race tests show the same path in `src/js`, it is a bug in the script. Do not delete the rule to make TLC pass.

These paths fail on purpose when the code is broken, and they were bugs before the fix recorded at the sync commit:

- Remove the epoch and draft checks in `loadStorage`, and the load that started at page open paints the old size over a Save. The test is "does not paint an older size over a save". TLC's `ShownSave` fails on the same path: open, type a size, save, then the original load returns.
- Let Save run while `loadsInFlight` is still positive and the user has not typed. The test is "does not clear storage when Save is clicked before the load returns". TLC's `SaveWaitsForTheLoad` fails.
- Read `document.activeElement` inside the storage callback again. The test is "converts the element that was focused when the script started". TLC's `NeverSkipTheCapturedPicture` fails: click, the read finishes, focus moves, the callback skips the captured field.

`FrozenSize` fails if the callback uses a save that arrived after the browser finished the get, instead of the object passed to the callback. The test "uses the size passed to the storage callback" locks that object.

## Coverage

Checked code:

- `loadStorage`, `saveSize`, the `input` listener, and `showStatus` in `src/js/options.ts`
- the element capture and the `chrome.storage.sync.get` callback in `src/js/convert-to-img-tag.ts`
- the `tab.id` guard and `executeScript` call in `src/js/background.ts`

The sync commit is `SYNC_COMMIT`.

The last confirmed run on that commit printed `PASS` for the five specs: OptionsForm 197 states, ToolbarClick 144, SizeFreeze 60, ClickWithoutTab 6, SecondClick 6.

If any file listed above changes after the sync commit, read the new functions before trusting a pass. The model has to describe those functions, not an older shape of them. Move the sync commit forward only after that reading and a run on the new commit are recorded here.

`/maintain-formal-verification-skill` is how to bring this check back in line when the code moved and nobody re-ran it.

## Left out

The markdown and GitHub upload matchers in `src/pure/convert.ts` are checked by `verify-convert-replacement`, not here. A legacy stored string that is not a canonical size, `insertText` returning false, a rejected `executeScript`, an iframe, and a contenteditable field are not in these models. `docs/statecharts.md` says what each model leaves out.
