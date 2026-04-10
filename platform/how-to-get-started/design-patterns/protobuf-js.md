# Protobuf JS — ESM Code Generation Pattern

Protocol Buffer code generation for ESM (`"type": "module"`) Node.js packages using `protobufjs` and `protobufjs-cli`.

## The Problem

`pbjs` generates a static-module ES6 file with:

```js
import * as $protobuf from "protobufjs/minimal";
```

This breaks under ESM because:

1. `protobufjs/minimal` has no `.js` extension — Node ESM requires explicit file extensions.
2. `import * as` doesn't match the `protobufjs/minimal` default export shape.

## The Fix — 3-Step Build Pipeline

```
pbjs (generate)  →  fix-proto.mjs (patch)  →  pbts (typedefs)
```

| Step     | Tool             | What it does                                              |
|----------|------------------|-----------------------------------------------------------|
| Generate | `pbjs`           | Compiles `.proto` files into a static ES6 module          |
| Patch    | `fix-proto.mjs`  | Rewrites the import for ESM compatibility                 |
| Typedefs | `pbts`           | Generates `.d.ts` from the patched `.js`/`.mjs` output    |

The patch step replaces:

```js
import * as $protobuf from "protobufjs/minimal"
```

with:

```js
import $protobuf from "protobufjs/minimal.js"
```

## fix-proto.mjs

A platform-agnostic Node.js script that replaces the fragile `sed` one-liner. Accepts the target file as a CLI argument.

```js
import fs from 'fs';
import path from 'path';

const filePath = path.resolve(process.argv[2] || 'generated/proto.js');

try {
  let content = fs.readFileSync(filePath, 'utf8');

  const updatedContent = content.replace(
    /import \* as \$protobuf from "protobufjs\/minimal"/g,
    'import $protobuf from "protobufjs/minimal.js"'
  );

  fs.writeFileSync(filePath, updatedContent, 'utf8');
  console.log(`Patched ${filePath} for ESM compatibility.`);
} catch (err) {
  console.error(`Failed to patch ${filePath}:`, err.message);
  process.exit(1);
}
```

Why this is better than `sed`:

- **Cross-platform** — no BSD vs GNU `sed` differences.
- **Error handling** — clear message on missing file or permission errors.
- **Explicit** — anyone can read the regex and understand the change.

## Project Structure

Two layout conventions are used:

### Layout A — `generated/` directory (code-repositories)

```
protobuf/
├── proto/                   # .proto source files
│   ├── common.proto
│   ├── code_repository.proto
│   ├── tag.proto
│   └── metadata.proto
├── generated/               # build output (gitignored or committed)
│   ├── proto.js             # pbjs output → patched by fix-proto.mjs
│   └── proto.d.ts           # pbts output
├── src/
│   └── index.mjs            # re-exports from generated/proto.js
├── fix-proto.mjs
└── package.json
```

### Layout B — `src/` co-located (task-graph)

```
protobuf/
├── proto/
│   └── task_graph.proto
├── src/
│   ├── index.mjs            # runtime loader using protobufjs directly
│   ├── task_graph.pb.mjs    # pbjs output → patched by fix-proto.mjs
│   └── task_graph.pb.d.ts   # pbts output
├── fix-proto.mjs
└── package.json
```

## package.json Scripts

### Layout A — code-repositories

```json
{
  "name": "@internal/code-repositories-proto",
  "type": "module",
  "main": "src/index.mjs",
  "scripts": {
    "generate": "pbjs -t static-module -w es6 -o generated/proto.js proto/*.proto && node fix-proto.mjs generated/proto.js && pbts -o generated/proto.d.ts generated/proto.js",
    "clean": "rm -rf generated/*.js generated/*.d.ts",
    "build": "npm run clean && npm run generate"
  },
  "dependencies": {
    "protobufjs": "^7.4.0"
  },
  "devDependencies": {
    "protobufjs-cli": "^1.1.3"
  }
}
```

### Layout B — task-graph

```json
{
  "name": "@mta/task-graph-proto",
  "type": "module",
  "main": "src/index.mjs",
  "exports": {
    ".": "./src/index.mjs",
    "./proto": "./proto/task_graph.proto"
  },
  "scripts": {
    "build": "pbjs -t static-module -w es6 -o src/task_graph.pb.mjs proto/task_graph.proto && node fix-proto.mjs src/task_graph.pb.mjs && pbts -o src/task_graph.pb.d.ts src/task_graph.pb.mjs"
  },
  "dependencies": {
    "protobufjs": "^7.2.6"
  },
  "devDependencies": {
    "protobufjs-cli": "^1.1.3"
  }
}
```

## src/index.mjs — Re-export Pattern

The entry point re-exports generated types so consumers import from the package, not from generated files directly.

### Static re-exports (code-repositories)

Imports the static-module output and destructures named exports by namespace:

```js
import { code_repositories } from '../generated/proto.js';

const common = code_repositories.common;
const repository = code_repositories.repository;

export const { Repository, ListRepositoriesRequest, ... } = repository;
export const { PaginationRequest, ErrorResponse, ... } = common;

export const protoRoot = code_repositories;
export { common, repository };
```

### Runtime loader (task-graph)

Uses `protobufjs.load()` at runtime to look up types by fully-qualified name:

```js
import protobuf from 'protobufjs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROTO_PATH = join(__dirname, '..', 'proto', 'task_graph.proto');

let root = null;

export async function loadProto() {
  if (root) return types;
  root = await protobuf.load(PROTO_PATH);
  types = {
    Task: root.lookupType('taskgraph.Task'),
    TaskStatus: root.lookupEnum('taskgraph.TaskStatus'),
    // ...
  };
  return types;
}

export async function encode(typeName, data) { /* ... */ }
export async function decode(typeName, buffer) { /* ... */ }
```

## When to Use Which Layout

| Consideration          | Layout A (`generated/`)            | Layout B (`src/` co-located)         |
|------------------------|------------------------------------|--------------------------------------|
| Multiple `.proto` files | Consolidates into one `proto.js`  | One `.pb.mjs` per proto              |
| Clean separation       | Source and generated are separate  | Everything lives in `src/`           |
| Gitignore strategy     | Easy to gitignore `generated/`     | Must be selective in `src/`          |
| Consumer imports       | Static destructured exports        | Async `loadProto()` + lookup         |

## Applying to a New Protobuf Package

1. Create the directory structure (pick Layout A or B).
2. Copy `fix-proto.mjs` — update the default fallback path in `process.argv[2] || '...'`.
3. Add `protobufjs` and `protobufjs-cli` dependencies.
4. Wire up the build script: `pbjs ... && node fix-proto.mjs <output-file> && pbts ...`.
5. Create `src/index.mjs` to re-export the generated types.
6. Run `npm run build` to verify.

## Existing Protobuf Packages

| Package                                     | Layout | Output file               |
|---------------------------------------------|--------|---------------------------|
| `fastify_apps/code-repositories/protobuf`   | A      | `generated/proto.js`      |
| `fastify_apps/task-graph/protobuf`          | B      | `src/task_graph.pb.mjs`   |
