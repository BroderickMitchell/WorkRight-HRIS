import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/client.ts', 'src/tailwind.ts'],
  format: ['esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: false,
  skipNodeModulesBundle: true,
  target: 'es2020',
  external: ['react', 'react-dom']
});
