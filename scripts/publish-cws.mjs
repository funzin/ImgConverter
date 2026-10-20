import crypto from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const SECRET_NAMES = [
  'CWS_EXTENSION_ID',
  'CWS_PUBLISHER_ID',
  'CWS_SERVICE_ACCOUNT_JSON',
];
const SCOPE = 'https://www.googleapis.com/auth/chromewebstore';
const TOKEN_URL = process.env.CWS_TOKEN_URL ?? 'https://oauth2.googleapis.com/token';
const API_ORIGIN = process.env.CWS_API_ORIGIN ?? 'https://chromewebstore.googleapis.com';
// The v2 discovery enum is IN_PROGRESS. The guide still says UPLOAD_IN_PROGRESS.
const IN_PROGRESS = new Set(['IN_PROGRESS', 'UPLOAD_IN_PROGRESS']);

const missing = SECRET_NAMES.filter((name) => !process.env[name]);
if (missing.length === SECRET_NAMES.length) {
  console.log(`Chrome Web Store publish skipped. Add repository secrets ${SECRET_NAMES.join(', ')} to upload and submit the extension.`);
  process.exit(0);
}
if (missing.length) {
  console.error(`Chrome Web Store publish failed. Some secrets are set and some are missing: ${missing.join(', ')}.`);
  process.exit(1);
}

try {
  await publishExtension();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}

async function publishExtension() {
  const key = parseServiceAccount(process.env.CWS_SERVICE_ACCOUNT_JSON);
  const manifest = JSON.parse(readFileSync('manifest.json', 'utf8'));
  const zipPath = path.join('dist', `ImgConverter-${manifest.version}.zip`);
  const zipBytes = readFileSync(zipPath);
  const publisherId = process.env.CWS_PUBLISHER_ID;
  const extensionId = process.env.CWS_EXTENSION_ID;

  const token = await accessToken(key);
  const uploaded = await uploadPackage(token, publisherId, extensionId, zipBytes);
  const settled = await waitForUpload(token, publisherId, extensionId, uploaded);
  if (settled.crxVersion && settled.crxVersion !== manifest.version) {
    throw new Error(`Uploaded crxVersion ${settled.crxVersion} does not match manifest.json ${manifest.version}.`);
  }
  const published = await submitItem(token, publisherId, extensionId);
  const state = published.state ? ` (${published.state})` : '';
  console.log(`Submitted ImgConverter ${manifest.version} to the Chrome Web Store${state}.`);
}

function parseServiceAccount(raw) {
  let key;
  try {
    key = JSON.parse(raw);
  } catch {
    throw new Error('CWS_SERVICE_ACCOUNT_JSON is not valid JSON.');
  }
  if (!key.client_email || !key.private_key) {
    throw new Error('CWS_SERVICE_ACCOUNT_JSON needs client_email and private_key.');
  }
  return key;
}

function signAssertion(key) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = base64url(JSON.stringify({
    iss: key.client_email,
    scope: SCOPE,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  }));
  const unsigned = `${header}.${payload}`;
  const signature = crypto.sign('RSA-SHA256', Buffer.from(unsigned), key.private_key);
  return `${unsigned}.${base64url(signature)}`;
}

function base64url(value) {
  return Buffer.from(value).toString('base64url');
}

async function accessToken(key) {
  const body = new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion: signAssertion(key),
  });
  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const json = await readBody(response);
  if (!json.access_token) {
    throw new Error('Token response has no access_token.');
  }
  return json.access_token;
}

async function uploadPackage(token, publisherId, extensionId, zipBytes) {
  const url = `${API_ORIGIN}/upload/v2/${itemName(publisherId, extensionId)}:upload`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/zip',
    },
    body: zipBytes,
  });
  return readBody(response);
}

async function fetchStatus(token, publisherId, extensionId) {
  const url = `${API_ORIGIN}/v2/${itemName(publisherId, extensionId)}:fetchStatus`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return readBody(response);
}

async function submitItem(token, publisherId, extensionId) {
  const url = `${API_ORIGIN}/v2/${itemName(publisherId, extensionId)}:publish`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  return readBody(response);
}

async function waitForUpload(token, publisherId, extensionId, initial) {
  if (initial.uploadState === 'FAILED') {
    throw new Error(`Chrome Web Store upload failed: ${JSON.stringify(initial)}`);
  }
  if (!IN_PROGRESS.has(initial.uploadState)) return initial;

  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const status = await fetchStatus(token, publisherId, extensionId);
    const state = status.lastAsyncUploadState;
    if (state === 'SUCCEEDED') return status;
    if (state === 'FAILED') {
      throw new Error(`Chrome Web Store upload failed: ${JSON.stringify(status)}`);
    }
    if (state && state !== 'NOT_FOUND' && !IN_PROGRESS.has(state)) {
      throw new Error(`Chrome Web Store upload ended in ${state}: ${JSON.stringify(status)}`);
    }
  }
  throw new Error('Chrome Web Store upload was still in progress after 120 seconds.');
}

function itemName(publisherId, extensionId) {
  return `publishers/${encodeURIComponent(publisherId)}/items/${encodeURIComponent(extensionId)}`;
}

async function readBody(response) {
  const text = await response.text();
  let body = {};
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = { raw: text };
    }
  }
  if (!response.ok) {
    const detail = body.error?.message ?? text;
    throw new Error(`Chrome Web Store request failed (${response.status}): ${detail}`);
  }
  return body;
}
