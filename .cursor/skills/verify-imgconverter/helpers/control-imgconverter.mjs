#!/usr/bin/env node
/**
 * Drive ImgConverter for verification: launch Chrome with the unpacked extension,
 * doctor checks, feature drives, and cleanup.
 */
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { cp, mkdir, writeFile, rm } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILL_ROOT = resolve(__dirname, '..');
const REPO_ROOT = resolve(SKILL_ROOT, '../../..');
const FIXTURE_DIR = join(SKILL_ROOT, 'fixtures');
const DEFAULT_PORT = 8765;

function env(name, fallback) {
  return process.env[name] ?? fallback;
}

function runId() {
  return env('IMGCONVERTER_RUN_ID', `run-${Date.now()}`);
}

function artifactsDir() {
  return resolve(env('IMGCONVERTER_ARTIFACTS_DIR', '/opt/cursor/artifacts/imgconverter-verify'));
}

function userDataDir(id) {
  return resolve(env('IMGCONVERTER_USER_DATA_DIR', `/tmp/imgconverter-verify-${id}`));
}

function sourceExtensionPath() {
  return resolve(env('IMGCONVERTER_REPO_ROOT', REPO_ROOT));
}

async function verificationExtensionPath(id) {
  const cached = env('IMGCONVERTER_VERIFY_EXT_PATH', '');
  if (cached) return cached;
  const dest = resolve(env('IMGCONVERTER_VERIFY_EXT_DIR', `/tmp/imgconverter-ext-${id}`));
  await rm(dest, { recursive: true, force: true });
  await cp(sourceExtensionPath(), dest, { recursive: true });
  const manifestPath = join(dest, 'manifest.json');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const hostPerm = `http://127.0.0.1:${env('IMGCONVERTER_FIXTURE_PORT', DEFAULT_PORT)}/*`;
  // MV3 host access belongs in host_permissions (production uses activeTab after a real click).
  manifest.host_permissions = Array.from(
    new Set([...(manifest.host_permissions ?? []), hostPerm]),
  );
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  return dest;
}

function statePath(id) {
  return join(userDataDir(id), 'verify-state.json');
}

async function writeState(id, patch) {
  const path = statePath(id);
  let state = {};
  try {
    state = JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    /* fresh */
  }
  Object.assign(state, patch);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, JSON.stringify(state, null, 2));
}

async function readState(id) {
  try {
    return JSON.parse(readFileSync(statePath(id), 'utf8'));
  } catch {
    return null;
  }
}

function startFixtureServer(port) {
  const html = readFileSync(join(FIXTURE_DIR, 'github-comment.html'), 'utf8');
  const server = createServer((req, res) => {
    if (req.url === '/' || req.url?.startsWith('/github-comment')) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
      return;
    }
    res.writeHead(404);
    res.end('not found');
  });
  return new Promise((resolvePromise, reject) => {
    server.listen(port, '127.0.0.1', () => resolvePromise(server));
    server.on('error', reject);
  });
}

async function launchContext(id, port) {
  const ext = await verificationExtensionPath(id);
  const profile = userDataDir(id);
  await mkdir(profile, { recursive: true });
  // Playwright's bundled Chromium still loads unpacked extensions via CLI flags;
  // system Google Chrome often ignores --load-extension. Use a virtual display on Linux CI.
  const context = await chromium.launchPersistentContext(profile, {
    headless: false,
    args: [
      `--disable-extensions-except=${ext}`,
      `--load-extension=${ext}`,
      '--no-first-run',
      '--no-default-browser-check',
      '--enable-unsafe-extension-debugging',
    ],
  });
  return context;
}

async function resolveExtensionId(context) {
  for (let i = 0; i < 40; i++) {
    const workers = context.serviceWorkers();
    if (workers.length) {
      const url = workers[0].url();
      const match = url.match(/^chrome-extension:\/\/([^/]+)\//);
      if (match) return match[1];
    }
    const bgPages = context.backgroundPages();
    if (bgPages.length) {
      const match = bgPages[0].url().match(/^chrome-extension:\/\/([^/]+)\//);
      if (match) return match[1];
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error('Could not resolve ImgConverter extension id (no service worker or background page)');
}

async function triggerBrowserAction(context, extensionId) {
  const bgCandidates = context.serviceWorkers().concat(context.backgroundPages());
  if (!bgCandidates.length) {
    throw new Error('No extension background target to dispatch browser action');
  }
  const bg = bgCandidates[0];
  // Match production MV3 path in src/js/background.js (chrome.scripting.executeScript).
  await bg.evaluate(async () => {
    const tabs = await new Promise((resolveTabs) => {
      chrome.tabs.query({ active: true, currentWindow: true }, resolveTabs);
    });
    const tab = tabs[0];
    if (!tab?.id) throw new Error('No active tab for browser action');

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['src/js/convert-to-img-tag.js'],
    });
  });
}

async function cmdLaunch() {
  const id = runId();
  const port = Number(env('IMGCONVERTER_FIXTURE_PORT', DEFAULT_PORT));
  const server = await startFixtureServer(port);
  const context = await launchContext(id, port);
  const extensionId = await resolveExtensionId(context);
  const fixtureUrl = `http://127.0.0.1:${port}/github-comment.html`;

  await writeState(id, {
    runId: id,
    extensionId,
    fixtureUrl,
    fixturePort: port,
    userDataDir: userDataDir(id),
    extensionPath: await verificationExtensionPath(id),
    sourceExtensionPath: sourceExtensionPath(),
    pid: process.pid,
  });

  console.log(JSON.stringify({ ok: true, runId: id, extensionId, fixtureUrl, userDataDir: userDataDir(id) }, null, 2));
  console.error(`Launch complete. Call doctor/drive with IMGCONVERTER_RUN_ID=${id}. Keep this process alive or run drive in same shell session before cleanup.`);

  const shutdown = async () => {
    await context.close();
    server.close();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  // Hold server + browser for interactive drives; one-shot drives call launch inline.
  if (process.argv.includes('--detach')) {
    const child = spawn(process.execPath, [fileURLToPath(import.meta.url), 'hold'], {
      detached: true,
      stdio: 'ignore',
      env: { ...process.env, IMGCONVERTER_RUN_ID: id, IMGCONVERTER_FIXTURE_PORT: String(port) },
    });
    child.unref();
    await context.close();
    server.close();
    return;
  }
}

async function cmdHold() {
  const id = runId();
  const port = Number(env('IMGCONVERTER_FIXTURE_PORT', DEFAULT_PORT));
  const server = await startFixtureServer(port);
  const context = await launchContext(id, port);
  await new Promise(() => {});
  await context.close();
  server.close();
}

async function withSession(fn) {
  const id = runId();
  const port = Number(env('IMGCONVERTER_FIXTURE_PORT', DEFAULT_PORT));
  const server = await startFixtureServer(port);
  const context = await launchContext(id, port);
  try {
    const extensionId = await resolveExtensionId(context);
    await writeState(id, {
      runId: id,
      extensionId,
      fixtureUrl: `http://127.0.0.1:${port}/github-comment.html`,
      userDataDir: userDataDir(id),
      extensionPath: await verificationExtensionPath(id),
      sourceExtensionPath: sourceExtensionPath(),
    });
    return await fn({ id, context, extensionId, port, server });
  } finally {
    await context.close();
    server.close();
  }
}

async function cmdDoctor() {
  await withSession(async ({ id, context, extensionId }) => {
    const manifest = JSON.parse(readFileSync(join(sourceExtensionPath(), 'manifest.json'), 'utf8'));
    const page = context.pages()[0] ?? (await context.newPage());
    await page.goto(`chrome-extension://${extensionId}/src/html/options.html`, { waitUntil: 'domcontentloaded' });

    const ok =
      manifest.name === 'ImgConverter' &&
      manifest.manifest_version === 3 &&
      (await page.locator('#save').count()) === 1;

    const out = {
      ok,
      runId: id,
      extensionId,
      manifestVersion: manifest.manifest_version,
      version: manifest.version,
      optionsUrl: page.url(),
      userDataDir: userDataDir(id),
    };
    console.log(JSON.stringify(out, null, 2));
    if (!ok) process.exit(1);
  });
}

async function cmdDriveConvertAll() {
  const outDir = join(artifactsDir(), 'convert-markdown-images');
  await mkdir(outDir, { recursive: true });

  await withSession(async ({ context, extensionId, port }) => {
    const page = await context.newPage();
    const fixtureUrl = `http://127.0.0.1:${port}/github-comment.html`;
    const before =
      'Before text\n![title](https://user-images.githubusercontent.com/test0.png)\nAfter text';

    await page.goto(fixtureUrl);
    const textarea = page.locator('#comment');
    await textarea.fill(before);
    await textarea.focus();

    await triggerBrowserAction(context, extensionId);
    await page.waitForTimeout(500);

    const after = await textarea.inputValue();
    const expected =
      'Before text\n<img src=https://user-images.githubusercontent.com/test0.png  width=50%>\nAfter text';

    await writeFile(join(outDir, 'textarea-before.txt'), before, 'utf8');
    await writeFile(join(outDir, 'textarea-after.txt'), after, 'utf8');
    await page.screenshot({ path: join(outDir, 'fixture-after.png'), fullPage: true });

    const proof = {
      ok: after === expected,
      feature: 'convert-markdown-images',
      expected,
      actual: after,
      fixtureUrl,
      artifacts: outDir,
    };
    await writeFile(join(outDir, 'proof.json'), JSON.stringify(proof, null, 2));
    console.log(JSON.stringify(proof, null, 2));
    if (!proof.ok) process.exit(1);
  });
}

async function cmdDriveConvertSelection() {
  const outDir = join(artifactsDir(), 'convert-selection-only');
  await mkdir(outDir, { recursive: true });

  await withSession(async ({ context, extensionId, port }) => {
    const page = await context.newPage();
    const fixtureUrl = `http://127.0.0.1:${port}/github-comment.html`;
    const md = '![title](https://user-images.githubusercontent.com/test0.png)';
    const before = `Before text\n${md}\nAfter text`;
    const selectionStart = before.indexOf(md);
    const selectionEnd = selectionStart + md.length;
    const expected =
      'Before text\n<img src=https://user-images.githubusercontent.com/test0.png  width=50%>\nAfter text';

    await page.goto(fixtureUrl);
    const textarea = page.locator('#comment');
    await textarea.fill(before);
    await textarea.evaluate(
      (el, range) => {
        el.focus();
        el.setSelectionRange(range.start, range.end);
      },
      { start: selectionStart, end: selectionEnd },
    );

    await triggerBrowserAction(context, extensionId);
    await page.waitForTimeout(500);

    const after = await textarea.inputValue();

    // selection-no-op: non-empty selection over plain text only → no change
    const noOpBefore = before;
    await textarea.fill(noOpBefore);
    await textarea.evaluate((el) => {
      el.focus();
      el.setSelectionRange(0, 'Before text'.length);
    });
    await triggerBrowserAction(context, extensionId);
    await page.waitForTimeout(500);
    const noOpAfter = await textarea.inputValue();

    await writeFile(join(outDir, 'textarea-before.txt'), before, 'utf8');
    await writeFile(join(outDir, 'textarea-after.txt'), after, 'utf8');
    await writeFile(join(outDir, 'textarea-noop-after.txt'), noOpAfter, 'utf8');
    await page.screenshot({ path: join(outDir, 'fixture-after.png'), fullPage: true });

    const proof = {
      ok: after === expected && noOpAfter === noOpBefore,
      feature: 'convert-selection-only',
      expected,
      actual: after,
      noOpExpected: noOpBefore,
      noOpActual: noOpAfter,
      selectionStart,
      selectionEnd,
      fixtureUrl,
      artifacts: outDir,
    };
    await writeFile(join(outDir, 'proof.json'), JSON.stringify(proof, null, 2));
    console.log(JSON.stringify(proof, null, 2));
    if (!proof.ok) process.exit(1);
  });
}

async function cmdDriveOptionsWidth() {
  const outDir = join(artifactsDir(), 'options-default-size');
  await mkdir(outDir, { recursive: true });

  await withSession(async ({ context, extensionId, port }) => {
    const optionsUrl = `chrome-extension://${extensionId}/src/html/options.html`;
    const optionsPage = await context.newPage();
    await optionsPage.goto(optionsUrl, { waitUntil: 'domcontentloaded' });
    await optionsPage.locator('#width').fill('200px');
    await optionsPage.locator('#height').fill('');
    await optionsPage.locator('#save').click();
    await optionsPage.waitForTimeout(300);
    await optionsPage.screenshot({ path: join(outDir, 'options-after-save.png'), fullPage: true });

    const fixtureUrl = `http://127.0.0.1:${port}/github-comment.html`;
    const before =
      'Before text\n![title](https://user-images.githubusercontent.com/test0.png)\nAfter text';
    const expectedCustom =
      'Before text\n<img src=https://user-images.githubusercontent.com/test0.png  width=200px>\nAfter text';
    const expectedDefault =
      'Before text\n<img src=https://user-images.githubusercontent.com/test0.png  width=50%>\nAfter text';

    const page = await context.newPage();
    await page.goto(fixtureUrl);
    const textarea = page.locator('#comment');
    await textarea.fill(before);
    await textarea.focus();
    await triggerBrowserAction(context, extensionId);
    await page.waitForTimeout(500);
    const afterCustom = await textarea.inputValue();

    // Empty both fields → fallback width=50%
    await optionsPage.bringToFront();
    await optionsPage.locator('#width').fill('');
    await optionsPage.locator('#height').fill('');
    await optionsPage.locator('#save').click();
    await optionsPage.waitForTimeout(300);

    await page.bringToFront();
    await textarea.fill(before);
    await textarea.focus();
    await triggerBrowserAction(context, extensionId);
    await page.waitForTimeout(500);
    const afterDefault = await textarea.inputValue();

    await writeFile(join(outDir, 'textarea-before.txt'), before, 'utf8');
    await writeFile(join(outDir, 'textarea-after-custom.txt'), afterCustom, 'utf8');
    await writeFile(join(outDir, 'textarea-after-default.txt'), afterDefault, 'utf8');
    await page.screenshot({ path: join(outDir, 'fixture-after.png'), fullPage: true });

    const proof = {
      ok: afterCustom === expectedCustom && afterDefault === expectedDefault,
      feature: 'options-default-size',
      expectedCustom,
      actualCustom: afterCustom,
      expectedDefault,
      actualDefault: afterDefault,
      optionsUrl,
      fixtureUrl,
      artifacts: outDir,
    };
    await writeFile(join(outDir, 'proof.json'), JSON.stringify(proof, null, 2));
    console.log(JSON.stringify(proof, null, 2));
    if (!proof.ok) process.exit(1);
  });
}

async function cmdCleanup() {
  const id = env('IMGCONVERTER_RUN_ID', '');
  const run = id || runId();
  const profile = userDataDir(run);
  const extDir = resolve(env('IMGCONVERTER_VERIFY_EXT_DIR', `/tmp/imgconverter-ext-${run}`));
  await rm(profile, { recursive: true, force: true });
  await rm(extDir, { recursive: true, force: true });
  console.log(JSON.stringify({ ok: true, removed: [profile, extDir] }, null, 2));
}

const command = process.argv[2] ?? 'help';

const handlers = {
  launch: cmdLaunch,
  hold: cmdHold,
  doctor: cmdDoctor,
  'drive-convert-all': cmdDriveConvertAll,
  'drive-convert-selection': cmdDriveConvertSelection,
  'drive-options-width': cmdDriveOptionsWidth,
  cleanup: cmdCleanup,
  help: async () => {
    console.log(`Usage: control-imgconverter.mjs <command>

Commands:
  doctor                   Read-only health check (extension id, options page, manifest)
  drive-convert-all        Drive convert-all on github-comment fixture; write proof artifacts
  drive-convert-selection  Drive selection-scoped convert (+ no-op selection); write proof
  drive-options-width      Save options width then convert; prove custom + empty default
  cleanup                  Remove disposable Chrome profile for IMGCONVERTER_RUN_ID

Environment:
  IMGCONVERTER_REPO_ROOT       Path to unpacked extension (default: repo root)
  IMGCONVERTER_RUN_ID          Isolates Chrome user-data dir under /tmp
  IMGCONVERTER_ARTIFACTS_DIR   Proof output root (default: /opt/cursor/artifacts/imgconverter-verify)
  IMGCONVERTER_FIXTURE_PORT    Local fixture server port (default: ${DEFAULT_PORT})
`);
  },
};

const handler = handlers[command] ?? handlers.help;
handler().catch((err) => {
  console.error(err);
  process.exit(1);
});
