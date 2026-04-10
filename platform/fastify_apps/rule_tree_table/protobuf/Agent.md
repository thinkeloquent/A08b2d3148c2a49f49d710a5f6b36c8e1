# Rule Tree Table Protocol Buffers

## Overview

Protocol buffer definitions providing type-safe contracts between backend and frontend applications.

## Technology Stack

- **Runtime**: protobufjs
- **Code Generation**: protobufjs-cli
- **Output**: JavaScript + TypeScript declarations

## Directory Structure

```
protobuf/
├── proto/                     # Protocol buffer definitions
│   ├── common.proto           # Shared types (enums, pagination)
│   ├── code_repository.proto  # Repository entity
│   ├── tag.proto              # Tag entity
│   └── metadata.proto         # Metadata entity
├── generated/                 # Auto-generated files
│   ├── proto.js               # JavaScript implementation
│   └── proto.d.ts             # TypeScript definitions
├── src/
│   └── index.mjs              # Re-exports for consumption
├── package.json
└── package-lock.json
```

## Proto File Conventions

### Common Types (common.proto)
```protobuf
syntax = "proto3";
package rule_tree_table;

// Enumerations
enum RepositoryType {
  REPOSITORY_TYPE_UNSPECIFIED = 0;
  REPOSITORY_TYPE_GIT = 1;
  REPOSITORY_TYPE_SVN = 2;
}

enum RepositoryStatus {
  REPOSITORY_STATUS_UNSPECIFIED = 0;
  REPOSITORY_STATUS_ACTIVE = 1;
  REPOSITORY_STATUS_ARCHIVED = 2;
}

// Pagination
message PaginationRequest {
  int32 page = 1;
  int32 page_size = 2;
}

message PaginationResponse {
  int32 total = 1;
  int32 page = 2;
  int32 page_size = 3;
  int32 total_pages = 4;
}

// Timestamps
message Timestamp {
  int64 seconds = 1;
  int32 nanos = 2;
}
```

### Entity Pattern
```protobuf
// code_repository.proto
message Repository {
  string id = 1;
  string name = 2;
  string description = 3;
  RepositoryType type = 4;
  RepositoryStatus status = 5;
  repeated Tag tags = 6;
  repeated Metadata metadata = 7;
  Timestamp created_at = 8;
  Timestamp updated_at = 9;
}

// CRUD Messages
message CreateRepositoryRequest {
  string name = 1;
  string description = 2;
  RepositoryType type = 3;
}

message CreateRepositoryResponse {
  Repository repository = 1;
}

message ListRepositoriesRequest {
  PaginationRequest pagination = 1;
}

message ListRepositoriesResponse {
  repeated Repository repositories = 1;
  PaginationResponse pagination = 2;
}
```

## Code Generation

```bash
# Generate JavaScript and TypeScript
pnpm run generate

# Clean generated files
pnpm run clean

# Full rebuild
pnpm run build
```

### Generation Script
```json
{
  "scripts": {
    "generate": "pbjs -t static-module -w es6 -o generated/proto.js proto/*.proto && pbts -o generated/proto.d.ts generated/proto.js",
    "clean": "rm -rf generated/*",
    "build": "pnpm run clean && pnpm run generate"
  }
}
```

## Usage

### In Backend (JavaScript)
```javascript
import { Repository, RepositoryType } from '@internal/rule_tree_table-proto';

const repo = Repository.create({
  name: 'my-repo',
  type: RepositoryType.REPOSITORY_TYPE_GIT,
});

// Encode for transmission
const buffer = Repository.encode(repo).finish();

// Decode received data
const decoded = Repository.decode(buffer);
```

### In Frontend (TypeScript)
```typescript
import type { Repository, RepositoryType } from '@internal/rule_tree_table-proto';

interface Props {
  repository: Repository;
}

function RepositoryCard({ repository }: Props) {
  return <div>{repository.name}</div>;
}
```

## Best Practices

1. **Always version your protos**: Use field numbers consistently
2. **Use enums for fixed values**: Avoid magic strings/numbers
3. **Include common.proto**: Reuse pagination, timestamps, errors
4. **Regenerate after changes**: Run `pnpm run build`
5. **Don't edit generated files**: They will be overwritten

## Adding New Entities

1. Create `proto/new_entity.proto`
2. Import common types: `import "common.proto";`
3. Define entity message and CRUD messages
4. Run `pnpm run build`
5. Export from `src/index.mjs`

## Related Components

- Used by: `../backend`, `../frontend`, `../frontend-admin`
- Maps to: `../sequelize` models
