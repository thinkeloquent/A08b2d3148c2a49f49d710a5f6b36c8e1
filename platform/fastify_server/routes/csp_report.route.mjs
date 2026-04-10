/**
 * CSP Violation Report Endpoint
 *
 * Receives browser Content-Security-Policy violation reports in both
 * legacy (application/csp-report) and modern (application/reports+json)
 * Reporting API formats.
 */

/** @type {ReadonlyArray<string>} Fields to extract from violation reports */
const REPORT_FIELDS = [
  'document-uri',
  'violated-directive',
  'effective-directive',
  'blocked-uri',
  'script-sample',
  'disposition',
  'source-file',
  'line-number',
  'column-number',
];

/**
 * Normalize a single violation report from either legacy or modern format.
 * @param {object} body - Raw report body
 * @returns {object} Normalized violation fields
 */
function normalizeReport(body) {
  const report = {};
  for (const field of REPORT_FIELDS) {
    if (body[field] !== undefined) {
      report[field] = body[field];
    }
  }
  return report;
}

/**
 * Mount CSP report routes to the Fastify application.
 * @param {import('fastify').FastifyInstance} server
 */
export async function mount(server) {
  // Register content-type parsers for CSP report formats
  server.addContentTypeParser('application/csp-report', { parseAs: 'string' }, (_req, body, done) => {
    try {
      done(null, JSON.parse(body));
    } catch (err) {
      done(err);
    }
  });

  server.addContentTypeParser('application/reports+json', { parseAs: 'string' }, (_req, body, done) => {
    try {
      done(null, JSON.parse(body));
    } catch (err) {
      done(err);
    }
  });

  server.post('/api/csp-report', async (request, reply) => {
    const contentType = request.headers['content-type'] || '';
    const body = request.body;

    /** @type {object[]} */
    let violations = [];

    if (contentType.includes('application/csp-report') && body?.['csp-report']) {
      // Legacy format: { "csp-report": { ... } }
      violations = [normalizeReport(body['csp-report'])];
    } else if (contentType.includes('application/reports+json') && Array.isArray(body)) {
      // Modern Reporting API format: [{ type, body: { ... } }, ...]
      violations = body
        .filter((entry) => entry.type === 'csp-violation' && entry.body)
        .map((entry) => normalizeReport(entry.body));
    } else if (body && typeof body === 'object') {
      // Fallback: try to extract what we can
      violations = [normalizeReport(body['csp-report'] || body)];
    }

    for (const violation of violations) {
      server.log.warn({ cspViolation: violation }, 'CSP violation report received');
    }

    reply.code(204);
  });
}
