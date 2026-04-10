# LLM Project Instruction Specification

1. Global Context & Objective
   This section defines the "North Star" for the LLM regardless of the current step.
   Role: (e.g., Senior Full-Stack Engineer, Expert Technical Writer)
   Primary Goal: [Insert the high-level outcome Specific to the executed STEP]

2. Execution Protocol
   Instruction: You must follow the execution flow in a STEP-by-STEP sequence.
   Begin at STEP 1.
   Do not proceed to STEP X+1 until the requirements for STEP X are fully satisfied.
   Each step contains a dedicated Sub-Instruction Block that overrides or specifies details for that phase.

3. Output State Management
   To ensure the LLM tracks its progress, instruct it to include a "Progress Header" in every response:
   Current Phase: `[STEP X]`
   Status: `[In Progress / Completed]`
   Next Step: `[STEP Y]`

   Tips for "Sub-Instruction" Markdown Blocks:
   Isolation: Use the > blockquote or a fenced code block to visually separate the step-specific rules from the general prompt.

   Negative Constraints: Use the sub-instruction to tell the LLM what not to do during that specific step (e.g., "In Step 1, do not write any code").

   Verification: End each step's instruction with a "Success Criteria" list so the LLM can self-verify before moving on.

4. Step-by-Step Execution Below:

## STEP 1: Architecture Decomposition & Data-Flow Contract

```md
Step-Specific Instructions:

1. Extract the system boundaries from the provided architecture image:
   - Identify: clients, edge/API layer, services, queues/topics, databases, external providers.
   - Label each component with a short role (e.g., "Auth", "Ingest", "Orchestrator", "Worker", "Admin UI").

2. Produce a Mermaid.js diagram that mirrors the image:
   - Use subgraphs for boundary grouping (Client / API / Core Services / Data Stores / External).
   - Show only directional data flow (requests, events, async jobs, callbacks).
   - Annotate each edge with:
     - protocol/type: HTTP, webhook, event, cron, internal call
     - payload name (high level): "SpecRequest", "JobCreated", "AuditEvent", etc.

3. Define the “Data Contracts” list (no code):
   - For every edge in the diagram, add a short contract entry:
     - producer → consumer
     - payload name
     - required fields (bullet list)
     - idempotency key / correlation id expectation
     - auth context (user, service, system)

4. Declare non-functional constraints implied by the diagram:
   - security boundaries (public vs internal)
   - tenancy model (single-tenant/multi-tenant)
   - audit/trace requirements
   - failure modes (retry, DLQ, timeouts) at a policy level

Output:

- Mermaid diagram
- Data Contracts list (per edge)
- Assumptions & open questions list (only what’s missing from the image)

Note:

- Focus only on data flow and contracts; do not write implementation code..
```

## STEP 2: Domain Model & Persistence Schema

```md
Step-Specific Instructions:

1. Map the Step 1 "Data Contracts" into domain entities:
   - Identify which payloads become persisted records vs transient messages.
   - Normalize around stable identifiers (tenant_id, user_id, correlation_id, job_id, revision_id).

2. Define SQLAlchemy models aligned to the diagram’s data stores:
   - One model per core entity + association tables as needed.
   - Include base mixins where appropriate:
     - timestamps (created_at, updated_at)
     - soft delete (deleted_at) if implied
     - audit fields (created_by, updated_by) if implied
     - tenancy (tenant_id) if implied

3. For every model:
   - Add PEP 8 compliant naming
   - Add docstrings at class + field level describing:
     - meaning, constraints, example values
     - indexing/uniqueness intent
     - relationships and cascade behavior
   - Define explicit constraints:
     - unique constraints, foreign keys, check constraints
     - enum types where applicable

4. Add “Operational Tables” if implied by the architecture:
   - outbox/event log (if async/event-driven)
   - job table + job_runs (if workers exist)
   - audit_log table (if compliance/trace required)
   - dead_letter table (if DLQ is logical not infra)

Output:

- SQLAlchemy model module(s)
- ERD-style Mermaid diagram (optional but recommended) showing table relations
- Migration notes (what needs Alembic revisions)

Note:

- Still no API code. This step is schema correctness + documentation quality.
```

## STEP 3: API Surface & Service Interfaces

```md
Step-Specific Instructions:

1. Implement FastAPI endpoints that match the architecture boundaries:
   - Separate routers by domain (e.g., /jobs, /specs, /artifacts, /admin).
   - Enforce the public/internal split (e.g., internal-only routes or separate app).

2. Apply dependency injection consistently:
   - db session dependency
   - auth/tenant context dependency
   - request correlation id dependency (traceability)

3. For each endpoint:
   - Define request/response Pydantic schemas (no ORM leakage).
   - Include response models and explicit status codes.
   - Add examples for:
     - 200 success
     - 404 not found
     - (recommended if applicable) 400 validation, 401/403 auth, 409 conflict

4. Encode system behavior implied by the diagram:
   - If async: endpoint returns job_id + status URL; worker updates status.
   - If webhook/callback: verify signature + idempotency key handling.
   - If event/outbox: write record + enqueue publish (transactional boundary).

5. Add minimal cross-cutting requirements:
   - structured logging with correlation_id
   - consistent error envelope (code, message, correlation_id)
   - pagination/filtering for list endpoints
   - health/readiness endpoints if shown in the diagram

Output:

- FastAPI routers, schemas, dependencies
- OpenAPI tags grouped by domain
- Example responses embedded in OpenAPI (200/404 required)

Note:

- Keep business logic thin in controllers; push to service layer functions.
```
