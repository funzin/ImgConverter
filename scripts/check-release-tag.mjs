import { readFileSync } from 'node:fs';

const raw = process.argv[2] ?? process.env.GITHUB_REF ?? '';
const tag = raw.startsWith('refs/tags/') ? raw.slice('refs/tags/'.length) : raw;
if (!/^v\d+\.\d+\.\d+$/.test(tag)) {
  console.error(`Tag ${raw || '(empty)'} is not vX.Y.Z.`);
  process.exit(1);
}

const version = tag.slice(1);
const manifestVersion = JSON.parse(readFileSync('manifest.json', 'utf8')).version;
const packageVersion = JSON.parse(readFileSync('package.json', 'utf8')).version;
if (manifestVersion !== version || packageVersion !== version) {
  console.error(`Tag ${tag} does not match manifest.json (${manifestVersion}) and package.json (${packageVersion}).`);
  process.exit(1);
}

console.log(`Tag ${tag} matches manifest.json and package.json.`);
