import { defineConfig } from 'tsup';

const entryPoints = {
  index: 'src/index.tsx',
  client: 'src/client.ts',
  tailwind: 'src/tailwind.ts'
} as const;

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
  outExtension({ format }) {
    return {
      js: format === 'esm' ? '.mjs' : '.cjs'
    };
  },
  target: 'es2020',
  external: ['react', 'react-dom']
});
