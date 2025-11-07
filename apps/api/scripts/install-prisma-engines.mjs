import { chmodSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const apiRoot = path.resolve(__dirname, '..');

const DEFAULT_ENGINES_COMMIT = '34b5a692b7bd79939a9a2c3ef97d816e749cda2f';
const QUERY_FILENAME = 'libquery_engine-debian-openssl-3.0.x.so.node';
const SCHEMA_FILENAME = 'schema-engine-debian-openssl-3.0.x';

export function hydratePrismaEngines({
  commit = process.env.PRISMA_ENGINES_COMMIT ?? DEFAULT_ENGINES_COMMIT,
  targetDir = process.env.PRISMA_ENGINES_DIR ?? path.join(apiRoot, 'prisma', 'engines', commit),
  archiveDir = path.join(apiRoot, 'prisma', 'engine-archives', commit),
} = {}) {
  const artifacts = [
    {
      binary: path.join(targetDir, QUERY_FILENAME),
      archive: path.join(archiveDir, `${QUERY_FILENAME}.base64`),
      executable: false,
    },
    {
      binary: path.join(targetDir, SCHEMA_FILENAME),
      archive: path.join(archiveDir, `${SCHEMA_FILENAME}.base64`),
      executable: true,
    },
  ];

  let restored = 0;

  for (const { binary, archive, executable } of artifacts) {
    if (existsSync(binary)) {
      continue;
    }

    if (!existsSync(archive)) {
      continue;
    }

    const raw = readFileSync(archive, 'utf8');
    const base64 = raw.replace(/\s+/g, '');
    const buffer = Buffer.from(base64, 'base64');

    mkdirSync(path.dirname(binary), { recursive: true });
    writeFileSync(binary, buffer);
    if (executable) {
      chmodSync(binary, 0o755);
    }
    restored += 1;
    console.log(`[prisma] Restored ${path.basename(binary)} from ${path.relative(apiRoot, archive)}`);
  }

  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true });
  }

  if (restored) {
    console.log(`[prisma] Prisma engine cache hydrated (${restored}/${artifacts.length}).`);
  }

  return restored;
}

if (import.meta.url === `file://${__filename}`) {
  const restored = hydratePrismaEngines();
  if (!restored) {
    console.warn('[prisma] No Prisma engine archives were decoded (nothing to do).');
  }
}
