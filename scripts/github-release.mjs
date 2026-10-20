import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const ref = process.env.GITHUB_REF ?? '';
const tag = ref.startsWith('refs/tags/') ? ref.slice('refs/tags/'.length) : '';
if (!/^v\d+\.\d+\.\d+$/.test(tag)) {
  console.error(`GITHUB_REF ${ref || '(empty)'} is not a vX.Y.Z tag.`);
  process.exit(1);
}

const version = tag.slice(1);
const zipPath = `dist/ImgConverter-${version}.zip`;
if (!existsSync(zipPath)) {
  console.error(`Missing ${zipPath}.`);
  process.exit(1);
}

if (releaseExists(tag)) {
  execFileSync('gh', ['release', 'upload', tag, zipPath, '--clobber'], { stdio: 'inherit' });
  console.log(`Updated GitHub Release ${tag}.`);
} else {
  execFileSync('gh', [
    'release', 'create', tag, zipPath,
    '--title', `ImgConverter ${version}`,
    '--notes', `v${version}`,
  ], { stdio: 'inherit' });
  console.log(`Created GitHub Release ${tag}.`);
}

// gh exits 1 both when the release is missing and when the command fails. Only the missing-release text should create one.
function releaseExists(tagName) {
  try {
    execFileSync('gh', ['release', 'view', tagName, '--json', 'tagName'], { stdio: 'pipe' });
    return true;
  } catch (error) {
    const stderr = String(error.stderr ?? '');
    if (error.status === 1 && stderr.includes('release not found')) return false;
    throw error;
  }
}
