# Server App Loader

How generated Fastify apps get registered and loaded into the main server through lifecycle hooks.

## Overview

Generated apps are loaded into the main Fastify server via lifecycle modules in `fastify_server/config/lifecycle/`. Each lifecycle file can export an `onStartup` function that runs during server initialization.

## App Registration Pattern

Apps are registered using `server.register()` with a plugin and configuration options:

```javascript
// fastify_server/config/lifecycle/200-spps_loader.lifecycle.mjs:17-22
await server.register(appCodeRepositoriesPlugin, {
  appName: "code-repositories",
  adminAppName: "code-repositories",
  apiPrefix: "/~/api/code-repositories",
});
```

### Configuration Options

| Option         | Description                                          | Example                      |
| -------------- | ---------------------------------------------------- | ---------------------------- |
| `appName`      | Identifier for the user-facing frontend app          | `"code-repositories"`        |
| `adminAppName` | Identifier for the admin dashboard app               | `"code-repositories"`        |
| `apiPrefix`    | URL prefix for all API routes registered by the app  | `"/~/api/code-repositories"` |

## Lifecycle File Naming

Lifecycle files are loaded in alphabetical order. Use numeric prefixes to control load order:

```
fastify_server/config/lifecycle/
├── 100-core.lifecycle.mjs       # Core plugins first
├── 200-spps_loader.lifecycle.mjs # App loaders second
└── 300-custom.lifecycle.mjs     # Custom extensions last
```

## Adding a New App

1. Create a lifecycle file with an appropriate numeric prefix
2. Import the app's plugin from its package
3. Register the plugin with configuration options in `onStartup`

```javascript
import { myAppPlugin } from "@internal/fastify-my-app";

export async function onStartup(server, config) {
  server.log.info("[lifecycle:my_app] Registering My App plugin");

  await server.register(myAppPlugin, {
    appName: "my-app",
    adminAppName: "my-app",
    apiPrefix: "/~/api/my-app",
  });

  server.log.info("[lifecycle:my_app] Registered My App plugin");
}
```

## Related Documentation

- [Fastify Admin Apps Suite](./fastify-admin-apps-suite.md)
- [Create Projects](./2.create-projects.sh)
