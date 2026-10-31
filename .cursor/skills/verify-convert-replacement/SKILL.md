---
name: verify-convert-replacement
description: "Check that convertEditorText replaces a planted markdown image in place and writes only a canonical size. Use when editing src/pure/convert.ts or src/pure/css-size.ts, or when a converted comment looks wrong."
paths:
  - src/pure/convert.ts
  - src/pure/css-size.ts
---

# Verify in-place image replacement

`convertEditorText` replaces each planted `![alt](https://example.com/a.png)` token with one `<img>` tag and leaves every other character as it was. A break publishes a comment that is not the comment the user wrote, or a size attribute that is not a number with an optional `px` or `%`.

## Run

From the repo root, after `npm ci`:

```bash
node .cursor/skills/verify-convert-replacement/scripts/check.mjs
```

`PASS` and exit 0 means every case in the bounds below matched. `FAIL` and exit 1 prints the first mismatch. Read that record before editing anything.

The script bundles `src/pure/convert.ts` with the repo's esbuild and calls `convertEditorText`. It does not reimplement conversion. No package is added. TypeScript has no verifier that runs on this code, and the question is the output of the real function on a bounded set of strings, so the check generates those strings and compares them to the property.

## Bounds

The pass covers this set only.

- The image token is `![` + alt + `](https://example.com/a.png)`. Alt is every string of length 0, 1, or 2 from `aA0 "&$<>%`. That alphabet has no `]` and no `(`.
- Prefix and suffix are every string of length 0, 1, or 2 from `ab .`. That alphabet has no `!`.
- Storage `width` and `height` are strings. The size sweep uses every string of length 0 to 4 from `09px%PX "<>&'/=`, with the other field fixed to `""`, `200px`, or `nope`, plus every pair of length 0 to 2.
- Comment sweep storage is `{ width: "", height: "" }`, `{ width: "200px", height: "" }`, or `{ width: "nope", height: "10%" }`.
- `bounds` is null, `{ start: 0, end: 0 }`, the token's own range, or the prefix range when the prefix is not empty.
- One extra text is the token twice, with empty storage and null bounds.
- One extra text is `![a](https://example.com/x![b](https://evil.test/y.png)) ![b](https://evil.test/y.png)`, with empty storage and null bounds. The earlier `src` keeps the later markdown text, and the later token is replaced at its own position.

A canonical size is `^(\d+)(px|%)?$` after trim, with the unit in lowercase. A blank or rejected width and a blank or rejected height become `width="50%"`. One accepted side is kept and the other is omitted. `src` and `alt` escape `&`, `"`, `<`, and `>` in that order.

`{ start: 0, end: 0 }` converts the whole text. That is the empty selection in `convertEditorText`. An intended change to that rule updates this checker, then the sync commit below.

## Read a failure

A mismatch inside the bounds is a bug in `convertEditorText`, `createParams`, or `parseCssSize`. Report the printed text, storage, bounds, expected string, and actual string. Do not weaken the checker to make it pass, and do not change product code unless the user asks for a fix.

A mismatch outside the bounds is a modeling error. That includes an alt that contains `]` or `(`, a prefix or suffix that contains `!`, a non-string storage value, or a text that is not the planted token. Fix the checker.

This check has failed on scratch edits that are not in the tree. `parseCssSize` was changed so any trimmed non-empty string counted as a size. The first failure was text `Before ![title](https://example.com/a.png) After`, storage width `""` and height `"nope"`, bounds null. The expected tag had `width="50%"`. The actual tag had `height="nope"`.

`convertToImgTag` was also changed back to `String.replace` of the matched text. The first failure was the text whose earlier URL contains `![b](https://evil.test/y.png)`. The actual string rewrote that URL and left the later markdown in place. The 763074 cases from the older bounds still passed on that edit. Restoring the index splice made the check pass again.

## Coverage

Checked functions are `convertEditorText`, `convertToImgTag`, `convertOnlySelectionToImgTag`, `imageTag`, and `escapeAttr` in `src/pure/convert.ts`, and `createParams` and `parseCssSize` in `src/pure/css-size.ts`.

The sync commit is `25f8cf5625237c50bcc98c68736ad41c9d02d4c1`.

The last confirmed run on that commit printed `PASS`, 763075 cases, in 1702 ms. The previous sync commit `85596c7186c294bd04dc02801563ad4a4b98a932` passed 763074 cases and did not plant a URL that contains a later markdown image, so that pass did not describe this splice.

If `src/pure/convert.ts` or `src/pure/css-size.ts` changes after the sync commit, read the new functions before trusting a pass. Move the sync commit forward only after the checker still describes those functions and a run on the new commit has been recorded here.

## Left out

GitHub `user-attachments` tags, `decideSave`, and the toolbar click are not in this check. The upload-tag path is the closest next check, because this script never plants those tags.
