/**
 * Dynamic OpenAPI Spec Generator - Fastify
 *
 * Installs an onRoute hook that collects route metadata by provider prefix
 * and replaces /openapi.json and /openapi.yaml handlers with dynamic
 * spec generators.
 *
 * Loading Order: 490 (before provider SDKs at 500+)
 */

const PROVIDER_PREFIX_RE = /^(\/~\/api\/rest\/v1\/providers\/[^/]+)/;

/**
 * Build an OpenAPI 3.0.3 spec from collected Fastify route metadata.
 */
function buildOpenAPISpec(routes, prefix) {
  const paths = {};
  const slug = prefix.split('/').pop();
  const title = slug.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  for (const r of routes) {
    let relativePath = r.url.startsWith(prefix)
      ? r.url.slice(prefix.length) || '/'
      : r.url;

    // Convert Fastify :param to OpenAPI {param}
    const openapiPath = relativePath
      .replace(/:([^/.]+)\.\.\.([^/]+)/g, '{$1$2}')  // :base...:head → {basehead}
      .replace(/:([^/]+)/g, '{$1}');

    if (!paths[openapiPath]) paths[openapiPath] = {};

    const methods = Array.isArray(r.method) ? r.method : [r.method];
    for (const m of methods) {
      if (m === 'HEAD' || m === 'OPTIONS') continue;
      const method = m.toLowerCase();
      const op = {
        responses: { '200': { description: 'Successful response' } },
      };

      // Path parameters
      const pathParams = [...openapiPath.matchAll(/\{([^}]+)\}/g)].map(match => ({
        name: match[1], in: 'path', required: true, schema: { type: 'string' },
      }));
      if (pathParams.length) op.parameters = pathParams;

      // Query parameters from schema
      if (r.schema?.querystring?.properties) {
        const qp = Object.entries(r.schema.querystring.properties).map(
          ([name, schema]) => ({
            name, in: 'query',
            required: (r.schema.querystring.required || []).includes(name),
            schema,
          }),
        );
        op.parameters = [...(op.parameters || []), ...qp];
      }

      // Request body from schema
      if (r.schema?.body) {
        op.requestBody = {
          content: { 'application/json': { schema: r.schema.body } },
        };
      }

      paths[openapiPath][method] = op;
    }
  }

  return {
    openapi: '3.0.3',
    info: { title, version: '1.0.0' },
    paths,
  };
}

export async function onStartup(server, _config) {
  server.log.info('[lifecycle:openapi-dynamic] Initializing dynamic OpenAPI spec generator...');

  try {
    const routesByPrefix = new Map();

    server.addHook('onRoute', (routeOptions) => {
      const match = routeOptions.url.match(PROVIDER_PREFIX_RE);
      if (!match) return;

      const prefix = match[1];

      // Intercept openapi routes — replace their handler
      if (routeOptions.url.endsWith('/openapi.json')
          || routeOptions.url.endsWith('/openapi.yaml')) {
        const isJson = routeOptions.url.endsWith('/openapi.json');
        let cached = null;

        server.log.debug({ url: routeOptions.url, prefix }, '[lifecycle:openapi-dynamic] Intercepting OpenAPI route');

        routeOptions.handler = async function dynamicOpenAPI(_req, reply) {
          if (!cached) {
            const routes = routesByPrefix.get(prefix) || [];
            const spec = buildOpenAPISpec(routes, prefix);
            if (isJson) {
              cached = JSON.stringify(spec, null, 2);
            } else {
              try {
                const jsYaml = await import('js-yaml');
                cached = jsYaml.default.dump(spec, { noRefs: true, sortKeys: false });
              } catch {
                reply.code(501).type('application/json')
                  .send('{"error":"YAML serializer unavailable"}');
                return;
              }
            }
          }
          reply.type(isJson ? 'application/json' : 'text/yaml').send(cached);
        };
        return;
      }

      // Collect non-openapi routes
      if (!routesByPrefix.has(prefix)) routesByPrefix.set(prefix, []);
      routesByPrefix.get(prefix).push({
        url: routeOptions.url,
        method: routeOptions.method,
        schema: routeOptions.schema || null,
      });
    });

    server.log.info('[lifecycle:openapi-dynamic] Dynamic OpenAPI spec generator initialized successfully');
  } catch (err) {
    server.log.error({ err, hookName: '490_openapi_dynamic' }, '[lifecycle:openapi-dynamic] Dynamic OpenAPI spec generator initialization failed');
    throw err;
  }
}
