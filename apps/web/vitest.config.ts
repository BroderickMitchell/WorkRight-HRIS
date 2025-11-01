import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import type { PluginOption } from 'vite';

export default defineConfig({
  plugins: [react() as PluginOption],
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['**/*.test.tsx'],
    setupFiles: ['./vitest.setup.ts']
  }
});
