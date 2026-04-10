import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  target: "node20",
  outDir: "dist",
  splitting: false,
  treeshake: true,
  external: [
    "@aws-sdk/client-s3",
    "@smithy/node-http-handler",
    "@smithy/protocol-http",
    "undici",
    "fetch_undici",
  ],
});
