import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.tsx',
    client: 'src/client.ts',
    tailwind: 'src/tailwind.ts'
  },
  format: ['esm', 'cjs'],
  dts: { entry: true },
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: false,
  treeshake: true,
  skipNodeModulesBundle: true,
  outExtension({ format }) {
    return {
      js: format === 'esm' ? '.mjs' : '.cjs'
    };
  },
  target: 'es2020',
  external: ['react', 'react-dom']
});
