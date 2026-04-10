# v800 Context Standards v1.0

This document outlines the standard usage of `app_yaml_static_config` and `app_yaml_overwrites` to obtain `AppYamlConfig` and establish the application context in the v800 polyglot server architecture (FastAPI & Fastify).

## Overview

The context setup is orchestrated through a numbered lifecycle sequence in `config/lifecycle/`:

1.  **01-app-yaml**: Loads static configuration using `app_yaml_static_config`.
2.  **02-create_shared_context**: Establishes the shared context container.
3.  **03-context-resolver**: Resolves dynamic configuration using `app_yaml_overwrites`.
4.  **04-state-machine**: Initializes the request state machine (REQ0002).
5.  **100-on-request-decorators**: Attaches platform tools to the request.

---

## 1. Static Configuration (01)

**Package**: `app_yaml_static_config`

### Responsibility
- Loads YAML files from `config/` directory.
- Merges `base.yml` with environment-specific files (e.g., `server.dev.yaml`).
- Initializes `AppYamlConfig` singleton/instance.
- Creates `AppYamlConfigSDK` for standard access.

### Integration

| Aspect | Fastify (Node.js) | FastAPI (Python) |
| :--- | :--- | :--- |
| **File** | `01-app-yaml.mjs` | `01_app_yaml.py` |
| **Init** | `await AppYamlConfig.initialize({...})` | `AppYamlConfig.initialize({...})` |
| **Access** | `server.config` (object) | `app.state.config` (instance) |
| **SDK** | `server.sdk` (`AppYamlConfigSDK`) | `app.state.sdk` (`AppYamlConfigSDK`) |

---

## 2. Shared Context Creation (02)

**Package**: `app_yaml_overwrites`

### Responsibility
- Creates the `SharedContext` container for global/shared data.
- Allows registration of startup utilities (lazy-loaded connections, timestamps).

### Integration

| Aspect | Fastify (Node.js) | FastAPI (Python) |
| :--- | :--- | :--- |
| **File** | `02-create_shared_context.mjs` | `02_create_shared_context.py` |
| **Method** | `createSharedContext()` | `create_shared_context()` |
| **Storage** | `server.sharedContext` | `app.state.sharedContext` |

---

## 3. Context Resolution (03)

**Package**: `app_yaml_overwrites`

### Responsibility
- Dynamically resolves configuration templates using `SharedContext` and `ComputeRegistry`.
- Loads `*.compute` functions from `computed_functions/`.
- **Primary output**: `ConfigSDK` (Unified Config Access).

### Integration

| Aspect | Fastify (Node.js) | FastAPI (Python) |
| :--- | :--- | :--- |
| **File** | `03-context-resolver.mjs` | `03_context_resolver.py` |
| **Resolution** | `contextResolverPlugin` | `resolve_startup()` |
| **Registry** | `server.contextRegistry` | `app.state.context_registry` |
| **Unified SDK** | `server.configSdk` | `app.state.sdk` (Replaces static SDK) |
| **Compute Fn** | `registry.register(name, fn, scope)` | `registry.register(name, fn, scope)` |

> **Note**: In Python, `app.state.sdk` is upgraded from `AppYamlConfigSDK` to `ConfigSDK` in this step. In Node, `server.sdk` remains `AppYamlConfigSDK`, while `server.configSdk` holds the resolved `ConfigSDK`.

---

## 4. Request State Machine (04)

**Implementation**: Local Lifecycle (REQ0002)

### Responsibility
- Initializes `request.state` container based on `config.initial_state`.
- Manages `mode` (finite state) and `context` (application data).
- **Isolation**: Deep clones context per request.

### Integration

| Aspect | Fastify (Node.js) | FastAPI (Python) |
| :--- | :--- | :--- |
| **File** | `04-state-machine.mjs` | `04_state_machine.py` |
| **Container** | `request.state` | `request.state` |
| **Access** | `request.state.mode`, `request.state.context` | `request.state.mode`, `request.state.context` |
| **Transition** | `request.state.transition()` | `request.state.transition()` |

---

## 5. Platform Decorators (100)

**Implementation**: Local Lifecycle (REQ0001 Alignment)

### Responsibility
- Injects platform tools (`sharedContext`, `registry`, `sdk`) into the request scope.
- Creates per-request child contexts for `SharedContext`.

### Integration

| Aspect | Fastify (Node.js) | FastAPI (Python) |
| :--- | :--- | :--- |
| **File** | `100-on-request-decorators.mjs` | `100_on_request_decorators.py` |
| **Location** | `request.context` | `request.context` |
| **Shared** | `request.context.sharedContext` | `request.context.sharedContext` |
| **Registry** | `request.context.contextRegistry` | `request.context.context_registry` |
| **SDK** | `request.context.configSdk` | `request.context.config_sdk` |

> **Critical Difference**: 
> *   **Fastify**: Platform tools live in `request.context` (Separate object).
> *   **FastAPI**: Platform tools live in `request.context` (Separate attribute on `request`).
>
> *Note: Previous implementation in FastAPI attached to `request.state.context` but this was refactored in v1 to align with `100_on_request_decorators.py` source which sets `request.context = SimpleNamespace()`.*

---

## Usage Example: Getting AppYamlConfig

To access the raw static configuration (`AppYamlConfig`) in your application code:

### Fastify (Node.js)
```javascript
// A. Direct from Server/Request
const appConfig = server.config; // AppYamlConfig instance
const rawObject = appConfig.toObject();

// B. Via SDK (if needed)
const raw = server.sdk.getConfig(); 
```

### FastAPI (Python)
```python
from app_yaml_static_config import AppYamlConfig

# A. From App State
app_config = request.app.state.config # AppYamlConfig instance
raw_dict = app_config.to_dict()

# B. Singleton Access (Static)
app_config = AppYamlConfig.get_instance()
```
