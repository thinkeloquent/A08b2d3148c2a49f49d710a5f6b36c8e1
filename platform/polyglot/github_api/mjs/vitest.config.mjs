import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['__tests__/**/*.test.mjs'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.mjs'],
      exclude: ['src/main.mjs'],
      reporter: ['text', 'lcov', 'json-summary'],
    },
    testTimeout: 10_000,
    hookTimeout: 10_000,
  },
});
