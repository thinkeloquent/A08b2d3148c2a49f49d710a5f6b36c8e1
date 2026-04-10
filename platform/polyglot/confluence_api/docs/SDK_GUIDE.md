# Confluence API SDK Guide

The Confluence API SDK provides a high-level client for CLI tools, LLM Agents, and Developer Tools to interact with a Confluence API REST proxy server. The SDK client communicates with the proxy server (Fastify or FastAPI) rather than Confluence Data Center directly.

## Architecture

```
SDK Client  -->  REST Proxy Server  -->  Confluence Data Center
(Node.js)        (Fastify)                REST API v9.2.3
(Python)         (FastAPI)
```

## Usage

### Node.js

```typescript
import { ConfluenceSdkClient } from 'confluence_api';

// Initialize SDK
const sdk = new ConfluenceSdkClient({
  baseUrl: 'http://localhost:3000/~/api/rest/2025-01-01/providers/confluence_api',
  apiKey: 'optional-api-key',
  timeoutMs: 30_000,
});

// Health check
const health = await sdk.healthCheck();
console.log('Status:', health.status);

// Get content
const page = await sdk.getContent('12345', { expand: 'body.storage' });
console.log('Title:', page.title);

// Search with CQL
const results = await sdk.searchContent('type = "page" AND space = "DEV"', {
  limit: 10,
});
console.log('Found:', results.size, 'results');

// List spaces
const spaces = await sdk.getSpaces({ limit: 50 });
for (const space of spaces.results) {
  console.log(space.key, space.name);
}

// Server info
const info = await sdk.serverInfo();
console.log('Confluence version:', info.version);
```

### Python

```python
from confluence_api import ConfluenceSDKClient

# Initialize SDK
with ConfluenceSDKClient(
    base_url='http://localhost:8000/~/api/rest/2025-01-01/providers/confluence_api',
    api_key='optional-api-key',
    timeout=30.0,
) as sdk:
    # Health check
    health = sdk.health_check()
    print(f"Status: {health['status']}")

    # Get content
    page = sdk.get_content('12345', expand='body.storage')
    print(f"Title: {page['title']}")

    # Search with CQL
    results = sdk.search_content('type = "page" AND space = "DEV"', limit=10)
    print(f"Found: {results['size']} results")

    # List spaces
    spaces = sdk.get_spaces(limit=50)
    for space in spaces['results']:
        print(space['key'], space['name'])

    # Server info
    info = sdk.get_server_info()
    print(f"Confluence version: {info['version']}")
```

## Authentication

The SDK client supports optional API key authentication via HTTP Basic Auth. The API key is sent as the username with an empty password.

```typescript
// Node.js -- API key authentication
const sdk = new ConfluenceSdkClient({
  baseUrl: 'http://localhost:3000/~/api/rest/2025-01-01/providers/confluence_api',
  apiKey: 'my-api-key',
});
```

```python
# Python -- API key authentication
sdk = ConfluenceSDKClient(
    base_url='http://localhost:8000/~/api/rest/2025-01-01/providers/confluence_api',
    api_key='my-api-key',
)
```

## Features

### Content Operations
- `getContent` / `get_content` -- Retrieve content by ID with optional expand
- `getContents` / `get_contents` -- List content with type, space, title, and pagination filters
- `createContent` / `create_content` -- Create new pages, blog posts, or comments
- `updateContent` / `update_content` -- Update existing content (title, body, version)
- `deleteContent` / `delete_content` -- Delete content by ID

### Space Operations
- `getSpaces` / `get_spaces` -- List all spaces with pagination
- `getSpace` / `get_space` -- Retrieve a single space by key

### Search Operations
- `searchContent` / `search_content` -- Search using CQL with pagination and expand

### System Operations
- `serverInfo` / `get_server_info` -- Retrieve Confluence server version and build info
- `healthCheck` / `health_check` -- Check proxy server health

### Property Proxies

Both implementations provide namespaced property proxies for a cleaner API:

```typescript
// Node.js
const page = await sdk.content.get('12345');
const spaces = await sdk.space.list({ limit: 50 });
const results = await sdk.search.query('type = "page"');
const me = await sdk.user.getCurrent();
```

```python
# Python
page = sdk.content.get('12345')
spaces = sdk.space.list(limit=50)
results = sdk.search.query('type = "page"')
me = sdk.user.get_current()
```

## Error Handling

SDK errors are raised as `SDKError` (extends the base error class) with the HTTP status code from the proxy server.

```typescript
// Node.js
import { SDKError } from 'confluence_api';

try {
  await sdk.getContent('99999');
} catch (err) {
  if (err instanceof SDKError) {
    console.error(`SDK Error: ${err.message} (status: ${err.status})`);
  }
}
```

```python
# Python
from confluence_api import SDKError

try:
    sdk.get_content('99999')
except SDKError as e:
    print(f"SDK Error: {e.message} (status: {e.status_code})")
```
