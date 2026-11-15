import { spawnSync } from "node:child_process"
import { createHash } from "node:crypto"
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "..")
const tlaDir = join(root, "spec", "tla")
const specs = ["OptionsForm", "ToolbarClick", "SizeFreeze", "ClickWithoutTab", "SecondClick"]
const jarUrl = "https://github.com/tlaplus/tlaplus/releases/download/v1.7.4/tla2tools.jar"
const jarSha = "936a262061c914694dfd669a543be24573c45d5aa0ff20a8b96b23d01e050e88"

function fail(message) {
  console.error(message)
  process.exit(1)
}

function run(command, args, options) {
  const result = spawnSync(command, args, { encoding: "utf8", ...options })
  if (result.error) fail(`${command} failed to start: ${result.error.message}`)
  return result
}

function sha256(file) {
  return createHash("sha256").update(readFileSync(file)).digest("hex")
}

async function jarPath() {
  const given = process.env.TLA2TOOLS
  if (given) {
    if (!existsSync(given)) fail(`TLA2TOOLS does not exist: ${given}`)
    const hash = sha256(given)
    if (hash !== jarSha) fail(`TLA2TOOLS sha256 is ${hash}, expected ${jarSha}`)
    return given
  }
  const dir = join("/tmp", "imgconverter-tlc-1.7.4")
  const file = join(dir, "tla2tools.jar")
  if (!existsSync(file) || sha256(file) !== jarSha) {
    mkdirSync(dir, { recursive: true })
    const response = await fetch(jarUrl)
    if (!response.ok) fail(`Could not download tla2tools 1.7.4: ${response.status}`)
    writeFileSync(file, Buffer.from(await response.arrayBuffer()))
    if (sha256(file) !== jarSha) fail("Downloaded tla2tools.jar has the wrong sha256")
  }
  return file
}

function summary(output) {
  const lines = output.split("\n")
  const start = lines.findIndex((line) => line.startsWith("Error:") || line.startsWith("Model checking completed"))
  if (start < 0) return output.trim()
  return lines.slice(start).join("\n").trim()
}

const bundle = run("node", ["scripts/bundle.mjs"], { cwd: root })
if (bundle.status !== 0) fail(`bundle failed\n${bundle.stdout}${bundle.stderr}`)

const tests = run(
  "node",
  ["--test", "spec/js/options.test.js", "spec/js/convert-target.test.js"],
  { cwd: root },
)
process.stdout.write(tests.stdout)
process.stderr.write(tests.stderr)
if (tests.status !== 0) fail("The race tests failed. That is the script, not the model.")

const java = process.env.JAVA || "java"
const jar = await jarPath()
let failed = false
for (const name of specs) {
  const result = run(
    java,
    [
      "-XX:+UseParallelGC",
      "-cp",
      jar,
      "tlc2.TLC",
      "-workers",
      "1",
      "-config",
      join(tlaDir, `${name}.cfg`),
      join(tlaDir, `${name}.tla`),
    ],
    { cwd: tlaDir },
  )
  const text = `${result.stdout}${result.stderr}`
  console.log(`\n# ${name}\n${summary(text)}`)
  if (result.status !== 0 || !text.includes("No error has been found.")) {
    failed = true
  }
}
if (failed) fail("TLC found a broken rule. Read the path with /statechart before changing the model or the code.")
console.log("\nPASS")
