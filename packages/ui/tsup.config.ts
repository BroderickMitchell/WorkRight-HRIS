import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/tailwind.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  outExtension({ format }) {
    return format === 'cjs' ? { js: '.cjs' } : { js: '.mjs' };
  },
  sourcemap: true,
  target: 'es2020',
  external: ['react', 'react-dom']
});
