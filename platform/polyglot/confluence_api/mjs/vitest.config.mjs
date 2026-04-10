import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['__tests__/**/*.test.mjs'],
    reporter: ['verbose'],
    testTimeout: 10000,
  },
});
