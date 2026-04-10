# Figma Files API

REST API for managing Figma files, tags, and metadata with dual JSON/Protobuf serialization support.

## Base URL

```
http://localhost:3000/api/figma-files
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

## Figma Files

### List Figma Files

```
GET /files
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | integer | Page number (default: 1) |
| `limit` | integer | Items per page (default: 20, max: 100) |
| `type` | string | Filter by type: `design_system`, `component_library`, `prototype`, `illustration`, `icon_set` |
| `status` | string | Filter by status: `stable`, `beta`, `deprecated`, `experimental` |
| `search` | string | Search in name and description |
| `tags` | string | Comma-separated tag names |
| `trending` | boolean | Filter trending files |
| `verified` | boolean | Filter verified files |
| `editor_type` | string | Filter by editor: `figma`, `figjam` |
| `include_tags` | boolean | Include associated tags (default: false) |
| `include_metadata` | boolean | Include associated metadata (default: false) |

**Example Request:**
```bash
curl "http://localhost:3000/api/figma-files/files?type=design_system&verified=true&include_tags=true"
```

**Protobuf Message:** `figma_files.figma_file.ListFigmaFilesResponse`

---

### Get Figma File

```
GET /files/:id
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `include_tags` | boolean | Include associated tags (default: true) |
| `include_metadata` | boolean | Include associated metadata (default: true) |

**Protobuf Message:** `figma_files.figma_file.GetFigmaFileResponse`

---

### Create Figma File

```
POST /files
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Unique file name |
| `type` | string | Yes | `design_system`, `component_library`, `prototype`, `illustration`, `icon_set` |
| `description` | string | No | File description |
| `figma_url` | string | No | Figma file URL |
| `figma_file_key` | string | No | Figma file key identifier |
| `thumbnail_url` | string | No | Preview image URL |
| `page_count` | integer | No | Number of pages |
| `component_count` | integer | No | Number of components |
| `style_count` | integer | No | Number of styles |
| `last_modified_by` | string | No | Last editor name/email |
| `editor_type` | string | No | `figma` or `figjam` |
| `trending` | boolean | No | Is trending |
| `verified` | boolean | No | Is verified |
| `status` | string | No | `stable`, `beta`, `deprecated`, `experimental` |
| `source` | string | No | `figma`, `figma_community`, `manual` |
| `external_ids` | array | No | Array of `[registry, id]` pairs |
| `tag_names` | array | No | Tag names to associate (creates if not exist) |

**Protobuf Message:** `figma_files.figma_file.CreateFigmaFileResponse`

---

### Update Figma File

```
PUT /files/:id
```

**Request Body:** Same fields as Create (all optional)

**Protobuf Message:** `figma_files.figma_file.UpdateFigmaFileResponse`

---

### Delete Figma File

```
DELETE /files/:id
```

Deletes the file and all associated metadata. Tag associations are removed but tags themselves are preserved.

**Protobuf Message:** `figma_files.figma_file.DeleteFigmaFileResponse`

---

## Tags

### List Tags

```
GET /tags
```

Returns all tags sorted alphabetically.

**Protobuf Message:** `figma_files.tag.TagListResponse`

### Get Tag — `GET /tags/:id`
### Create Tag — `POST /tags`
### Update Tag — `PUT /tags/:id`
### Delete Tag — `DELETE /tags/:id`

---

## Metadata

### List Metadata for Figma File

```
GET /files/:figmaFileId/metadata
```

**Protobuf Message:** `figma_files.metadata.MetadataListResponse`

### Get Metadata — `GET /metadata/:id`
### Create Metadata — `POST /files/:figmaFileId/metadata`
### Update Metadata — `PUT /metadata/:id`
### Delete Metadata — `DELETE /metadata/:id`

---

## Enums

### Figma File Type

| Value | Name | Description |
|-------|------|-------------|
| 0 | UNSPECIFIED | Not specified |
| 1 | DESIGN_SYSTEM | Design system |
| 2 | COMPONENT_LIBRARY | Component library |
| 3 | PROTOTYPE | Prototype |
| 4 | ILLUSTRATION | Illustration |
| 5 | ICON_SET | Icon set |

### Figma File Status

| Value | Name | Description |
|-------|------|-------------|
| 0 | UNSPECIFIED | Not specified |
| 1 | STABLE | Production ready |
| 2 | BETA | Beta release |
| 3 | DEPRECATED | No longer maintained |
| 4 | EXPERIMENTAL | Experimental |

### Figma File Source

| Value | Name | Description |
|-------|------|-------------|
| 0 | UNSPECIFIED | Not specified |
| 1 | FIGMA | Figma |
| 2 | FIGMA_COMMUNITY | Figma Community |
| 3 | MANUAL | Manually added |

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
