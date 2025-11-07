import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const apiRoot = path.resolve(__dirname, '..');

const prismaExecutable = process.platform === 'win32' ? 'prisma.cmd' : 'prisma';
const prismaBin = path.join(apiRoot, 'node_modules', '.bin', prismaExecutable);
const args = process.argv.slice(2);

if (!args.length) {
  console.error('Usage: node scripts/run-prisma.mjs <command> [...args]');
  process.exit(1);
}

if (process.env.SKIP_PRISMA_GENERATE && args[0] === 'generate') {
  console.log('[prisma] Skipping generate because SKIP_PRISMA_GENERATE is set.');
  process.exit(0);
}

if (!existsSync(prismaBin)) {
  console.error('[prisma] Prisma CLI not found at', prismaBin);
  console.error('[prisma] Install it with: pnpm --filter @workright/api add -D prisma');
  process.exit(1);
}

const env = {
  ...process.env,
  PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING:
    process.env.PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING ?? '1',
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
