# Confluence API -- Node.js Server Integration

Fastify integration patterns for the `confluence_api` package.

---

## Built-in Server

### Quick Start

```typescript
import { createServer, startServer, createErrorHandler } from 'confluence_api';

const server = createServer({ logger: true });
server.setErrorHandler(createErrorHandler());
await startServer(server, { host: '0.0.0.0', port: 3000 });
```

### Programmatic Start

```typescript
import { createServer, startServer } from 'confluence_api';

const server = createServer({ logger: true });
await startServer(server, { host: '0.0.0.0', port: 3000 });
console.log('Server running at http://localhost:3000');
```

The built-in server provides:
- Fastify instance with configurable logger
- Error handler mapping `ConfluenceApiError` to JSON responses
- Configurable host and port

---

## Custom Integration

### Server Factory Pattern

```typescript
import Fastify from 'fastify';
import cors from '@fastify/cors';
import {
  ConfluenceFetchClient,
  getConfig,
  ContentService,
  SpaceService,
  SearchService,
  UserService,
  LabelService,
  SystemService,
  AttachmentService,
  ConfluenceConfigurationError,
  createErrorHandler,
  createLogger,
} from 'confluence_api';

const log = createLogger('confluence-server', import.meta.url);

async function buildServer() {
  const server = Fastify({ logger: false });

  // CORS
  await server.register(cors, { origin: true });

  // Error handler
  server.setErrorHandler(createErrorHandler());

  // Request state decorator
  let requestCount = 0;
  server.decorateRequest('requestId', '');
  server.addHook('onRequest', async (request) => {
    requestCount += 1;
    request.requestId = crypto.randomUUID();
  });

  // Client factory
  const config = getConfig();

  function getClient() {
    if (!config?.baseUrl || !config?.username || !config?.apiToken) {
      throw new ConfluenceConfigurationError(
        'Set CONFLUENCE_BASE_URL, CONFLUENCE_USERNAME, CONFLUENCE_API_TOKEN',
      );
    }
    return new ConfluenceFetchClient({
      baseUrl: config.baseUrl,
      username: config.username,
      apiToken: config.apiToken,
    });
  }

  // Health
  server.get('/health', async () => ({
    status: 'healthy',
    confluenceConfigured: !!config?.baseUrl,
  }));

  // ... register route groups ...

  return server;
}
```

### Auth Hook

Optional API key authentication via Basic Auth:

```typescript
const apiKey = process.env.SERVER_API_KEY;
if (apiKey) {
  server.addHook('preHandler', async (request, reply) => {
    // Skip auth for health endpoint
    if (request.url === '/health') return;

    const authHeader = request.headers.authorization;
    if (!authHeader) {
      reply.code(401).send({ error: 'Authentication required' });
      return;
    }

    try {
      const encoded = authHeader.replace('Basic ', '');
      const decoded = Buffer.from(encoded, 'base64').toString();
      const [username] = decoded.split(':');
      if (username !== apiKey) {
        reply.code(401).send({ error: 'Invalid API key' });
        return;
      }
    } catch {
      reply.code(401).send({ error: 'Invalid authorization header' });
    }
  });
}
```

---

## Route Groups

### Content Routes

```typescript
await server.register(async (scope) => {
  // List content
  scope.get('/', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          type: { type: 'string' },
          spaceKey: { type: 'string' },
          limit: { type: 'integer', default: 25 },
          start: { type: 'integer', default: 0 },
          expand: { type: 'string' },
        },
      },
    },
  }, async (request) => {
    const c = getClient();
    const { type, spaceKey, limit = 25, start = 0, expand } = request.query;
    return new ContentService(c).getContents({ type, spaceKey, expand, start, limit });
  });

  // Get content by ID
  scope.get('/:contentId', async (request) => {
    const c = getClient();
    const { expand } = request.query;
    return new ContentService(c).getContent(request.params.contentId, { expand });
  });

  // Create content
  scope.post('/', async (request) => {
    const c = getClient();
    return new ContentService(c).createContent(request.body);
  });

  // Update content
  scope.put('/:contentId', async (request) => {
    const c = getClient();
    return new ContentService(c).updateContent(request.params.contentId, request.body);
  });

  // Delete content
  scope.delete('/:contentId', async (request) => {
    const c = getClient();
    await new ContentService(c).deleteContent(request.params.contentId);
    return { message: `Content ${request.params.contentId} deleted` };
  });
}, { prefix: '/content' });
```

### Content Labels

```typescript
// Within the /content prefix scope:
scope.get('/:contentId/labels', async (request) => {
  const c = getClient();
  return new ContentService(c).getLabels(request.params.contentId);
});

scope.post('/:contentId/labels', async (request) => {
  const c = getClient();
  return new ContentService(c).addLabels(request.params.contentId, request.body);
});
```

### Content Attachments

```typescript
// Within the /content prefix scope:
scope.get('/:contentId/attachments', {
  schema: {
    querystring: {
      type: 'object',
      properties: {
        limit: { type: 'integer', default: 25 },
        start: { type: 'integer', default: 0 },
        expand: { type: 'string' },
      },
    },
  },
}, async (request) => {
  const c = getClient();
  const { limit = 25, start = 0, expand } = request.query;
  return new AttachmentService(c).getAttachments(request.params.contentId, { expand, start, limit });
});

scope.delete('/:contentId/attachments/:attachmentId', async (request) => {
  const c = getClient();
  await new AttachmentService(c).deleteAttachment(
    request.params.contentId,
    request.params.attachmentId,
  );
  return { message: `Attachment ${request.params.attachmentId} deleted` };
});
```

### Space Routes

```typescript
await server.register(async (scope) => {
  scope.get('/', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'integer', default: 25 },
          start: { type: 'integer', default: 0 },
          expand: { type: 'string' },
        },
      },
    },
  }, async (request) => {
    const c = getClient();
    const { limit = 25, start = 0, expand } = request.query;
    return new SpaceService(c).getSpaces({ expand, start, limit });
  });

  scope.get('/:spaceKey', async (request) => {
    const c = getClient();
    const { expand } = request.query;
    return new SpaceService(c).getSpace(request.params.spaceKey, { expand });
  });
}, { prefix: '/spaces' });
```

### Search Routes

```typescript
await server.register(async (scope) => {
  scope.get('/', {
    schema: {
      querystring: {
        type: 'object',
        required: ['cql'],
        properties: {
          cql: { type: 'string' },
          limit: { type: 'integer', default: 25 },
          start: { type: 'integer', default: 0 },
          expand: { type: 'string' },
        },
      },
    },
  }, async (request) => {
    const c = getClient();
    const { cql, limit = 25, start = 0, expand } = request.query;
    return new SearchService(c).searchContent(cql, { expand, start, limit });
  });
}, { prefix: '/search' });
```

### User Routes

```typescript
await server.register(async (scope) => {
  scope.get('/current', async () => {
    const c = getClient();
    return new UserService(c).getCurrentUser();
  });

  scope.get('/:username', async (request) => {
    const c = getClient();
    return new UserService(c).getUser(request.params.username);
  });
}, { prefix: '/user' });
```

### Label Routes

```typescript
await server.register(async (scope) => {
  scope.get('/recent', async () => {
    const c = getClient();
    return new LabelService(c).getRecentLabels();
  });

  scope.get('/:labelName/related', async (request) => {
    const c = getClient();
    return new LabelService(c).getRelatedLabels(request.params.labelName);
  });
}, { prefix: '/labels' });
```

### System Routes

```typescript
await server.register(async (scope) => {
  scope.get('/info', async () => {
    const c = getClient();
    return new SystemService(c).getServerInfo();
  });

  scope.get('/metrics', async () => {
    const c = getClient();
    return new SystemService(c).getInstanceMetrics();
  });
}, { prefix: '/system' });
```

---

## Error Handler

The `createErrorHandler()` function returns a Fastify error handler that maps Confluence errors to structured JSON responses.

```typescript
import { createErrorHandler } from 'confluence_api';

server.setErrorHandler(createErrorHandler());
```

### Error Mapping

| Error Class | HTTP Status |
|------------|-------------|
| `ConfluenceValidationError` | 400 |
| `ConfluenceAuthenticationError` | 401 |
| `ConfluencePermissionError` | 403 |
| `ConfluenceNotFoundError` | 404 |
| `ConfluenceConflictError` | 409 |
| `ConfluenceRateLimitError` | 429 |
| `ConfluenceServerError` | 5xx |
| `ConfluenceConfigurationError` | 500 |
| Other errors | 500 |

Response format:

```json
{
  "error": true,
  "message": "Resource not found",
  "type": "ConfluenceNotFoundError"
}
```

---

## Graceful Shutdown

```typescript
const shutdown = async () => {
  log.info('shutting down');
  await server.close();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
```

---

## Route Reference

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/content` | List content |
| GET | `/content/:contentId` | Get content by ID |
| POST | `/content` | Create content |
| PUT | `/content/:contentId` | Update content |
| DELETE | `/content/:contentId` | Delete content |
| GET | `/content/:contentId/labels` | Get content labels |
| POST | `/content/:contentId/labels` | Add content labels |
| GET | `/content/:contentId/attachments` | List attachments |
| DELETE | `/content/:contentId/attachments/:attachmentId` | Delete attachment |
| GET | `/spaces` | List spaces |
| GET | `/spaces/:spaceKey` | Get space by key |
| GET | `/search?cql=...` | CQL search |
| GET | `/user/current` | Get current user |
| GET | `/user/:username` | Get user by username |
| GET | `/labels/recent` | Get recent labels |
| GET | `/labels/:labelName/related` | Get related labels |
| GET | `/system/info` | Server information |
| GET | `/system/metrics` | Instance metrics |

## Environment Configuration

| Variable | Description | Required |
|----------|-------------|----------|
| `CONFLUENCE_BASE_URL` | Confluence Data Center base URL | Yes |
| `CONFLUENCE_USERNAME` | Username for Basic Auth | Yes |
| `CONFLUENCE_API_TOKEN` | API token / password | Yes |
| `SERVER_API_KEY` | Optional API key for the proxy server | No |
| `PORT` | Server port (default: 3000) | No |
| `LOG_LEVEL` | Log level (default: info) | No |
