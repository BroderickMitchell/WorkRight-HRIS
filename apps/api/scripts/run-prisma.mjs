import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { hydratePrismaEngines } from './install-prisma-engines.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const apiRoot = path.resolve(__dirname, '..');

const DEFAULT_ENGINES_COMMIT = '34b5a692b7bd79939a9a2c3ef97d816e749cda2f';
const QUERY_FILENAME = 'libquery_engine-debian-openssl-3.0.x.so.node';
const SCHEMA_FILENAME = 'schema-engine-debian-openssl-3.0.x';

const enginesCommit = process.env.PRISMA_ENGINES_COMMIT ?? DEFAULT_ENGINES_COMMIT;
const explicitEnginesDir = process.env.PRISMA_ENGINES_DIR;
const defaultEnginesDir = path.join(apiRoot, 'prisma', 'engines', enginesCommit);

hydratePrismaEngines({ commit: enginesCommit, targetDir: defaultEnginesDir });

const engineDirs = [explicitEnginesDir, defaultEnginesDir].filter(Boolean);

const queryCandidates = [
  process.env.PRISMA_QUERY_ENGINE_LIBRARY,
  ...engineDirs.map((dir) => path.join(dir, QUERY_FILENAME)),
].filter(Boolean);

const schemaCandidates = [
  process.env.PRISMA_SCHEMA_ENGINE_BINARY,
  ...engineDirs.map((dir) => path.join(dir, SCHEMA_FILENAME)),
].filter(Boolean);

const queryEnginePath = queryCandidates.find((candidate) => existsSync(candidate));
const schemaEnginePath = schemaCandidates.find((candidate) => existsSync(candidate));

if (!queryEnginePath || !schemaEnginePath) {
  const searched = [...new Set([...queryCandidates, ...schemaCandidates])];
  console.error('[prisma] Prisma engine binaries were not found.');
  if (searched.length) {
    console.error('[prisma] Checked the following locations:');
    for (const candidate of searched) {
      console.error(`  - ${candidate}`);
    }
  }
  console.error('[prisma] Rebuild or download the engines for commit', enginesCommit);
  console.error(
    `[prisma] Place them under ${defaultEnginesDir} or set PRISMA_QUERY_ENGINE_LIBRARY / PRISMA_SCHEMA_ENGINE_BINARY.`,
  );
  console.error('[prisma] See docs/prisma-engines.md for offline refresh options (GitHub Release, internal mirror, etc.).');
  process.exit(1);
}

const prismaBin = path.join(apiRoot, 'node_modules', '.bin', process.platform === 'win32' ? 'prisma.cmd' : 'prisma');
const args = process.argv.slice(2);

if (!args.length) {
  console.error('Usage: node scripts/run-prisma.mjs <command> [...args]');
  process.exit(1);
}

if (process.env.SKIP_PRISMA_GENERATE && args[0] === 'generate') {
  console.log('[prisma] Skipping generate because SKIP_PRISMA_GENERATE is set.');
  process.exit(0);
}

const env = {
  ...process.env,
  PRISMA_QUERY_ENGINE_LIBRARY: process.env.PRISMA_QUERY_ENGINE_LIBRARY ?? queryEnginePath,
  PRISMA_SCHEMA_ENGINE_BINARY: process.env.PRISMA_SCHEMA_ENGINE_BINARY ?? schemaEnginePath,
  PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING: process.env.PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING ?? '1',
};

const result = spawnSync(prismaBin, args, {
  cwd: apiRoot,
  stdio: 'inherit',
  env,
});

if (result.error) {
  console.error('[prisma] Failed to execute Prisma CLI:', result.error.message);
  process.exit(result.status ?? 1);
}

process.exit(result.status ?? 0);
