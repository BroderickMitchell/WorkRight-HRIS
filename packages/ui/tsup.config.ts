import { defineConfig } from 'tsup';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const entryPoints = {
  index: 'src/index.tsx',
  client: 'src/client.ts',
  tailwind: 'src/tailwind.ts'
} as const;

const CLIENT_DIRECTIVE = `"use client";\n`;
const __dirname = dirname(fileURLToPath(import.meta.url));
const clientBoundaries = ['index', 'client'];

function ensureClientDirective(format: 'esm' | 'cjs') {
  for (const entry of clientBoundaries) {
    const output = join(__dirname, 'dist', `${entry}.${format === 'esm' ? 'mjs' : 'cjs'}`);
    if (!existsSync(output)) continue;
    const contents = readFileSync(output, 'utf8');
    if (!contents.startsWith('"use client";')) {
      writeFileSync(output, `${CLIENT_DIRECTIVE}${contents}`);
    }
  }
}

export default defineConfig({
  entry: entryPoints,
  format: ['esm', 'cjs'],
  dts: {
    entry: entryPoints
  },
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: false,
  treeshake: true,
  skipNodeModulesBundle: true,
  onSuccess: () => {
    ensureClientDirective('esm');
    ensureClientDirective('cjs');
  },
  outExtension({ format }) {
    return {
      js: format === 'esm' ? '.mjs' : '.cjs'
    };
  },
  target: 'es2020',
  external: ['react', 'react-dom']
});
