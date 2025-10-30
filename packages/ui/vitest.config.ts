import { createRequire } from 'node:module';
import { defineConfig } from 'vitest/config';

const require = createRequire(import.meta.url);

function resolveEnvironment() {
  try {
    require.resolve('jsdom');
    return 'jsdom';
  } catch {
    return 'node';
  }
}

export default defineConfig({
  test: {
    globals: true,
    environment: resolveEnvironment()
  }
});
