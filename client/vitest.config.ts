import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['client/src/**/*.test.{ts,tsx}'],
    setupFiles: [path.resolve(__dirname, 'src/test/setup.ts')]
  }
});
