import { defineConfig } from 'tsup'

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/messages.ts',
    'src/tools.ts',
    'src/response.ts',
    'src/streaming.ts',
    'src/types.ts',
  ],
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  external: ['fetch-undici'],
})
