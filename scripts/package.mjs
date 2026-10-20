import { execFileSync } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const manifestVersion = JSON.parse(readFileSync('manifest.json', 'utf8')).version;
const packageVersion = JSON.parse(readFileSync('package.json', 'utf8')).version;
if (manifestVersion !== packageVersion) {
  console.error(`manifest.json version ${manifestVersion} does not match package.json version ${packageVersion}.`);
  process.exit(1);
}

const roots = [
  'manifest.json',
  'src/html',
  'src/js',
  'resource/image/icons',
];

const zipPath = path.join('dist', `ImgConverter-${manifestVersion}.zip`);
mkdirSync('dist', { recursive: true });
rmSync(zipPath, { force: true });

zipWithParentDirectories(zipPath, roots);

let listed;
try {
  listed = execFileSync('unzip', ['-Z1', zipPath], { encoding: 'utf8' });
} catch (error) {
  if (error.code === 'ENOENT') {
    console.error('The unzip command is required to check the release package.');
    process.exit(1);
  }
  throw error;
}
const names = listed.split('\n').filter(Boolean);
for (const name of names) {
  if (!isRuntimeEntry(name)) {
    console.error(`${zipPath} contains ${name}, which is outside the runtime set.`);
    process.exit(1);
  }
}

console.log(`Wrote ${zipPath} (${names.length} entries).`);

function zipWithParentDirectories(zipPath, rootPaths) {
  const stage = mkdtempSync(path.join(os.tmpdir(), 'imgconverter-'));
  try {
    for (const file of runtimeFiles(rootPaths)) {
      const dest = path.join(stage, file);
      mkdirSync(path.dirname(dest), { recursive: true });
      cpSync(file, dest);
    }
    execFileSync('zip', ['-r', '-q', '-X', path.resolve(zipPath), 'manifest.json', 'src', 'resource'], {
      cwd: stage,
      stdio: 'inherit',
    });
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error('The zip command is required to build the release package.');
      process.exit(1);
    }
    throw error;
  } finally {
    rmSync(stage, { recursive: true, force: true });
  }
}

function runtimeFiles(rootPaths) {
  const files = [];
  for (const root of rootPaths) {
    if (statSync(root).isDirectory()) walk(root, files);
    else files.push(root);
  }
  return files;
}

function walk(entry, files) {
  for (const child of readdirSync(entry, { withFileTypes: true })) {
    const full = path.join(entry, child.name);
    if (child.isDirectory()) walk(full, files);
    else if (isPackagedFile(full)) files.push(full);
  }
}

function isPackagedFile(file) {
  return !file.endsWith('.ts') && !file.endsWith('.tsx') && !file.endsWith('.map');
}

function isRuntimeEntry(name) {
  if (name.endsWith('.ts') || name.endsWith('.tsx') || name.endsWith('.map')) return false;
  const directories = new Set([
    'src/',
    'src/html/',
    'src/js/',
    'resource/',
    'resource/image/',
    'resource/image/icons/',
  ]);
  if (name === 'manifest.json' || directories.has(name)) return true;
  return name.startsWith('src/html/')
    || name.startsWith('src/js/')
    || name.startsWith('resource/image/icons/');
}
