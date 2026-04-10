/**
 * Content Security Policy Lifecycle Module
 *
 * Sets the Content-Security-Policy header on all responses.
 * Reads CSP directives from security.yml via AppYamlConfig.
 *
 * Generates a per-request cryptographic nonce and injects it into
 * script-src so that server-rendered pages can use `<script nonce="…">`.
 * The nonce is available on each reply as `reply.cspNonce`.
 */

import { randomBytes } from 'node:crypto';

/**
 * Convert camelCase directive name to kebab-case CSP directive.
 * e.g. "defaultSrc" -> "default-src"
 * @param {string} name
 * @returns {string}
 */
function toDirectiveName(name) {
  return name.replace(/([A-Z])/g, '-$1').toLowerCase();
}

/**
 * Build a CSP header string from a directives object.
 * @param {Record<string, string[]>} directives
 * @returns {string}
 */
function buildCspHeader(directives) {
  return Object.entries(directives)
    .map(([key, values]) => `${toDirectiveName(key)} ${values.join(' ')}`)
    .join('; ');
}

/**
 * Generate a cryptographic nonce (base64, 16 bytes).
 * @returns {string}
 */
function generateNonce() {
  return randomBytes(16).toString('base64');
}

/**
 * Configure CSP headers on startup (before server.listen).
 * @param {import('fastify').FastifyInstance} server
 * @param {object} config
 */
export async function onStartup(server, config) {
  server.log.info('[lifecycle:csp] Configuring Content-Security-Policy...');

  try {
    server.log.info('[lifecycle:csp] Reading CSP settings from config');
    const reportOnly = server.config?.getNested?.(['contentSecurityPolicy', 'reportOnly']) ?? false;
    const reportEndpoint = server.config?.getNested?.(['contentSecurityPolicy', 'reportEndpoint']);
    const directives = server.config?.getNested?.(['contentSecurityPolicy', 'directives']);

    server.log.debug({ reportOnly, reportEndpoint, directiveCount: directives ? Object.keys(directives).length : 0 }, '[lifecycle:csp] CSP config values');

    if (!directives || Object.keys(directives).length === 0) {
      throw new Error('[lifecycle:csp] No CSP directives provided in config. Set contentSecurityPolicy.directives in security.yml');
    }

    // Clone directives and inject report-to when reportEndpoint is configured
    const effectiveDirectives = { ...directives };
    if (reportEndpoint) {
      effectiveDirectives.reportTo = ['csp-endpoint'];
      server.log.info({ reportEndpoint }, '[lifecycle:csp] Injecting report-to directive');
    }

    const headerName = reportOnly
      ? 'Content-Security-Policy-Report-Only'
      : 'Content-Security-Policy';

    // Build Reporting-Endpoints header when reportEndpoint is configured
    const reportingEndpointsHeader = reportEndpoint
      ? `csp-endpoint="${reportEndpoint}"`
      : null;

    server.addHook('onRequest', async (_request, reply) => {
      // Generate a per-request nonce and attach to reply for use by route handlers
      const nonce = generateNonce();
      reply.cspNonce = nonce;

      // Inject nonce into script-src for this request
      const perRequestDirectives = { ...effectiveDirectives };
      const scriptSrc = [...(perRequestDirectives.scriptSrc || ["'self'"])];
      scriptSrc.push(`'nonce-${nonce}'`);
      perRequestDirectives.scriptSrc = scriptSrc;

      const cspHeader = buildCspHeader(perRequestDirectives);
      reply.header(headerName, cspHeader);
      if (reportingEndpointsHeader) {
        reply.header('Reporting-Endpoints', reportingEndpointsHeader);
      }
    });

    server.log.info(
      { reportOnly, directiveCount: Object.keys(effectiveDirectives).length, headerName },
      `[lifecycle:csp] CSP ${reportOnly ? '(Report-Only) ' : ''}enabled with ${Object.keys(effectiveDirectives).length} directives (per-request nonce)`
    );
  } catch (err) {
    server.log.error({ err, hookName: '06-content-security-policy' }, '[lifecycle:csp] Content-Security-Policy configuration failed');
    throw err;
  }
}
