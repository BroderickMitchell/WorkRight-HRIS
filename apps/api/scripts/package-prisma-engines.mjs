import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const apiRoot = path.resolve(__dirname, '..');

const DEFAULT_ENGINES_COMMIT = '34b5a692b7bd79939a9a2c3ef97d816e749cda2f';
const QUERY_FILENAME = 'libquery_engine-debian-openssl-3.0.x.so.node';
const SCHEMA_FILENAME = 'schema-engine-debian-openssl-3.0.x';

const enginesCommit = process.env.PRISMA_ENGINES_COMMIT ?? DEFAULT_ENGINES_COMMIT;
const sourceDir = process.env.PRISMA_ENGINES_DIR ?? path.join(apiRoot, 'prisma', 'engines', enginesCommit);
const archiveDir = path.join(apiRoot, 'prisma', 'engine-archives', enginesCommit);

const artifacts = [
  {
    binary: path.join(sourceDir, QUERY_FILENAME),
    archive: path.join(archiveDir, `${QUERY_FILENAME}.base64`),
  },
  {
    binary: path.join(sourceDir, SCHEMA_FILENAME),
    archive: path.join(archiveDir, `${SCHEMA_FILENAME}.base64`),
  },
];

let packaged = 0;

for (const { binary, archive } of artifacts) {
  if (!existsSync(binary)) {
    console.warn(`[prisma] Skipping ${path.basename(binary)} (missing source binary: ${binary})`);
    continue;
  }

  const buffer = readFileSync(binary);
  const base64 = buffer.toString('base64');
  const wrapped = base64.match(/.{1,76}/g)?.join('\n') ?? base64;

  mkdirSync(path.dirname(archive), { recursive: true });
  writeFileSync(archive, `${wrapped}\n`, 'utf8');
  packaged += 1;
  console.log(`[prisma] Wrote ${path.relative(apiRoot, archive)} (${buffer.length} bytes uncompressed)`);
}

if (!packaged) {
  console.error('[prisma] No Prisma engine binaries were packaged.');
  process.exit(1);
}

console.log(`[prisma] Packaged ${packaged}/${artifacts.length} Prisma engine artifacts.`);
