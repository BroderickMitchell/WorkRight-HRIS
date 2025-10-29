import { access, copyFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const envTargets = [
  path.join(repoRoot, 'apps', 'api', '.env'),
  path.join(repoRoot, 'apps', 'web', '.env'),
];

const copied = [];

for (const target of envTargets) {
  const example = `${target}.example`;

  try {
    await access(example);
  } catch {
    continue; // No example file to copy from.
  }

  try {
    await access(target);
  } catch {
    await copyFile(example, target);
    copied.push(path.relative(repoRoot, target));
  }
}

if (copied.length > 0) {
  console.log(`Bootstrapped environment files: ${copied.join(', ')}`);
}
