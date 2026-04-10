import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: false, // Disabled due to Fastify 4/5 type conflicts
  sourcemap: true,
  clean: true,
  target: 'node20',
  outDir: 'dist',
  splitting: false,
  treeshake: true,
});
