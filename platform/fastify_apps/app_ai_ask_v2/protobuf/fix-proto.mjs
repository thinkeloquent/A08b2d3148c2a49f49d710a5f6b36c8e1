/**
 * fix-proto.mjs
 *
 * Patches the pbjs-generated ES6 static module so it works correctly
 * as an ESM import. The pbjs es6 wrapper doesn't add a default export
 * and uses `import * as $protobuf` which can cause issues with some
 * bundlers. This script:
 *   1. Replaces the namespace import with a default import
 *   2. Adds a default export of $root
 */

import { readFileSync, writeFileSync } from 'node:fs';

const file = process.argv[2];
if (!file) {
  console.error('Usage: node fix-proto.mjs <generated-file>');
  process.exit(1);
}

let code = readFileSync(file, 'utf8');

// Fix: replace `import * as $protobuf` with default import
code = code.replace(
  /import \* as \$protobuf from "protobufjs\/minimal"/,
  'import $protobuf from "protobufjs/minimal"',
);

// Add default export if not present (pbjs es6 may already include one)
if (!code.includes('export default') && !code.includes('export { $root as default }')) {
  code += '\nexport default $root;\n';
}

writeFileSync(file, code, 'utf8');
console.log(`fix-proto: patched ${file}`);
