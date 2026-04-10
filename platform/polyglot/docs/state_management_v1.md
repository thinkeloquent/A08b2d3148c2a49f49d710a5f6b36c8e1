# State Management v1.0 Usage Guide

This document outlines the usage of the v800 State Management system, which unifies Request State and Platform Context across FastAPI (Python) and Fastify (Node.js).

## Core Concepts

The system handles two distinct types of state:

1.  **Finite State (Mode)**: A serializable string representing the current state of the request (e.g., "idle", "processing", "error").
2.  **Extended State (Context)**: A data bag for application-specific data.
3.  **Platform Context**: System-level tools (`sharedContext`, `registry`, `sdk`) available to the request.

---

## 1. Request State Machine (`request.state`)

Both frameworks provide a `request.state` object (StateContainer) initialized from `config.initial_state`.

### Configuration
Define `initial_state` in your server config:
```yaml
initial_state:
  mode: "idle"
  context:
    user_tier: "free"
    request_id: null
```

### Usage Parity

| Feature | FastAPI (Python) | Fastify (Node.js) |
| :--- | :--- | :--- |
| **Access Container** | `request.state` | `request.state` |
| **Get Mode** | `request.state.mode` | `request.state.mode` |
| **Set Mode** | `request.state.mode = "active"` | `request.state.mode = "active"` |
| **Access Context** | `request.state.context.key` | `request.state.context.key` |
| **Transition** | `request.state.transition(mode, updates)` | `request.state.transition(mode, updates)` |

### Python Special Feature: AttributeDict
In **FastAPI**, `request.state.context` supports **both** dot notation and dictionary access to satisfy conflicting specs (`REQ0001` vs `REQ0002`).

```python
# FastAPI
request.state.context.user_id = 123  # Dot access (REQ0001)
request.state.context['user_id'] = 123 # Dict access (REQ0002)
```

In **Fastify**, it is a standard JavaScript object.

## 2. Platform Context (`request.context`)

Platform tools are injected into the context to provide access to shared resources.

### Access Patterns

| Property | FastAPI Location | Fastify Location |
| :--- | :--- | :--- |
| **Shared Generic Context** | `request.state.context.sharedContext` | `request.context.sharedContext` |
| **Compute Registry** | `request.state.context.context_registry` | `request.context.contextRegistry` |
| **Config SDK** | `request.state.context.config_sdk` | `request.context.configSdk` |

> **Note**: In Fastify, `request.context` is a separate container from `request.state`. In FastAPI, it is merged into the State Machine's context for cleaner `request.state` access.

## 3. Code Examples

### FastAPI (Python) Route

```python
from fastapi import Request

@app.get("/process")
async def process_data(request: Request):
    # 1. Check State
    if request.state.mode != "idle":
        return {"error": "Busy"}
        
    # 2. Transition State
    request.state.transition("processing", {"start_time": 123456})
    
    # 3. Use Platform Tools
    # sharedContext via recursive/dot access
    user_id = request.state.context.sharedContext.get("user_id")
    
    # context_registry result
    build_id = request.state.context.context_registry.get("get_build_id")(None)

    # 4. Read Application Context
    tier = request.state.context.user_tier
    
    return {"status": "ok", "mode": request.state.mode}
```

### Fastify (Node.js) Route

```javascript
server.get("/process", async (request, reply) => {
    // 1. Check State
    if (request.state.mode !== "idle") {
        return { error: "Busy" };
    }

    // 2. Transition State
    request.state.transition("processing", { startTime: 123456 });

    // 3. Use Platform Tools
    // Note: Accessed via request.context, NOT request.state.context
    const userId = request.context.sharedContext.get("user_id");
    
    // contextRegistry result
    const buildId = request.context.contextRegistry.get("get_build_id")?.(null);

    // 4. Read Application Context
    // Note: App data is in request.state.context
    const tier = request.state.context.user_tier;

    return { status: "ok", mode: request.state.mode };
});
```

## Summary of Differences

1.  **Platform Tools Location**:
    *   **Python**: `request.state.context.*` (Unified under state)
    *   **Node**: `request.context.*` (Separate from state machine)
2.  **Naming Convention**:
    *   **Python**: `snake_case` (e.g., `context_registry`)
    *   **Node**: `camelCase` (e.g., `contextRegistry`)
