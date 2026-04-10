/**
 * OpenAPI LLM-friendly endpoint listing and per-endpoint docs.
 *
 * Reads the shared open-api.yaml registry and renders:
 *   GET /openapi/llm             → plain text table of all endpoints
 *   GET /openapi/llm.json        → JSON array of all endpoints
 *   GET /openapi/docs/*          → detail view for a specific endpoint path (exact match)
 *   GET /openapi/docs-group/*    → all endpoints under a path prefix
 *   GET /openapi/docs-search/*   → fuzzy search across path, name, and description
 *
 * @param {import('fastify').FastifyInstance} server
 */
import { readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const YAML_PATH = resolve(__dirname, '..', '..', 'common', 'system', 'open-api.yaml');
const SCHEMAS_PATH = resolve(__dirname, '..', '..', 'common', 'system', 'openapi-schemas.json');
const SERVER_KEY = 'fastify';

let cached = null;
let schemasCache = null;
let serverRef = null;

/**
 * Minimal parser for the open-api.yaml structure.
 * Handles the top-level `endpoints:` list.
 */
function parseYaml(raw) {
  const endpoints = [];
  let current = null;
  let section = null;

  for (const line of raw.split('\n')) {
    const trimmed = line.trimStart();
    if (trimmed.startsWith('#') || trimmed === '') continue;

    // Top-level keys
    if (!line.startsWith(' ') && !line.startsWith('-')) {
      if (trimmed.startsWith('endpoints:')) { section = 'endpoints'; continue; }
      section = null;
      continue;
    }

    // --- endpoints section ---
    if (section === 'endpoints') {
      const listMatch = trimmed.match(/^- (\w+):\s*(.+)/);
      if (listMatch) {
        current = { [listMatch[1]]: listMatch[2].trim() };
        endpoints.push(current);
        continue;
      }
      const propMatch = trimmed.match(/^(\w+):\s*(.+)/);
      if (propMatch && current) {
        current[propMatch[1]] = propMatch[2].trim();
      }
    }
  }

  return { endpoints };
}

/**
 * Auto-generate a friendly name from a wildcard name prefix and a URL suffix.
 * Strips version-like segments (YYYY-MM-DD) and parameter placeholders.
 */
function generateAutoName(prefix, pathSuffix) {
  if (!pathSuffix) return prefix;
  const segments = pathSuffix.split('/')
    .filter((s) => s && !s.startsWith(':') && !s.startsWith('{') && !/^\d{4}-\d{2}-\d{2}$/.test(s))
    .map((s) => s.replace(/-/g, '_'));
  if (!segments.length) return prefix;
  return `${prefix}_${segments.join('_')}`;
}

/**
 * Expand endpoints whose path ends with `/**` by matching against
 * the server's collected route map (populated by setupRouteCollector).
 */
function expandWildcards(endpoints) {
  const routeMap = serverRef?._routeMap;
  if (!routeMap || routeMap.size === 0) return endpoints;

  const expanded = [];
  for (const ep of endpoints) {
    if (!ep.path.endsWith('/**')) {
      expanded.push(ep);
      continue;
    }

    const prefix = ep.path.slice(0, -3); // strip /**
    const namePrefix = ep.name || '';
    const matches = [];

    for (const [url, methods] of routeMap.entries()) {
      if (url !== prefix && !url.startsWith(prefix + '/')) continue;

      // Convert Fastify :param to OpenAPI {param}
      const openapiPath = url
        .replace(/:([^/.]+)\.\.\.([^/]+)/g, '{$1$2}')
        .replace(/:([^/]+)/g, '{$1}');

      const suffix = url.slice(prefix.length).replace(/^\//, '');
      const autoName = generateAutoName(namePrefix, suffix);

      for (const method of methods) {
        if (method === 'HEAD') continue;
        matches.push({
          path: openapiPath,
          method,
          name: autoName,
          server: ep.server,
        });
      }
    }

    // Sort expanded routes by path then method for stable ordering
    matches.sort((a, b) => a.path.localeCompare(b.path) || a.method.localeCompare(b.method));
    expanded.push(...matches);
  }
  return expanded;
}

/**
 * Check if an endpoint's server field matches the current server key.
 * Supports string ("fastify"), keyword ("both"), or inline YAML array ("[fastify, fastapi]").
 */
function matchesServer(serverField) {
  if (!serverField) return false;
  if (serverField === SERVER_KEY || serverField === 'both') return true;
  if (serverField.startsWith('[') && serverField.endsWith(']')) {
    const items = serverField.slice(1, -1).split(',').map((s) => s.trim());
    return items.includes(SERVER_KEY);
  }
  return false;
}

/**
 * Derive the base URL from the incoming Fastify request object.
 * Works in both local dev and cloud/microservice deployments.
 */
function getBaseUrl(request) {
  const proto = request.headers['x-forwarded-proto'] || request.protocol || 'http';
  const host = request.headers['x-forwarded-host'] || request.hostname;
  return `${proto}://${host}`;
}

async function loadData() {
  if (cached) return cached;
  const raw = await readFile(YAML_PATH, 'utf8');
  const { endpoints } = parseYaml(raw);
  const filtered = endpoints.filter((e) => matchesServer(e.server));
  const resolved = expandWildcards(filtered);
  cached = { endpoints: resolved };
  return cached;
}

async function loadSchemas() {
  if (schemasCache) return schemasCache;
  try {
    const raw = await readFile(SCHEMAS_PATH, 'utf8');
    schemasCache = JSON.parse(raw);
  } catch {
    schemasCache = { components: { schemas: {} }, operations: {} };
  }
  return schemasCache;
}

/**
 * Build a proper OpenAPI 3.0.3 spec document from matched endpoints.
 */
function buildOpenApiSpec(endpoints, baseUrl, schemas) {
  const componentSchemas = schemas.components?.schemas || {};
  const operations = schemas.operations || {};

  // Collect which component schemas are actually referenced
  const referencedSchemas = new Set();

  const paths = {};
  for (const ep of endpoints) {
    const method = ep.method.toLowerCase();
    const opKey = `${ep.method} ${ep.path}`;
    const opDetail = operations[opKey];

    const operation = {
      operationId: opDetail?.operationId || ep.name,
      summary: opDetail?.summary || ep.name,
      description: opDetail?.description || ep.description || '',
    };

    if (ep.tag) {
      operation.tags = [ep.tag];
    }

    // Request body
    if (opDetail?.requestBody) {
      const schemaName = opDetail.requestBody.schema;
      if (schemaName && componentSchemas[schemaName]) {
        referencedSchemas.add(schemaName);
        operation.requestBody = {
          required: opDetail.requestBody.required ?? true,
          content: {
            'application/json': {
              schema: { $ref: `#/components/schemas/${schemaName}` },
            },
          },
        };
      }
    }

    // Responses
    operation.responses = {};
    if (opDetail?.responses) {
      for (const [code, resp] of Object.entries(opDetail.responses)) {
        const respObj = { description: resp.description || '' };
        if (resp.schema && componentSchemas[resp.schema]) {
          referencedSchemas.add(resp.schema);
          respObj.content = {
            [resp.contentType || 'application/json']: {
              schema: { $ref: `#/components/schemas/${resp.schema}` },
            },
          };
        } else if (resp.contentType) {
          respObj.content = {
            [resp.contentType]: {},
          };
        }
        operation.responses[code] = respObj;
      }
    } else {
      operation.responses['200'] = { description: 'Success' };
    }

    if (!paths[ep.path]) paths[ep.path] = {};
    paths[ep.path][method] = operation;
  }

  // Build the components section with only referenced schemas
  const usedSchemas = {};
  for (const name of referencedSchemas) {
    usedSchemas[name] = componentSchemas[name];
  }

  // Collect unique tags
  const tagSet = new Set();
  for (const ep of endpoints) {
    if (ep.tag) tagSet.add(ep.tag);
  }

  const spec = {
    openapi: '3.0.3',
    info: {
      title: 'MTA-V800 API',
      description: `OpenAPI specification for matched endpoints on ${SERVER_KEY}`,
      version: '1.0.0',
    },
    servers: [{ url: baseUrl, description: `${SERVER_KEY} server` }],
    paths,
  };

  if (tagSet.size > 0) {
    spec.tags = [...tagSet].map((t) => ({ name: t }));
  }

  if (Object.keys(usedSchemas).length > 0) {
    spec.components = { schemas: usedSchemas };
  }

  return spec;
}

function formatTable(endpoints) {
  if (!endpoints.length) return 'No endpoints found.\n';
  const pathWidth = Math.max(4, ...endpoints.map((e) => e.path.length));
  const methodWidth = Math.max(6, ...endpoints.map((e) => e.method.length));

  const divider = '-'.repeat(pathWidth) + ' | ' + '-'.repeat(methodWidth) + ' | ' + '-'.repeat(30);
  const header = 'Path'.padEnd(pathWidth) + ' | ' + 'Method'.padEnd(methodWidth) + ' | Name';
  const lines = [header, divider];

  for (const ep of endpoints) {
    lines.push(
      ep.path.padEnd(pathWidth) + ' | ' +
      ep.method.padEnd(methodWidth) + ' | ' +
      ep.name,
    );
  }

  return lines.join('\n') + '\n';
}

/**
 * Normalize a path for comparison: strip trailing slash,
 * collapse {param} segments to a placeholder.
 */
function normalizePath(p) {
  return p.replace(/\/+$/, '').replace(/\{[^}]+\}/g, '{_}');
}

/**
 * HATEOAS-style navigation links appended to every response.
 */
function formatLinks(baseUrl, context = {}) {
  const links = [
    { rel: 'self',       href: context.self || '/openapi/docs',  method: 'GET', desc: 'This page' },
    { rel: 'index',      href: '/openapi/docs',                  method: 'GET', desc: 'Docs index' },
    { rel: 'list',       href: '/openapi/llm',                   method: 'GET', desc: 'Full endpoint table (plain text)' },
    { rel: 'list-json',  href: '/openapi/llm.json',              method: 'GET', desc: 'Full endpoint table (JSON)' },
  ];

  if (context.path) {
    links.push({ rel: 'detail', href: `/openapi/docs${context.path}`, method: 'GET', desc: `Exact match for ${context.path}` });
    links.push({ rel: 'group',  href: `/openapi/docs-group${context.path}`, method: 'GET', desc: `All under ${context.path}*` });
  }
  if (context.searchHint) {
    links.push({ rel: 'search', href: `/openapi/docs-search/${context.searchHint}`, method: 'GET', desc: `Search "${context.searchHint}"` });
  }

  const lines = [
    '',
    '_links:',
  ];

  for (const link of links) {
    lines.push(`  ${link.rel.padEnd(12)} ${link.method.padEnd(5)} ${baseUrl}${link.href}`);
    lines.push(`  ${''.padEnd(12)} ${link.desc}`);
  }

  return lines.join('\n') + '\n';
}

function formatEndpointDetail(matches, lookupPath, baseUrl) {
  const lines = [
    `Endpoint: ${lookupPath}`,
    `Server:   ${SERVER_KEY} (${baseUrl})`,
    '',
    'Methods:',
  ];

  for (const ep of matches) {
    lines.push(`  ${ep.method.padEnd(7)} ${ep.name}${ep.description ? '  — ' + ep.description : ''}`);
    lines.push(`          curl ${baseUrl}${ep.path}${ep.method !== 'GET' ? ` -X ${ep.method}` : ''}`);
    lines.push('');
  }

  // Extract a searchable keyword from the path
  const segments = lookupPath.split('/').filter(Boolean);
  const searchHint = segments.find((s) => s.length > 3 && !s.startsWith('{')) || segments[0] || '';

  lines.push(formatLinks(baseUrl, { self: `/openapi/docs${lookupPath}`, path: lookupPath, searchHint }));
  return lines.join('\n') + '\n';
}

function formatGroupDetail(matches, prefix, baseUrl) {
  const lines = [
    `Group:    ${prefix}*`,
    `Server:   ${SERVER_KEY} (${baseUrl})`,
    `Matched:  ${matches.length} endpoint(s)`,
    '',
  ];

  if (!matches.length) return lines.join('\n') + '\n';

  const pathWidth = Math.max(4, ...matches.map((e) => e.path.length));
  lines.push(
    'Path'.padEnd(pathWidth) + ' | Method  | Name',
    '-'.repeat(pathWidth) + ' | ------- | ' + '-'.repeat(30),
  );

  for (const ep of matches) {
    lines.push(
      ep.path.padEnd(pathWidth) + ' | ' +
      ep.method.padEnd(7) + ' | ' +
      ep.name,
    );
  }

  lines.push('');
  lines.push('curl examples:');
  for (const ep of matches) {
    lines.push(`  curl ${baseUrl}${ep.path}${ep.method !== 'GET' ? ` -X ${ep.method}` : ''}`);
  }

  const segments = prefix.split('/').filter(Boolean);
  const searchHint = segments.find((s) => s.length > 3 && !s.startsWith('{')) || segments[0] || '';

  lines.push(formatLinks(baseUrl, { self: `/openapi/docs-group${prefix}`, path: prefix, searchHint }));
  return lines.join('\n') + '\n';
}

function formatSearchResults(matches, term, baseUrl) {
  const lines = [
    `Search:   "${term}"`,
    `Server:   ${SERVER_KEY} (${baseUrl})`,
    `Matched:  ${matches.length} endpoint(s)`,
    '',
  ];

  const pathWidth = Math.max(4, ...matches.map((e) => e.path.length));
  lines.push(
    'Path'.padEnd(pathWidth) + ' | Method  | Name',
    '-'.repeat(pathWidth) + ' | ------- | ' + '-'.repeat(30),
  );

  for (const ep of matches) {
    lines.push(
      ep.path.padEnd(pathWidth) + ' | ' +
      ep.method.padEnd(7) + ' | ' +
      ep.name,
    );
  }

  lines.push(formatLinks(baseUrl, { self: `/openapi/docs-search/${term}`, searchHint: term }));
  return lines.join('\n') + '\n';
}

export async function mount(server) {
  serverRef = server;

  server.get('/openapi/llm', async (_request, reply) => {
    const { endpoints } = await loadData();
    reply.type('text/plain; charset=utf-8').send(formatTable(endpoints));
  });

  server.get('/openapi/llm.json', async (_request, reply) => {
    const { endpoints } = await loadData();
    return endpoints.map(({ path, method, name, description }) => ({
      path, method, name, ...(description ? { description } : {}),
    }));
  });

  server.get('/openapi/docs/*', async (request, reply) => {
    const { endpoints } = await loadData();
    const baseUrl = getBaseUrl(request);
    const lookupPath = '/' + (request.params['*'] || '').replace(/^\/+/, '');
    const normalized = normalizePath(lookupPath);

    const matches = endpoints.filter(
      (e) => normalizePath(e.path) === normalized || e.path === lookupPath,
    );

    if (!matches.length) {
      reply.code(404).type('text/plain; charset=utf-8').send(
        `No endpoint found for: ${lookupPath}\n\nTry /openapi/docs-group${lookupPath} for prefix matching\nAll endpoints: /openapi/llm\n`,
      );
      return;
    }

    reply.type('text/plain; charset=utf-8').send(
      formatEndpointDetail(matches, lookupPath, baseUrl),
    );
  });

  server.get('/openapi/docs-group/*', async (request, reply) => {
    const { endpoints } = await loadData();
    const baseUrl = getBaseUrl(request);
    const prefix = '/' + (request.params['*'] || '').replace(/^\/+/, '').replace(/\/+$/, '');

    const matches = endpoints.filter(
      (e) => e.path === prefix || e.path.startsWith(prefix + '/'),
    );

    if (!matches.length) {
      reply.code(404).type('text/plain; charset=utf-8').send(
        `No endpoints found under prefix: ${prefix}\n\nAll endpoints: /openapi/llm\n`,
      );
      return;
    }

    reply.type('text/plain; charset=utf-8').send(
      formatGroupDetail(matches, prefix, baseUrl),
    );
  });

  server.get('/openapi/docs-search/*', async (request, reply) => {
    const { endpoints } = await loadData();
    const baseUrl = getBaseUrl(request);
    const term = (request.params['*'] || request.query.search || '').trim().toLowerCase();

    if (!term) {
      reply.code(400).type('text/plain; charset=utf-8').send(
        'Usage: /openapi/docs-search/<term>  or  /openapi/docs-search?search=<term>\n\nExample: /openapi/docs-search/github\n         /openapi/docs-search?search=github\n',
      );
      return;
    }

    const terms = term.split(/[\s+\/]+/).filter(Boolean);
    const matches = endpoints.filter((e) => {
      const haystack = `${e.path} ${e.name} ${e.description || ''}`.toLowerCase();
      return terms.every((t) => haystack.includes(t));
    });

    if (!matches.length) {
      reply.code(404).type('text/plain; charset=utf-8').send(
        `No endpoints matching: "${term}"\n\nAll endpoints: /openapi/llm\n`,
      );
      return;
    }

    if (request.query.openapi === 'true') {
      const schemas = await loadSchemas();
      const spec = buildOpenApiSpec(matches, baseUrl, schemas);
      return spec;
    }

    reply.type('text/plain; charset=utf-8').send(
      formatSearchResults(matches, term, baseUrl),
    );
  });

  server.get('/openapi/docs-search', async (request, reply) => {
    const searchTerm = (request.query.search || '').trim();
    if (searchTerm) {
      reply.redirect(`/openapi/docs-search/${encodeURIComponent(searchTerm)}${request.query.openapi === 'true' ? '?openapi=true' : ''}`);
      return;
    }
    reply.redirect('/openapi/docs');
  });

  server.get('/openapi/docs-group', async (_request, reply) => {
    reply.redirect('/openapi/docs');
  });

  server.get('/openapi/docs', async (request, reply) => {
    const { endpoints } = await loadData();
    const baseUrl = getBaseUrl(request);
    const lines = [
      `OpenAPI Docs — ${SERVER_KEY} (${baseUrl})`,
      `Total endpoints: ${endpoints.length}`,
      '',
      '┌────────────────────────────┬─────────────────────────────────────────────────────────┐',
      '│ Route                      │ Purpose                                                 │',
      '├────────────────────────────┼─────────────────────────────────────────────────────────┤',
      '│ /openapi/llm               │ Full endpoint table (plain text)                        │',
      '├────────────────────────────┼─────────────────────────────────────────────────────────┤',
      '│ /openapi/llm.json          │ Full endpoint table (JSON)                              │',
      '├────────────────────────────┼─────────────────────────────────────────────────────────┤',
      '│ /openapi/docs              │ This index page                                         │',
      '├────────────────────────────┼─────────────────────────────────────────────────────────┤',
      '│ /openapi/docs/*            │ Exact path match (single endpoint, all methods)         │',
      '├────────────────────────────┼─────────────────────────────────────────────────────────┤',
      '│ /openapi/docs-group/*      │ Prefix grouping (all endpoints under a path)            │',
      '├────────────────────────────┼─────────────────────────────────────────────────────────┤',
      '│ /openapi/docs-search/*     │ Fuzzy search (path, name, description; use + for AND)   │',
      '└────────────────────────────┴─────────────────────────────────────────────────────────┘',
      '',
      'Examples:',
      '',
      '  Exact match:',
      `    ${baseUrl}/openapi/docs/health`,
      `    ${baseUrl}/openapi/docs/api/llm/gemini-openai-v1/chat`,
      '',
      '  Group by prefix:',
      `    ${baseUrl}/openapi/docs-group/api/runtime-app-config/endpoints`,
      `    ${baseUrl}/openapi/docs-group/~/api/task-graph`,
      '',
      '  Fuzzy search:',
      `    ${baseUrl}/openapi/docs-search/github`,
      `    ${baseUrl}/openapi/docs-search/persona+audit`,
      `    ${baseUrl}/openapi/docs-search/jira+health`,
      '',
      '_links:',
      `  self         GET  ${baseUrl}/openapi/docs`,
      `               This index page`,
      `  list         GET  ${baseUrl}/openapi/llm`,
      `               Full endpoint table (plain text)`,
      `  list-json    GET  ${baseUrl}/openapi/llm.json`,
      `               Full endpoint table (JSON)`,
      '',
    ];
    reply.type('text/plain; charset=utf-8').send(lines.join('\n'));
  });
}
