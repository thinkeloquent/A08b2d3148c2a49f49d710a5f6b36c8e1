/**
 * Platform Health Route
 * GET /health/platform — returns loader reports and diagnostics
 */
export async function mount(server) {
  server.get('/health/platform', async (request, reply) => {
    const reports = server._loaderReports || {};
    const summary = {};

    for (const [name, report] of Object.entries(reports)) {
      summary[name] = {
        discovered: report.discovered ?? report.loaded ?? 0,
        registered: report.registered ?? report.loaded ?? 0,
        skipped: report.skipped ?? 0,
        errors: Array.isArray(report.errors) ? report.errors.length : 0,
      };
    }

    return {
      status: 'ok',
      platform: server._config?.title ?? 'unknown',
      profile: server._config?.profile ?? 'unknown',
      bootTime: server.bootTime ? new Date(server.bootTime).toISOString() : null,
      loaders: summary,
      apps: {
        loaded: server._loadedApps?.length ?? 0,
        skipped: server._skippedApps?.length ?? 0,
      },
    };
  });
}

export default mount;
