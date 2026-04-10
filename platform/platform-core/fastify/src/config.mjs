/**
 * Platform Core Fastify — Default Configuration
 *
 * Provides sensible defaults for the Fastify server.
 * User configs are merged on top of these defaults in bootstrap.mjs.
 */

const config = {
  port: parseInt(process.env.PLATFORM_PORT || process.env.PORT || '51000', 10),
  host: process.env.PLATFORM_HOST || '0.0.0.0',
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    transport: process.env.NODE_ENV !== 'production'
      ? { target: 'pino-pretty', options: { colorize: true } }
      : undefined,
  },
  title: 'Platform Core Fastify',
  profile: process.env.PLATFORM_PROFILE || 'dev',
  paths: {
    // Core lifecycle/route/plugin files are extracted here but many have
    // unresolved imports (relative paths, package refs that only resolve
    // from the original server package location). Until those imports are
    // updated, the server packages provide all lifecycle/route/plugin paths.
    // Core directories will be enabled here once import paths are fixed.
  },
  initial_state: {
    mode: 'idle',
    context: {},
  },
};

export default config;
