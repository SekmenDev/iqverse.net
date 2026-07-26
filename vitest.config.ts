import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react() as any],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    exclude: ['**/node_modules/**', '**/e2e/**'],
    alias: {
      '@': path.resolve(__dirname, './'),
    },
    reporters: ['default', 'html'],
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
  },
});
