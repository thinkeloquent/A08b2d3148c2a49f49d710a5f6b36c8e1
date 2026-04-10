/**
 * 02-create_shared_context.mjs
 *
 * Creates and decorates the server with SharedContext before context resolver runs.
 * This allows other plugins/modules to pre-configure the shared context.
 *
 * SharedContext Features:
 * - .get(key, default) - get value, callable defaults are invoked and cached
 * - .set(key, value) - set a value
 * - .register(key, value) - register utilities accessible by child contexts
 * - .createChild() - create REQUEST context that inherits from STARTUP context
 */

let createSharedContext;
let HAS_SHARED_CONTEXT = false;

try {
  const resolver = await import("app_yaml_overwrites");
  createSharedContext = resolver.createSharedContext;
  HAS_SHARED_CONTEXT = !!createSharedContext;
} catch (e) {
  console.warn("[lifecycle:create_shared_context] app-yaml-overwrites not available:", e.message);
}

export async function onStartup(server, config) {
  server.log.info(
    { HAS_SHARED_CONTEXT },
    "[lifecycle:create_shared_context] Initializing SharedContext..."
  );

  try {
    if (!HAS_SHARED_CONTEXT) {
      server.log.warn(
        "[lifecycle:create_shared_context] createSharedContext not available. Skipping SharedContext setup."
      );
      return;
    }

    // Check if sharedContext already exists
    if (server.hasDecorator("sharedContext") && server.sharedContext) {
      server.log.info(
        "[lifecycle:create_shared_context] SharedContext already exists on server, skipping creation"
      );
      return;
    }

    // Create and decorate shared context
    server.log.info("[lifecycle:create_shared_context] Creating SharedContext instance");
    const sharedContext = createSharedContext();
    server.decorate("sharedContext", sharedContext);
    server.log.info("[lifecycle:create_shared_context] Created and decorated server with SharedContext");

    // ==========================================================================
    // EXAMPLES: Register utilities at STARTUP
    // ==========================================================================

    // Example 1: Register a simple value
    // sharedContext.set('app_start_time', Date.now());

    // Example 2: Register a utility class instance
    // class TokenGenerator {
    //     generate() {
    //         return `token_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    //     }
    // }
    // sharedContext.register('token_generator', new TokenGenerator());

    // Example 3: Register a lazy-computed value (computed on first access)
    // sharedContext.register('db_connection', () => createDbConnection(), { lazy: true });

    // Example 4: Access values later with callable default (auto-cached)
    // const timestamp = sharedContext.get('timestamp', () => Date.now());
    // const sameTimestamp = sharedContext.get('timestamp', () => Date.now()); // Returns cached value

    server.log.info("[lifecycle:create_shared_context] SharedContext initialized successfully");
  } catch (err) {
    server.log.error({ err, hookName: "02-create_shared_context" }, "[lifecycle:create_shared_context] SharedContext initialization failed");
    throw err;
  }
}
