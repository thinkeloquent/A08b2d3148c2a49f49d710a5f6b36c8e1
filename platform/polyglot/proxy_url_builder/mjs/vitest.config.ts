import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: false,
        environment: 'node',
        include: ['__tests__/**/*.test.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html'],
            include: ['src/**/*.ts'],
            exclude: ['**/*.test.ts', '**/*.d.ts'],
            thresholds: { statements: 80, branches: 80, functions: 80, lines: 80 },
        },
    },
});
