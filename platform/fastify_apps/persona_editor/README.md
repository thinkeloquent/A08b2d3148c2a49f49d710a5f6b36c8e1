# Persona Editor

The persona editor app lets users browse, create, and manage AI personas. It serves two audiences:

- **Admin (Template Architect)** — creates and maintains persona templates, manages LLM defaults, reviews audit logs
- **User (Consumer/Cloner)** — browses published templates, clones them into personal personas, customizes clones

## Route Map

| Route | Purpose |
|-------|---------|
| `/apps/persona-editor/*` | Public frontend — browse templates, manage cloned personas |
| `/admin/apps/persona-editor/*` | Admin dashboard — manage persona templates, LLM defaults, audit logs |
| `/~/api/persona_editor` | Public API — read templates, clone, manage own personas |
| `/~/api/persona_editor/admin` | Admin API — CRUD on templates (admin-only) |

## Template/Clone Pattern

The persona editor uses a **Prototype (Template/Clone)** pattern to separate authoring from consumption.

- **Templates** (`is_template = true`): Master copies managed by admins. Read-only for regular users.
- **Instances/Clones** (`is_template = false`): Created by users from templates. Owned and fully editable by the cloning user.
- **Lineage**: `parent_template_id` links each clone back to its source template.
- **Drift**: Disconnected — updating a template does **not** propagate changes to existing clones.

## Admin API Endpoints

Prefix: `/~/api/persona_editor/admin`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/templates` | List all persona templates |
| GET | `/templates/:id` | Get template by ID |
| POST | `/templates` | Create a new persona template |
| PUT | `/templates/:id` | Update a persona template |
| DELETE | `/templates/:id` | Delete a persona template |

## Public API Endpoints

Prefix: `/~/api/persona_editor`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Service info |
| GET | `/personas` | List user's personas (clones) |
| GET | `/personas/:id` | Get persona by ID |
| POST | `/personas` | Create persona (from scratch) |
| PUT | `/personas/:id` | Update persona |
| DELETE | `/personas/:id` | Delete persona |
| GET | `/personas/:id/audit-logs` | Get audit logs for persona |
| GET | `/templates` | Browse available templates (read-only) |
| POST | `/personas/clone` | Clone a template into a new persona |
| GET | `/llm-defaults` | List all LLM defaults |
| GET | `/llm-defaults/category/:category` | Get defaults by category |
| GET | `/llm-defaults/:id` | Get default by ID |
| POST | `/llm-defaults` | Create default |
| PUT | `/llm-defaults/:id` | Update default |
| DELETE | `/llm-defaults/:id` | Delete default |
| GET | `/health` | Basic health check |
| GET | `/health/detailed` | Detailed health + DB status |

## Data Model Changes (Planned)

Fields to be added to the Persona model:

| Field | Type | Description |
|-------|------|-------------|
| `is_template` | BOOLEAN (default: false) | Distinguishes templates from clones |
| `parent_template_id` | STRING(50), nullable | Links clone to source template |
| `owner_id` | STRING(100), nullable | User who owns the clone |

## Clone Operation Flow

1. User calls `POST /~/api/persona_editor/personas/clone` with `{ template_id, new_name }`
2. Backend fetches the template record
3. Deep copies all data fields (JSONB arrays, nested objects)
4. Strips the template's `id`, generates a new `persona-{uuid}`
5. Sets `is_template = false`, `parent_template_id = template.id`, `owner_id = current user`
6. Returns the new persona instance

## Architecture Notes

- **Plugin registration**: Loaded via lifecycle hooks at `fastify_server/config/lifecycle/` in numeric prefix order
- **Error handler pattern**: Uses direct function calls (not fp-wrapped plugins) to stay within the encapsulated scope
- **Database**: Sequelize with JSONB fields; persona IDs follow the `persona-{uuid}` convention
