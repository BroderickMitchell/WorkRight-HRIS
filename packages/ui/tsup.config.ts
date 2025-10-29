import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/components/**/*.{ts,tsx}',
    'src/tokens/**/*.ts',
    'src/utils/**/*.ts'
  ],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: false,
  bundle: false,
  splitting: false,
  outDir: 'dist',
  outExtension({ format }) {
    return { js: format === 'esm' ? '.mjs' : '.js' };
  }
});
