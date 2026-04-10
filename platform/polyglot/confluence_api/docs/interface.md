# Confluence API -- Polyglot Interface

This package provides a polyglot (Python + Node.js) interface for the
Confluence Data Center REST API v9.2.3.

## Package Overview

| Aspect           | Python (`py/`)                           | Node.js (`mjs/`)                         |
|------------------|------------------------------------------|------------------------------------------|
| HTTP Client      | `ConfluenceClient` (httpx, sync)         | `ConfluenceFetchClient` (undici, async)  |
| Auth             | Basic Auth (username + API token)        | Basic Auth (username + API token)        |
| Error Hierarchy  | `ConfluenceAPIError` + subclasses        | `ConfluenceApiError` + subclasses        |
| Models           | Pydantic v2                              | Zod schemas                              |
| Pagination       | `paginate_offset`, `paginate_cursor`     | `paginateOffset`, `paginateCursor`       |
| CQL Builder      | `CQLBuilder` / `cql()`                   | `CQLBuilder` / `cql()`                   |
| Logger           | `create_logger()` / `null_logger`        | `createLogger()` / `nullLogger`          |
| Config           | `get_config()` / `load_config_from_env()`| `getConfig()` / `loadConfigFromEnv()`    |
| Server           | FastAPI (`server/__init__.py`)           | Fastify (`server/index.mjs`)             |
| SDK Client       | `ConfluenceSDKClient`                    | `ConfluenceSdkClient`                    |
| CLI              | Typer (`cli.py`)                         | Commander (`cli.mjs`)                    |

## Logger Pattern

Both implementations provide identical structured logging with automatic
sensitive-field redaction.

**Python:**

```python
from confluence_api.logger import create_logger, null_logger

log = create_logger('confluence-api', __file__)
log.info('fetching page', {'page_id': '12345'})
```

**Node.js:**

```javascript
import { createLogger, nullLogger } from 'confluence_api';

const log = createLogger('confluence-api', import.meta.url);
log.info('fetching page', { pageId: '12345' });
```

## Client Usage

**Python:**

```python
from confluence_api import ConfluenceClient

with ConfluenceClient(
    base_url='https://confluence.example.com',
    username='admin',
    api_token='your-token',
) as client:
    spaces = client.get('space')
    page = client.get('content/12345', params={'expand': 'body.storage'})
```

**Node.js:**

```javascript
import { ConfluenceFetchClient } from 'confluence_api';

const client = new ConfluenceFetchClient({
  baseUrl: 'https://confluence.example.com',
  username: 'admin',
  apiToken: 'your-token',
});

const spaces = await client.get('/rest/api/space');
const page = await client.get('/rest/api/content/12345', {
  queryParams: { expand: 'body.storage' },
});
```

## Error Handling

**Python:**

```python
from confluence_api import ConfluenceClient, ConfluenceNotFoundError, ConfluenceAPIError

try:
    with ConfluenceClient(base_url=url, username=user, api_token=token) as client:
        page = client.get('content/99999')
except ConfluenceNotFoundError as e:
    print(f"Page not found: {e}")
except ConfluenceAPIError as e:
    print(f"API error ({e.status_code}): {e}")
```

**Node.js:**

```javascript
import { ConfluenceFetchClient, ConfluenceNotFoundError, ConfluenceApiError } from 'confluence_api';

try {
  const page = await client.get('/rest/api/content/99999');
} catch (err) {
  if (err instanceof ConfluenceNotFoundError) {
    console.log(`Page not found: ${err.message}`);
  } else if (err instanceof ConfluenceApiError) {
    console.log(`API error (${err.status}): ${err.message}`);
  }
}
```

## Service Usage

**Python:**

```python
from confluence_api import ConfluenceClient
from confluence_api.services.content_service import ContentService
from confluence_api.services.search_service import SearchService

with ConfluenceClient(base_url=url, username=user, api_token=token) as client:
    content_svc = ContentService(client)
    search_svc = SearchService(client)

    # Get content
    page = content_svc.get_content('12345', expand='body.storage')

    # Search
    results = search_svc.search(cql='type = "page" AND space = "DEV"', limit=10)
```

**Node.js (via SDK Client):**

```javascript
import { ConfluenceSdkClient } from 'confluence_api';

const sdk = new ConfluenceSdkClient({
  baseUrl: 'http://localhost:3000/~/api/rest/2025-01-01/providers/confluence_api',
});

// Get content
const page = await sdk.getContent('12345', { expand: 'body.storage' });

// Search
const results = await sdk.searchContent('type = "page" AND space = "DEV"', { limit: 10 });

// Get spaces
const spaces = await sdk.getSpaces({ limit: 50 });
```

## CQL Builder

**Python:**

```python
from confluence_api.utils.cql_builder import cql

query = (
    cql('type').equals('page')
    .and_()
    .field('space').equals('DEV')
    .and_()
    .field('title').contains('architecture')
    .order_by('lastModified', 'desc')
    .build()
)
# => 'type = "page" AND space = "DEV" AND title ~ "architecture" ORDER BY lastModified desc'
```

**Node.js:**

```javascript
import { cql } from 'confluence_api';

const query = cql('type').equals('page')
  .and()
  .field('space').equals('DEV')
  .and()
  .field('title').contains('architecture')
  .orderBy('lastModified', 'DESC')
  .build();
// => 'type = "page" AND space = "DEV" AND title ~ "architecture" ORDER BY lastModified DESC'
```
