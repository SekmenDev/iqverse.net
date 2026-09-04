import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    exclude: ['**/node_modules/**', '**/e2e/**'],
    alias: {
      '@': path.resolve(import.meta.dirname, './'),
    },
    reporters: ['default', 'html'],
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
  },
});
