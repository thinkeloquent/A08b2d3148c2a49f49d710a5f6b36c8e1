export async function onStartup(server, config) {
  server.log.info('[lifecycle:on-request-decorators] Initializing per-request context decorators...');

  try {
    if (server.decorateRequest) {
      if (!server.hasRequestDecorator("context")) {
        server.decorateRequest("context", null);
        server.log.info('[lifecycle:on-request-decorators] Decorated request with context');
      }

      server.log.debug({
        hasSharedContext: server.hasDecorator("sharedContext"),
        hasContextRegistry: server.hasDecorator("contextRegistry"),
        hasConfigSdk: server.hasDecorator("configSdk"),
        hasEndpointConfigSdk: server.hasDecorator("endpointConfigSdk"),
      }, '[lifecycle:on-request-decorators] Available server decorators for request context');

      server.addHook("onRequest", async (request) => {
        // Ensure request.context exists
        if (!request.context) {
          request.context = {};
        }

        if (server.hasDecorator("sharedContext")) {
          request.context.sharedContext = server.sharedContext.createChild();
        }
        if (server.hasDecorator("contextRegistry")) {
          request.context.contextRegistry = server.contextRegistry;
        }
        if (server.hasDecorator("configSdk")) {
          request.context.configSdk = server.configSdk;
        }
        if (server.hasDecorator("endpointConfigSdk")) {
          request.context.endpointConfig = server.endpointConfigSdk;
        }
      });

      server.log.info('[lifecycle:on-request-decorators] Per-request context decorators initialized successfully');
    } else {
      server.log.warn('[lifecycle:on-request-decorators] server.decorateRequest not available, skipping');
    }
  } catch (err) {
    server.log.error({ err, hookName: '100-on-request-decorators' }, '[lifecycle:on-request-decorators] Per-request decorator initialization failed');
    throw err;
  }
}
