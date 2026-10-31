import { createRequire } from "node:module"
import { mkdtempSync, writeFileSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

const root = process.cwd()
const require = createRequire(import.meta.url)
const esbuild = require("esbuild")

const URL = "https://example.com/a.png"
const SIZE_ALPHABET = "09px%PX \"<>&'/="
const ALT_ALPHABET = "aA0 \"&$<>%"
const WRAP_ALPHABET = "ab ."

const dir = mkdtempSync(join(tmpdir(), "convert-check-"))
const outfile = join(dir, "convert.cjs")

await esbuild.build({
  absWorkingDir: root,
  entryPoints: ["src/pure/convert.ts"],
  bundle: true,
  format: "cjs",
  platform: "node",
  target: "node22",
  outfile,
  logLevel: "silent",
})

const { convertEditorText } = require(outfile)
rmSync(dir, { recursive: true, force: true })

let cases = 0

function words(alphabet, maxLength) {
  const out = [""]
  let frontier = [""]
  for (let length = 1; length <= maxLength; length += 1) {
    const next = []
    for (const prefix of frontier) {
      for (const char of alphabet) {
        const word = prefix + char
        out.push(word)
        next.push(word)
      }
    }
    frontier = next
  }
  return out
}

function canonicalSize(raw) {
  const text = String(raw).trim()
  const match = /^(\d+)(px|%)?$/i.exec(text)
  if (match == null) return null
  return match[1] + (match[2] ? match[2].toLowerCase() : "")
}

function escapeAttr(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
}

function expectedTag(alt, widthText, heightText, url = URL) {
  const width = canonicalSize(widthText)
  const height = canonicalSize(heightText)
  const size = width == null && height == null
    ? { width: "50%", height: null }
    : { width, height }
  const attrs = [
    `src="${escapeAttr(url)}"`,
    `alt="${escapeAttr(alt)}"`,
  ]
  if (size.width) attrs.push(`width="${size.width}"`)
  if (size.height) attrs.push(`height="${size.height}"`)
  return `<img ${attrs.join(" ")}>`
}

function fail(detail) {
  console.error("FAIL")
  console.error("convertEditorText did not replace the planted image in place.")
  for (const [key, value] of Object.entries(detail)) {
    console.error(`${key}: ${JSON.stringify(value)}`)
  }
  process.exit(1)
}

function check(text, storage, bounds, expected) {
  cases += 1
  const actual = convertEditorText(text, storage, bounds)
  if (actual !== expected) {
    fail({ text, storage, bounds, expected, actual })
  }
}

function checkComment(prefix, alt, suffix, storage, boundsMode) {
  const token = `![${alt}](${URL})`
  const text = prefix + token + suffix
  const tag = expectedTag(alt, storage.width, storage.height)
  const replaced = prefix + tag + suffix
  const tokenStart = prefix.length
  const tokenEnd = tokenStart + token.length
  if (boundsMode === "all") {
    check(text, storage, null, replaced)
    return
  }
  if (boundsMode === "empty-selection") {
    check(text, storage, { start: 0, end: 0 }, replaced)
    return
  }
  if (boundsMode === "token") {
    check(text, storage, { start: tokenStart, end: tokenEnd }, replaced)
    return
  }
  if (prefix.length === 0) return
  check(text, storage, { start: 0, end: prefix.length }, null)
}

const sizeWords = words(SIZE_ALPHABET, 4)
const partners = ["", "200px", "nope"]
for (const width of sizeWords) {
  for (const height of partners) {
    checkComment("Before ", "title", " After", { width, height }, "all")
  }
}
for (const height of sizeWords) {
  for (const width of ["200px", "nope"]) {
    checkComment("Before ", "title", " After", { width, height }, "all")
  }
}

const shortSizes = words(SIZE_ALPHABET, 2)
for (const width of shortSizes) {
  for (const height of shortSizes) {
    checkComment("Before ", "title", " After", { width, height }, "all")
  }
}

const alts = words(ALT_ALPHABET, 2)
const wraps = words(WRAP_ALPHABET, 2)
const storages = [{ width: "", height: "" }, { width: "200px", height: "" }, { width: "nope", height: "10%" }]
for (const alt of alts) {
  for (const prefix of wraps) {
    for (const suffix of wraps) {
      for (const storage of storages) {
        checkComment(prefix, alt, suffix, storage, "all")
        checkComment(prefix, alt, suffix, storage, "token")
        checkComment(prefix, alt, suffix, storage, "outside")
      }
    }
  }
  const token = `![${alt}](${URL})`
  const tag = expectedTag(alt, "", "")
  check(token + token, { width: "", height: "" }, null, tag + tag)
  checkComment("Before ", alt, " After", { width: "", height: "" }, "empty-selection")
}

const later = "![b](https://evil.test/y.png)"
const earlierUrl = "https://example.com/x" + later
const earlierText = `![a](${earlierUrl}) ${later}`
check(
  earlierText,
  { width: "", height: "" },
  null,
  `${expectedTag("a", "", "", earlierUrl)} ${expectedTag("b", "", "", "https://evil.test/y.png")}`,
)

console.log("PASS")
console.log(`cases: ${cases}`)
console.log("property: convertEditorText replaces each planted markdown image in place and writes only a canonical size.")
