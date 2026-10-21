import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import * as esbuild from 'esbuild'
import ts from 'typescript'

const entryNames = ['background.js', 'options.js', 'convert-to-img-tag.js']

await esbuild.build({
  entryPoints: entryNames.map((name) => path.join('src/js', name.replace(/\.js$/, '.ts'))),
  bundle: true,
  format: 'iife',
  target: 'es2022',
  platform: 'browser',
  splitting: false,
  minify: false,
  sourcemap: false,
  outdir: 'src/js',
  outbase: 'src/js',
  legalComments: 'none',
  logLevel: 'warning',
})

assertEntrySet()
for (const name of entryNames) {
  assertClassicIife(path.join('src/js', name))
}
assertPublishedStrings()
assertSeparatedBundles()
assertConverterEvaluatesTwice()

function fail(message) {
  console.error(message)
  process.exit(1)
}

function assertEntrySet() {
  const found = listJs('src/js')
  const allowed = new Set(entryNames.map((name) => path.join('src/js', name)))
  for (const file of found) {
    if (!allowed.has(file)) fail(`${file} is not one of the three extension scripts`)
  }
  for (const file of allowed) {
    if (!found.includes(file)) fail(`${file} was not emitted`)
  }
}

function listJs(dir) {
  const found = []
  for (const child of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, child.name)
    if (child.isDirectory()) found.push(...listJs(full))
    else if (child.name.endsWith('.js')) found.push(full)
  }
  return found
}

function assertClassicIife(file) {
  const text = readFileSync(file, 'utf8')
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.ES2022, true, ts.ScriptKind.JS)
  const body = source.statements
  let index = 0
  if (body.length > 0 && isUseStrict(body[0])) index = 1
  if (body.length !== index + 1) {
    fail(`${file} has ${body.length} top-level statements`)
  }
  const statement = body[index]
  if (statement == null || !ts.isExpressionStatement(statement) || !isArrowIifeCall(statement.expression)) {
    fail(`${file} must call one arrow IIFE`)
  }
}

function isUseStrict(statement) {
  return ts.isExpressionStatement(statement)
    && ts.isStringLiteral(statement.expression)
    && statement.expression.text === 'use strict'
}

function isArrowIifeCall(expression) {
  if (!ts.isCallExpression(expression) || expression.arguments.length !== 0) return false
  const callee = ts.isParenthesizedExpression(expression.expression)
    ? expression.expression.expression
    : expression.expression
  return ts.isArrowFunction(callee)
}

function assertPublishedStrings() {
  const options = readFileSync('src/js/options.js', 'utf8')
  const convert = readFileSync('src/js/convert-to-img-tag.js', 'utf8')
  if (!options.includes('globalThis.setText')) fail('options.js is missing globalThis.setText')
  if (!options.includes('Nothing was saved')) fail('options.js is missing Nothing was saved')
  if (!convert.includes('insertText')) fail('convert-to-img-tag.js is missing insertText')
  if (!convert.includes('user-attachments')) fail('convert-to-img-tag.js is missing user-attachments')
}

function assertSeparatedBundles() {
  const options = readFileSync('src/js/options.js', 'utf8')
  const convert = readFileSync('src/js/convert-to-img-tag.js', 'utf8')
  if (options.includes('user-attachments') || options.includes('50%')) {
    fail('options.js contains click-only text')
  }
  if (convert.includes('Nothing was saved') || convert.includes('statusTimer')) {
    fail('convert-to-img-tag.js contains options-only text')
  }
}

function assertConverterEvaluatesTwice() {
  const code = readFileSync('src/js/convert-to-img-tag.js', 'utf8')
  const context = vm.createContext({
    chrome: {
      storage: {
        sync: {
          get(callback) {
            callback({})
          },
        },
      },
    },
    document: {
      activeElement: null,
    },
  })
  const filename = 'src/js/convert-to-img-tag.js'
  vm.runInContext(code, context, { filename })
  vm.runInContext(code, context, { filename })
  if (typeof context.convertToImgTag !== 'function') {
    fail('convertToImgTag is not a function after two evaluations')
  }
}
