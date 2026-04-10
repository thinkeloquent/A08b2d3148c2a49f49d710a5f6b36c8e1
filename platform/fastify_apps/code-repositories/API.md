# Code Repositories API

REST API for managing code repositories, tags, and metadata with dual JSON/Protobuf serialization support.

## Base URL

```
http://localhost:3000/api/code-repositories
```

## Content Negotiation

The API supports both JSON and Protocol Buffers serialization.

### JSON (Default)

Standard JSON request/response. No special headers required.

### Protobuf

To receive protobuf responses:
```
Accept: application/protobuf
X-Proto-Message: <message_type>
```

To send protobuf requests:
```
Content-Type: application/protobuf
X-Proto-Message: <message_type>
```

---

## Repositories

### List Repositories

```
GET /repos
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | integer | Page number (default: 1) |
| `limit` | integer | Items per page (default: 20, max: 100) |
| `type` | string | Filter by type: `npm`, `docker`, `python` |
| `status` | string | Filter by status: `stable`, `beta`, `deprecated`, `experimental` |
| `search` | string | Search in name and description |
| `tags` | string | Comma-separated tag names |
| `trending` | boolean | Filter trending repositories |
| `verified` | boolean | Filter verified repositories |
| `include_tags` | boolean | Include associated tags (default: false) |
| `include_metadata` | boolean | Include associated metadata (default: false) |

**Example Request:**
```bash
curl "http://localhost:3000/api/code-repositories/repos?type=npm&trending=true&include_tags=true"
```

**Example Response:**
```json
{
  "repositories": [
    {
      "id": "571a2bf4-379b-4131-898f-fdcef19406ff",
      "name": "@fastify/core",
      "description": "Fast and low overhead web framework",
      "type": 1,
      "githubUrl": "https://github.com/fastify/fastify",
      "packageUrl": "https://www.npmjs.com/package/fastify",
      "stars": 28453,
      "forks": 2145,
      "version": "4.26.0",
      "maintainer": "Fastify Team",
      "lastUpdated": "2 days ago",
      "trending": true,
      "verified": true,
      "language": "JavaScript",
      "license": "MIT",
      "size": "542 KB",
      "dependencies": 12,
      "healthScore": 98,
      "status": 1,
      "source": 5,
      "externalIds": [
        { "registry": "npm", "id": "@fastify/core" },
        { "registry": "github", "id": "fastify/fastify" }
      ],
      "tags": [],
      "metadata": [],
      "createdAt": { "iso8601": "2026-02-03T04:59:31.103Z" },
      "updatedAt": { "iso8601": "2026-02-03T04:59:31.103Z" }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 8,
    "totalPages": 1
  }
}
```

**Protobuf Message:** `code_repositories.repository.ListRepositoriesResponse`

---

### Get Repository

```
GET /repos/:id
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | uuid | Repository UUID |

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `include_tags` | boolean | Include associated tags (default: true) |
| `include_metadata` | boolean | Include associated metadata (default: true) |

**Example Request:**
```bash
curl "http://localhost:3000/api/code-repositories/repos/571a2bf4-379b-4131-898f-fdcef19406ff"
```

**Example Response:**
```json
{
  "repository": {
    "id": "571a2bf4-379b-4131-898f-fdcef19406ff",
    "name": "@fastify/core",
    "description": "Fast and low overhead web framework",
    "type": 1,
    "tags": [
      { "id": 1, "name": "backend" },
      { "id": 2, "name": "nodejs" }
    ],
    "metadata": [
      { "id": 1, "name": "README", "contentType": "text/markdown" }
    ]
  }
}
```

**Protobuf Message:** `code_repositories.repository.GetRepositoryResponse`

---

### Create Repository

```
POST /repos
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Unique repository name |
| `type` | string | Yes | `npm`, `docker`, or `python` |
| `description` | string | No | Repository description |
| `github_url` | string | No | GitHub repository URL |
| `package_url` | string | No | Package registry URL |
| `stars` | integer | No | Star count |
| `forks` | integer | No | Fork count |
| `version` | string | No | Current version |
| `maintainer` | string | No | Maintainer name |
| `last_updated` | string | No | Last update timestamp |
| `trending` | boolean | No | Is trending |
| `verified` | boolean | No | Is verified |
| `language` | string | No | Primary language |
| `license` | string | No | License type |
| `size` | string | No | Package size |
| `dependencies` | integer | No | Dependency count |
| `health_score` | integer | No | Health score (0-100) |
| `status` | string | No | `stable`, `beta`, `deprecated`, `experimental` |
| `source` | string | No | `github`, `npm`, `dockerhub`, `pypi`, `manual` |
| `external_ids` | array | No | Array of `[registry, id]` pairs |
| `tag_names` | array | No | Tag names to associate (creates if not exist) |

**Example Request:**
```bash
curl -X POST "http://localhost:3000/api/code-repositories/repos" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "my-package",
    "type": "npm",
    "description": "A useful package",
    "github_url": "https://github.com/user/my-package",
    "stars": 100,
    "tag_names": ["nodejs", "utility"]
  }'
```

**Example Response (201 Created):**
```json
{
  "repository": {
    "id": "78a4b677-c866-4305-bce3-d23a22c422b0",
    "name": "my-package",
    "description": "A useful package",
    "type": 1,
    "tags": [
      { "id": 2, "name": "nodejs" },
      { "id": 40, "name": "utility" }
    ]
  }
}
```

**Protobuf Message:** `code_repositories.repository.CreateRepositoryResponse`

---

### Update Repository

```
PUT /repos/:id
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | uuid | Repository UUID |

**Request Body:** Same fields as Create (all optional)

**Example Request:**
```bash
curl -X PUT "http://localhost:3000/api/code-repositories/repos/78a4b677-c866-4305-bce3-d23a22c422b0" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Updated description",
    "stars": 150,
    "tag_names": ["nodejs", "backend"]
  }'
```

**Example Response:**
```json
{
  "repository": {
    "id": "78a4b677-c866-4305-bce3-d23a22c422b0",
    "name": "my-package",
    "description": "Updated description",
    "stars": 150
  }
}
```

**Protobuf Message:** `code_repositories.repository.UpdateRepositoryResponse`

---

### Delete Repository

```
DELETE /repos/:id
```

Deletes the repository and all associated metadata. Tag associations are removed but tags themselves are preserved.

**Example Request:**
```bash
curl -X DELETE "http://localhost:3000/api/code-repositories/repos/78a4b677-c866-4305-bce3-d23a22c422b0"
```

**Example Response:**
```json
{
  "success": true
}
```

**Protobuf Message:** `code_repositories.repository.DeleteRepositoryResponse`

---

## Tags

### List Tags

```
GET /tags
```

Returns all tags sorted alphabetically.

**Example Request:**
```bash
curl "http://localhost:3000/api/code-repositories/tags"
```

**Example Response:**
```json
{
  "tags": [
    { "id": 1, "name": "backend", "createdAt": { "iso8601": "..." }, "updatedAt": { "iso8601": "..." } },
    { "id": 2, "name": "nodejs", "createdAt": { "iso8601": "..." }, "updatedAt": { "iso8601": "..." } }
  ]
}
```

**Protobuf Message:** `code_repositories.tag.TagListResponse`

---

### Get Tag

```
GET /tags/:id
```

**Example Request:**
```bash
curl "http://localhost:3000/api/code-repositories/tags/1"
```

**Example Response:**
```json
{
  "tag": {
    "id": 1,
    "name": "backend",
    "createdAt": { "iso8601": "2026-02-03T04:59:31.152Z" },
    "updatedAt": { "iso8601": "2026-02-03T04:59:31.152Z" }
  }
}
```

**Protobuf Message:** `code_repositories.tag.GetTagResponse`

---

### Create Tag

```
POST /tags
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Unique tag name |

**Example Request:**
```bash
curl -X POST "http://localhost:3000/api/code-repositories/tags" \
  -H "Content-Type: application/json" \
  -d '{"name": "new-tag"}'
```

**Example Response (201 Created):**
```json
{
  "tag": {
    "id": 41,
    "name": "new-tag"
  }
}
```

**Protobuf Message:** `code_repositories.tag.CreateTagResponse`

---

### Update Tag

```
PUT /tags/:id
```

**Example Request:**
```bash
curl -X PUT "http://localhost:3000/api/code-repositories/tags/41" \
  -H "Content-Type: application/json" \
  -d '{"name": "renamed-tag"}'
```

**Protobuf Message:** `code_repositories.tag.UpdateTagResponse`

---

### Delete Tag

```
DELETE /tags/:id
```

**Example Request:**
```bash
curl -X DELETE "http://localhost:3000/api/code-repositories/tags/41"
```

**Protobuf Message:** `code_repositories.tag.DeleteTagResponse`

---

## Metadata

### List Metadata for Repository

```
GET /repos/:repoId/metadata
```

**Example Request:**
```bash
curl "http://localhost:3000/api/code-repositories/repos/571a2bf4-379b-4131-898f-fdcef19406ff/metadata"
```

**Example Response:**
```json
{
  "items": [
    {
      "id": 1,
      "name": "README",
      "contentType": "text/markdown",
      "sourceUrl": "https://raw.githubusercontent.com/...",
      "sourceHashId": "abc123...",
      "labels": ["documentation", "readme"],
      "repositoryId": "571a2bf4-379b-4131-898f-fdcef19406ff",
      "createdAt": { "iso8601": "..." },
      "updatedAt": { "iso8601": "..." }
    }
  ]
}
```

**Protobuf Message:** `code_repositories.metadata.MetadataListResponse`

---

### Get Metadata

```
GET /metadata/:id
```

**Example Request:**
```bash
curl "http://localhost:3000/api/code-repositories/metadata/1"
```

**Protobuf Message:** `code_repositories.metadata.GetMetadataResponse`

---

### Create Metadata

```
POST /repos/:repoId/metadata
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Metadata name |
| `content_type` | string | No | MIME type |
| `source_url` | string | No | Original source URL |
| `source_hash_id` | string | No | SHA-256 hash for change detection |
| `labels` | array | No | Array of label strings |

**Example Request:**
```bash
curl -X POST "http://localhost:3000/api/code-repositories/repos/571a2bf4-379b-4131-898f-fdcef19406ff/metadata" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "API Documentation",
    "content_type": "text/markdown",
    "source_url": "https://example.com/docs",
    "labels": ["api-docs", "reference"]
  }'
```

**Protobuf Message:** `code_repositories.metadata.CreateMetadataResponse`

---

### Update Metadata

```
PUT /metadata/:id
```

**Example Request:**
```bash
curl -X PUT "http://localhost:3000/api/code-repositories/metadata/1" \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Name", "labels": ["updated"]}'
```

**Protobuf Message:** `code_repositories.metadata.UpdateMetadataResponse`

---

### Delete Metadata

```
DELETE /metadata/:id
```

**Example Request:**
```bash
curl -X DELETE "http://localhost:3000/api/code-repositories/metadata/1"
```

**Protobuf Message:** `code_repositories.metadata.DeleteMetadataResponse`

---

## Enums

### Repository Type

| Value | Name | Description |
|-------|------|-------------|
| 0 | UNSPECIFIED | Not specified |
| 1 | NPM | Node.js package |
| 2 | DOCKER | Docker image |
| 3 | PYTHON | Python package |

### Repository Status

| Value | Name | Description |
|-------|------|-------------|
| 0 | UNSPECIFIED | Not specified |
| 1 | STABLE | Production ready |
| 2 | BETA | Beta release |
| 3 | DEPRECATED | No longer maintained |
| 4 | EXPERIMENTAL | Experimental |

### Repository Source

| Value | Name | Description |
|-------|------|-------------|
| 0 | UNSPECIFIED | Not specified |
| 1 | GITHUB | GitHub |
| 2 | NPM | npm registry |
| 3 | DOCKERHUB | Docker Hub |
| 4 | PYPI | Python Package Index |
| 5 | MANUAL | Manually added |

---

## Error Responses

All errors return a consistent format:

```json
{
  "code": 404,
  "message": "Repository not found"
}
```

### Common Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 404 | Not Found |
| 409 | Conflict (duplicate name) |
| 500 | Internal Server Error |

---

## Protobuf Usage Example

```bash
# Request with protobuf response
curl "http://localhost:3000/api/code-repositories/repos" \
  -H "Accept: application/protobuf" \
  -H "X-Proto-Message: code_repositories.repository.ListRepositoriesResponse" \
  -o response.bin

# Decode with protoc (if installed)
protoc --decode=code_repositories.repository.ListRepositoriesResponse \
  proto/code_repository.proto < response.bin
```

---

## Architecture

### Database Connection Lifecycle

The Sequelize connection is managed by the fastify_server lifecycle system:

```
fastify_server/config/lifecycle/105-sequelize.lifecycle.mjs
```

This lifecycle hook:
- Initializes the Sequelize connection on server startup
- Decorates the server with `server.db` containing models
- Handles graceful shutdown and connection cleanup

When running standalone (via `server.test.mjs`), the database plugin falls back to local initialization.

### Project Structure

```
code-repositories/
├── API.md                    # This documentation
├── backend/
│   └── src/
│       ├── index.mjs         # Main plugin entry point
│       ├── plugins/
│       │   ├── database.mjs  # DB decorator (uses lifecycle or standalone)
│       │   └── content-negotiation.mjs
│       ├── routes/           # CRUD endpoints
│       ├── services/         # Business logic
│       └── serializers/      # Model <-> Proto converters
├── protobuf/
│   ├── proto/                # Proto definitions
│   ├── generated/            # Generated JS
│   └── src/index.mjs         # Exports
└── sequelize/
    ├── models/               # Sequelize model definitions
    ├── setup.mjs             # Create tables
    ├── seed.mjs              # Populate test data
    └── teardown.mjs          # Drop tables
```

---

## Development

### Setup Database

```bash
cd sequelize
npm run setup    # Create tables
npm run seed     # Populate test data
npm run teardown # Drop tables
npm run reset    # Teardown + setup + seed
```

### Start Server

```bash
cd backend
npm run app:dev   # Development with watch mode
npm run app:start # Production
```

### Regenerate Protobuf

```bash
cd protobuf
npm run generate
```
