# Confluence API -- Python Server Integration

FastAPI integration patterns for the `confluence_api` package.

---

## Built-in Server

### Quick Start

```bash
# Using the built-in app factory
uvicorn confluence_api.server:create_app --factory --host 0.0.0.0 --port 8000
```

### Programmatic Start

```python
from confluence_api.server import create_app
import uvicorn

app = create_app()
uvicorn.run(app, host='0.0.0.0', port=8000)
```

The built-in server provides:
- CORS middleware (all origins)
- Health endpoint at `/health`
- Error handler mapping `ConfluenceAPIError` to JSON responses

---

## Custom Integration

### Lifespan Context Manager

```python
from contextlib import asynccontextmanager
from fastapi import FastAPI
from confluence_api import get_config, create_logger

log = create_logger('confluence-server', __file__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    config = get_config()
    app.state.confluence_config = config

    if config.get('base_url'):
        log.info('Confluence configured', {'base_url': config['base_url']})
    else:
        log.warning('Confluence not configured -- set CONFLUENCE_BASE_URL, CONFLUENCE_USERNAME, CONFLUENCE_API_TOKEN')

    yield

    # Shutdown
    log.info('shutting down')

app = FastAPI(
    title='Confluence API Server',
    version='1.0.0',
    lifespan=lifespan,
)
```

### CORS Middleware

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)
```

### Dependency Injection

```python
from fastapi import Depends, HTTPException
from confluence_api import ConfluenceClient, ConfluenceConfigurationError

def get_client() -> ConfluenceClient:
    """Dependency: create a Confluence client from app config."""
    config = app.state.confluence_config
    if not config.get('base_url') or not config.get('username') or not config.get('api_token'):
        raise ConfluenceConfigurationError(
            'Set CONFLUENCE_BASE_URL, CONFLUENCE_USERNAME, CONFLUENCE_API_TOKEN'
        )
    return ConfluenceClient(
        base_url=config['base_url'],
        username=config['username'],
        api_token=config['api_token'],
    )

Client = Depends(get_client)
```

### Auth Dependency (Optional)

```python
import os
from fastapi import Header

def verify_api_key(authorization: str = Header(None)):
    """Dependency: verify API key from Authorization header."""
    api_key = os.environ.get('SERVER_API_KEY')
    if not api_key:
        return  # no auth required

    if not authorization:
        raise HTTPException(status_code=401, detail='Authentication required')

    import base64
    try:
        encoded = authorization.replace('Basic ', '')
        decoded = base64.b64decode(encoded).decode()
        username, _ = decoded.split(':', 1)
        if username != api_key:
            raise HTTPException(status_code=401, detail='Invalid API key')
    except Exception:
        raise HTTPException(status_code=401, detail='Invalid authorization header')

Auth = Depends(verify_api_key)
```

---

## Route Definitions

### Health

```python
@app.get('/health')
async def health():
    config = app.state.confluence_config
    return {
        'status': 'healthy',
        'confluenceConfigured': bool(config.get('base_url')),
    }
```

### Content Routes

```python
from confluence_api import ContentService

@app.get('/content')
async def list_content(
    type: str | None = None,
    spaceKey: str | None = None,
    limit: int = 25,
    start: int = 0,
    expand: str | None = None,
    client: ConfluenceClient = Client,
):
    return ContentService(client).get_contents(
        type=type, space_key=spaceKey, expand=expand, start=start, limit=limit,
    )

@app.get('/content/{content_id}')
async def get_content(
    content_id: str,
    expand: str | None = None,
    client: ConfluenceClient = Client,
):
    return ContentService(client).get_content(content_id, expand=expand)

@app.post('/content')
async def create_content(data: dict, client: ConfluenceClient = Client):
    return ContentService(client).create_content(data)

@app.put('/content/{content_id}')
async def update_content(content_id: str, data: dict, client: ConfluenceClient = Client):
    return ContentService(client).update_content(content_id, data)

@app.delete('/content/{content_id}')
async def delete_content(content_id: str, client: ConfluenceClient = Client):
    ContentService(client).delete_content(content_id)
    return {'message': f'Content {content_id} deleted'}
```

### Content Labels

```python
@app.get('/content/{content_id}/labels')
async def get_content_labels(content_id: str, client: ConfluenceClient = Client):
    return ContentService(client).get_labels(content_id)

@app.post('/content/{content_id}/labels')
async def add_content_labels(content_id: str, labels: list, client: ConfluenceClient = Client):
    return ContentService(client).add_labels(content_id, labels)
```

### Content Attachments

```python
from fastapi import UploadFile
from confluence_api import AttachmentService
import tempfile, os

@app.get('/content/{content_id}/attachments')
async def list_attachments(
    content_id: str,
    limit: int = 25,
    start: int = 0,
    client: ConfluenceClient = Client,
):
    return AttachmentService(client).get_attachments(content_id, start=start, limit=limit)

@app.post('/content/{content_id}/attachments')
async def upload_attachment(
    content_id: str,
    file: UploadFile,
    client: ConfluenceClient = Client,
):
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=f'_{file.filename}')
    try:
        content = await file.read()
        tmp.write(content)
        tmp.close()
        result = AttachmentService(client).create_attachment(content_id, tmp.name)
    finally:
        os.unlink(tmp.name)
    return result
```

### Space Routes

```python
from confluence_api import SpaceService

@app.get('/spaces')
async def list_spaces(
    limit: int = 25,
    start: int = 0,
    expand: str | None = None,
    client: ConfluenceClient = Client,
):
    return SpaceService(client).get_spaces(expand=expand, start=start, limit=limit)

@app.get('/spaces/{space_key}')
async def get_space(
    space_key: str,
    expand: str | None = None,
    client: ConfluenceClient = Client,
):
    return SpaceService(client).get_space(space_key, expand=expand)
```

### Search Routes

```python
from confluence_api import SearchService

@app.get('/search')
async def search(
    cql: str,
    limit: int = 25,
    start: int = 0,
    expand: str | None = None,
    client: ConfluenceClient = Client,
):
    return SearchService(client).search_content(cql, expand=expand, start=start, limit=limit)
```

### User Routes

```python
from confluence_api import UserService

@app.get('/user/current')
async def current_user(client: ConfluenceClient = Client):
    return UserService(client).get_current_user()

@app.get('/user/{username}')
async def get_user(username: str, client: ConfluenceClient = Client):
    return UserService(client).get_user(username)
```

### System Routes

```python
from confluence_api import SystemService

@app.get('/system/info')
async def server_info(client: ConfluenceClient = Client):
    return SystemService(client).get_server_info()

@app.get('/system/metrics')
async def instance_metrics(client: ConfluenceClient = Client):
    return SystemService(client).get_instance_metrics()
```

---

## Error Handling

### Exception Handler

```python
from fastapi import Request
from fastapi.responses import JSONResponse
from confluence_api import ConfluenceAPIError

@app.exception_handler(ConfluenceAPIError)
async def confluence_error_handler(request: Request, exc: ConfluenceAPIError):
    return JSONResponse(
        status_code=exc.status_code or 500,
        content={
            'error': True,
            'message': str(exc),
            'type': type(exc).__name__,
        },
    )
```

### Error Mapping

| Exception | HTTP Status |
|-----------|-------------|
| `ConfluenceValidationError` | 400 |
| `ConfluenceAuthenticationError` | 401 |
| `ConfluencePermissionError` | 403 |
| `ConfluenceNotFoundError` | 404 |
| `ConfluenceConflictError` | 409 |
| `ConfluenceRateLimitError` | 429 |
| `ConfluenceServerError` | 5xx |
| `ConfluenceConfigurationError` | 500 |
| `ConfluenceNetworkError` | 500 |
| `ConfluenceTimeoutError` | 500 |

---

## Route Reference

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/content` | List content |
| GET | `/content/{id}` | Get content by ID |
| POST | `/content` | Create content |
| PUT | `/content/{id}` | Update content |
| DELETE | `/content/{id}` | Delete content |
| GET | `/content/{id}/labels` | Get content labels |
| POST | `/content/{id}/labels` | Add content labels |
| GET | `/content/{id}/attachments` | List attachments |
| POST | `/content/{id}/attachments` | Upload attachment |
| GET | `/spaces` | List spaces |
| GET | `/spaces/{key}` | Get space by key |
| GET | `/search?cql=...` | CQL search |
| GET | `/user/current` | Get current user |
| GET | `/user/{username}` | Get user by username |
| GET | `/system/info` | Server information |
| GET | `/system/metrics` | Instance metrics |

## Environment Configuration

| Variable | Description | Required |
|----------|-------------|----------|
| `CONFLUENCE_BASE_URL` | Confluence Data Center base URL | Yes |
| `CONFLUENCE_USERNAME` | Username for Basic Auth | Yes |
| `CONFLUENCE_API_TOKEN` | API token / password | Yes |
| `SERVER_API_KEY` | Optional API key for the proxy server | No |
| `LOG_LEVEL` | Log level (default: INFO) | No |

## Running

```bash
# Development (with reload)
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Production
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```
