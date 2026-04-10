# LangGraph Static Flow

Visual workflow orchestration platform for designing, executing, and managing LangGraph-based pipelines with human-in-the-loop feedback, checkpoint persistence, and multi-format interoperability.

## Architecture

### Execution Model

**Sequential Execution (Linear)** — default mode. Nodes execute one after another. Each node completes its full lifecycle before the next begins. The graph waits for a node to finish, updates shared state, and passes it forward.

**Non-Sequential Execution (Parallel / Concurrent)** — future enhancement. Fan-out branching, conditional multi-target, or Map-Reduce (Send API). State reducers handle concurrent merges.

### Stage Model

A **Stage** is a top-level container that wraps a single graph node. It provides an abstraction layer so the parent workflow treats all sub-processes uniformly — regardless of whether the work inside is done by an LLM, a chain, or plain application logic.

Each Stage has a **three-phase lifecycle**:

```
BEFORE (pre-execution)     → user provides input, approves continuation
EXECUTION (presentation)   → node handler runs its operations
AFTER (post-execution)     → user reviews results, provides feedback
```

Which phases are active is controlled per-node via `interruptBehavior`:

- `bypass` — no interrupts, execute and continue
- `before` — pause before execution (user input / checkpoint gate)
- `after` — pause after execution (presentation / review)
- `both` — pause before and after

### Threaded Isolation

Each Stage owns its own **Thread (Execution Instance)** with an isolated `thread_id`. This gives each stage:

- Its own checkpointer memory — internal state, message history, and iteration data do not bleed into the parent graph unless explicitly returned
- The ability to run complex, multi-turn loops internally without polluting global state
- A self-contained scope for sub-processes

### Agnostic Sub-Processes

A Stage can wrap any execution engine:

- **LangGraph** — a `CompiledGraph` (subgraph) running its own cyclical agentic loop
- **LangChain** — a linear `Runnable` (prompt → LLM → output chain)
- **Promises** — a standard async function (API call, database query, webhook, script)

The orchestration system treats them identically — it dispatches to the Stage and waits for resolution.

## Workflow Lifecycle

```
Spec → Schema → Contract → Instance (Release) → Deployment
```

| Phase          | What it is                                                                    |
| -------------- | ----------------------------------------------------------------------------- |
| **Spec**       | Preset template definition (nodes, edges, conditions, g11n)                   |
| **Schema**     | User-customized workflow created from a spec via the review page              |
| **Contract**   | Validated, frozen schema with derived interrupt arrays and resolved overrides |
| **Instance**   | A deep-cloned snapshot of the contract, bound to an execution context         |
| **Release**    | Instance running in sandbox mode (default — all workflows start here)         |
| **Deployment** | Instance promoted to live execution                                           |

## Core Capabilities

### Workflow Design

- Visual graph editor (React Flow / @xyflow/react) with interactive node/edge manipulation
- Dagre-based auto-layout for node positioning
- Node CRUD — create, edit, reorder, delete nodes with category, handler, style, icon, and interrupt behavior
- Edge CRUD — wire connections between nodes, assign conditions to edges
- Condition CRUD — field/operator/value logic with true/false routing targets

### Template System

- Preset workflow templates (Reflection Studio, Simple Pipeline, Dual Review, Vulnerability Resolver)
- Review page for customizing templates before creation — override node labels, handlers, categories, interrupt behaviors, conditions, edges, g11n strings
- Per-node interrupt type selection: standard (textarea), data_source_input (CSV/API), schema_mapping (column-to-field), presentation (read-only), feedback (textarea), review (approve/reject)

### Graph Execution

- Client-side LangGraph compilation from JSON graph definition
- Step-by-step iteration tracking with stage history
- Abort/stop mid-execution
- Condition evaluation engine — supports `gte`, `gt`, `lte`, `lt`, `eq`, `neq`, `includes`, `startsWith` operators with dot-path field resolution and `config.*` / `state.*` threshold references
- Sequential gate: when resuming from `interruptAfter`, the system checks whether the next node has `interruptBefore` and pauses at the gate instead of skipping it

### Human-in-the-Loop Feedback

- Interrupt-based feedback collection at configured nodes
- Specialized feedback panels by interrupt type:
  - **Data source input** — tabbed CSV paste / API endpoint entry with sample data loader
  - **Schema mapping** — column-to-field mapping UI with auto-suggested mappings and data preview table
  - **Presentation** — structured read-only display (validation results, update summaries) with pagination
  - **Checkpoint** — minimal gate panel for `interruptBefore` nodes (continue or leave)
  - **Review** — approve/reject with optional notes
  - **Standard** — freeform textarea with skip option
- Feedback messages injected into graph state as `HumanMessage` for downstream consumption

### Checkpoint System

- Save execution snapshots at every interrupt point (thread ID, topic, stage, iterations, stage history, timestamp)
- Load and browse all checkpoints per session
- Checkpoint diff comparison — select two checkpoints to compare state
- Session-scoped graph definition snapshots (persisted once per thread)

### Workflow Runs

- Run tracking per instance — each execution creates a workflow run with unique thread ID
- Task-level run recording — every node execution logged with nodeId, stage, content, iteration, status, timestamp
- Run status lifecycle: idle → running → paused → completed / stopped / failed

### Stage Navigator

- Horizontal scrollable timeline of execution steps
- Status derivation per card: pass, failed, skip, pending, block
- Active group highlighting based on current stage
- Edge-order walk for correct step sequencing (follows graph topology, not node array order)
- Future step projection from graph definition
- Synthetic stages for user interactions (feedback_submitted)

### Iteration Timeline

- Chronological list of all iterations with stage, content preview, and timestamps
- Expandable content cards per iteration
- Run-scoped and checkpoint-scoped views

### Version Control

- Flow versions stored in database with rollback support
- Version history per flow with change summaries
- Restore to any previous version

### Import / Export

- **Import**: native JSON, Flowise, Langflow formats
- **Export**: native JSON, Flowise, Langflow, Mermaid diagram

### Localization (g11n)

- Template string system with `{placeholder}` interpolation and dot-path context resolution
- Cascade resolver: node-level override → root g11n default → empty string fallback
- Per-node g11n sections: feedback, timeline, navigator
- App-level placeholders for all UI strings (100+ keys)
- Backend string template CRUD with locale, context, and flow scoping

## Persistence

### Storage Adapters

- **PostgreSQL** (default) — proxies KV operations through backend API (`/api/langgraph-static-flow/kv`)
- **localStorage** — browser-based fallback for demos/offline use
- Runtime-switchable via settings panel

### Storage Key Schema

| Pattern                       | Contents                               |
| ----------------------------- | -------------------------------------- |
| `workflow_<id>`               | Full workflow definition               |
| `workflow_index`              | Array of workflow index entries        |
| `workflow_active_id`          | Currently active workflow ID           |
| `instance_<id>`               | Frozen workflow snapshot for execution |
| `instance_index`              | Array of instance index entries        |
| `instance_active_id`          | Currently active instance ID           |
| `wfrun_<id>`                  | Workflow run record                    |
| `wfrun_index_<instanceId>`    | Run index for an instance              |
| `taskrun_<workflowRunId>`     | Task runs within a workflow run        |
| `checkpoint_<threadId>_<ts>`  | Execution checkpoint snapshot          |
| `session_graphdef_<threadId>` | Session-scoped graph definition        |

## Backend API

Fastify plugin-based service under `/api/langgraph-static-flow/`.

| Resource             | Endpoints                                    | Purpose                               |
| -------------------- | -------------------------------------------- | ------------------------------------- |
| **Flows**            | CRUD + versions + restore + preview + review | Workflow definition management        |
| **Nodes**            | CRUD scoped to flow                          | Node management within flows          |
| **Conditions**       | CRUD scoped to flow                          | Conditional logic management          |
| **Sessions**         | CRUD + checkpoint + stage recording          | Execution session tracking            |
| **Templates**        | CRUD + slug lookup + create-flow             | Template management and instantiation |
| **Import/Export**    | POST import, GET export                      | Multi-format flow interchange         |
| **String Templates** | CRUD + resolve + bulk-upsert                 | Localized string management           |
| **KV Store**         | GET/PUT/DELETE by key, list by prefix, clear | Persistent key-value storage          |

## Database Table Schema

Table prefix: `lgsf_`

| Model               | Key Fields                                                                        | Purpose                      |
| ------------------- | --------------------------------------------------------------------------------- | ---------------------------- |
| **Flow**            | name, description, viewport, flow_data (JSONB), source_format                     | Workflow definitions         |
| **FlowVersion**     | flow_id, version, flow_data (JSONB), change_summary                               | Version history              |
| **WorkflowSession** | flow_id, thread_id, status, iterations, current_stage, stage_history, checkpoints | Execution sessions           |
| **StringTemplate**  | flow_id, locale, context, key, value                                              | Localized template strings   |
| **KvStore**         | key (PK), value (JSONB)                                                           | Frontend session persistence |

## Tech Stack

| Layer        | Technology                                                        |
| ------------ | ----------------------------------------------------------------- |
| Frontend     | React 18.x, React Router 7, Zustand 5, @xyflow/react 12, Tailwind 4 |
| Graph Engine | @langchain/langgraph, @langchain/core                             |
| Auto-Layout  | dagre                                                             |
| Backend      | Fastify 5, @fastify/sensible, @fastify/static                     |
| Database     | PostgreSQL via Sequelize (UUID PKs, underscored, JSONB)           |
| Build        | Vite                                                              |
