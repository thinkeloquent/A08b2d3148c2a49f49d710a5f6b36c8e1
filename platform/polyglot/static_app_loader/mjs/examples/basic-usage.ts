/**
 * =============================================================================
 * Static App Loader - Basic Usage Examples (Node.js/Fastify)
 * =============================================================================
 *
 * This file demonstrates core features of the static-app-loader package:
 * - Basic app registration
 * - SDK builder pattern
 * - Multi-app registration
 * - Path rewriting
 * - Template engine configuration
 *
 * Run: npx tsx basic-usage.ts
 */

import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import Fastify from 'fastify';

import {
  staticAppLoader,
  createStaticAppLoader,
  createMultiAppLoader,
  registerMultipleApps,
  validateConfig,
  rewriteHtmlPaths,
  logger,
  type StaticLoaderOptions,
} from '../src/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEMO_PUBLIC_PATH = join(__dirname, 'fastify-app', 'public');

// =============================================================================
// Example 1: Basic Plugin Registration
// =============================================================================
/**
 * Demonstrates the most basic way to register a static app.
 * Uses Fastify's plugin system directly.
 */
async function example1_basicRegistration(): Promise<void> {
  console.log('\n=== Example 1: Basic Plugin Registration ===\n');

  const server = Fastify({ logger: false });

  // Register the static app loader plugin
  await server.register(staticAppLoader, {
    appName: 'dashboard',
    rootPath: DEMO_PUBLIC_PATH,
    spaMode: true,
    urlPrefix: '/assets',
  });

  await server.ready();

  // Test the routes
  const rootResponse = await server.inject({ method: 'GET', url: '/dashboard' });
  console.log(`GET /dashboard -> Status: ${rootResponse.statusCode}`);
  console.log(`Body contains "Demo App": ${rootResponse.body.includes('Demo App')}`);

  const assetResponse = await server.inject({ method: 'GET', url: '/dashboard/assets/style.css' });
  console.log(`GET /dashboard/assets/style.css -> Status: ${assetResponse.statusCode}`);

  const spaResponse = await server.inject({ method: 'GET', url: '/dashboard/users/123/profile' });
  console.log(`GET /dashboard/users/123/profile (SPA) -> Status: ${spaResponse.statusCode}`);

  await server.close();
  console.log('✓ Basic registration example completed\n');
}

// =============================================================================
// Example 2: SDK Builder Pattern
// =============================================================================
/**
 * Demonstrates using the SDK builder for type-safe configuration.
 * Provides method chaining for fluent API usage.
 */
async function example2_sdkBuilder(): Promise<void> {
  console.log('\n=== Example 2: SDK Builder Pattern ===\n');

  const server = Fastify({ logger: false });

  // Create configuration using builder pattern
  const config = createStaticAppLoader()
    .appName('admin')
    .rootPath(DEMO_PUBLIC_PATH)
    .spaMode(true)
    .urlPrefix('/static')
    .maxAge(3600)
    .defaultContext({
      appVersion: '1.0.0',
      environment: 'development',
    })
    .build();

  console.log('Built config:', {
    appName: config.appName,
    spaMode: config.spaMode,
    maxAge: config.maxAge,
    hasDefaultContext: Object.keys(config.defaultContext).length > 0,
  });

  await server.register(staticAppLoader, config);
  await server.ready();

  // Verify initial state injection
  const response = await server.inject({ method: 'GET', url: '/admin' });
  console.log(`INITIAL_STATE injected: ${response.body.includes('INITIAL_STATE')}`);

  await server.close();
  console.log('✓ SDK builder example completed\n');
}

// =============================================================================
// Example 3: Multi-App Registration
// =============================================================================
/**
 * Demonstrates registering multiple apps in a single call.
 * Shows collision detection and handling strategies.
 */
async function example3_multiAppRegistration(): Promise<void> {
  console.log('\n=== Example 3: Multi-App Registration ===\n');

  const server = Fastify({ logger: false });

  // Register multiple apps using the multi-app builder
  const results = await createMultiAppLoader()
    .addApp((b) =>
      b.appName('portal').rootPath(DEMO_PUBLIC_PATH).spaMode(true)
    )
    .addApp((b) =>
      b.appName('docs').rootPath(DEMO_PUBLIC_PATH).spaMode(true)
    )
    .addApp((b) =>
      b.appName('tools').rootPath(DEMO_PUBLIC_PATH).spaMode(false)
    )
    .onCollision('warn')
    .register(server);

  console.log('Registration results:');
  results.forEach((r) => {
    console.log(`  ${r.appName}: ${r.success ? '✓' : '✗'} ${r.error || ''}`);
  });

  await server.ready();

  // Test each app
  for (const result of results.filter((r) => r.success)) {
    const response = await server.inject({
      method: 'GET',
      url: `/${result.appName}`,
    });
    console.log(`GET /${result.appName} -> Status: ${response.statusCode}`);
  }

  await server.close();
  console.log('✓ Multi-app registration example completed\n');
}

// =============================================================================
// Example 4: Configuration Validation
// =============================================================================
/**
 * Demonstrates validating configuration before registration.
 * Useful for CLI tools and pre-deployment validation.
 */
function example4_configValidation(): void {
  console.log('\n=== Example 4: Configuration Validation ===\n');

  // Valid configuration
  const validResult = validateConfig({
    appName: 'myapp',
    rootPath: '/var/www/myapp/dist',
    spaMode: true,
  });
  console.log('Valid config result:', validResult.success ? '✓ Valid' : '✗ Invalid');

  // Invalid configuration
  const invalidResult = validateConfig({
    appName: '', // Empty - invalid
    rootPath: '/path',
  });
  console.log('Invalid config result:', invalidResult.success ? '✓ Valid' : '✗ Invalid');
  if (!invalidResult.success) {
    console.log('Errors:', invalidResult.errors);
  }

  console.log('✓ Config validation example completed\n');
}

// =============================================================================
// Example 5: Path Rewriting
// =============================================================================
/**
 * Demonstrates the HTML path rewriting functionality.
 * Shows how asset paths are transformed for route prefixes.
 */
function example5_pathRewriting(): void {
  console.log('\n=== Example 5: Path Rewriting ===\n');

  const html = `
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="/assets/style.css">
    <link rel="stylesheet" href="./assets/main.css">
</head>
<body>
    <script src="/assets/app.js"></script>
    <script src="assets/vendor.js"></script>
    <img src="/assets/logo.png">
</body>
</html>`;

  const rewritten = rewriteHtmlPaths(html, {
    appName: 'myapp',
    urlPrefix: '/assets',
  });

  console.log('Original paths:');
  console.log('  /assets/style.css');
  console.log('  ./assets/main.css');
  console.log('  /assets/app.js');
  console.log('  assets/vendor.js');

  console.log('\nRewritten paths:');
  console.log('  /myapp/assets/style.css');
  console.log('  /myapp/assets/main.css');
  console.log('  /myapp/assets/app.js');
  console.log('  /myapp/assets/vendor.js');

  console.log('\nPath /assets/style.css rewritten:', rewritten.includes('/myapp/assets/style.css'));

  console.log('✓ Path rewriting example completed\n');
}

// =============================================================================
// Example 6: Custom Logger
// =============================================================================
/**
 * Demonstrates injecting a custom logger.
 * Useful for integrating with existing logging infrastructure.
 */
async function example6_customLogger(): Promise<void> {
  console.log('\n=== Example 6: Custom Logger ===\n');

  const server = Fastify({ logger: false });

  // Create a custom logger using the logger factory
  const log = logger.create('my-app', 'example.ts');

  // Use the logger directly
  log.info('Starting example with custom logger');
  log.debug('Debug information', { detail: 'value' });

  // Register with custom logger
  await server.register(staticAppLoader, {
    appName: 'logged',
    rootPath: DEMO_PUBLIC_PATH,
    logger: log,
  });

  await server.ready();
  await server.close();

  console.log('✓ Custom logger example completed\n');
}

// =============================================================================
// Main Runner
// =============================================================================
async function main(): Promise<void> {
  console.log('='.repeat(60));
  console.log('Static App Loader - Basic Usage Examples');
  console.log('='.repeat(60));

  try {
    await example1_basicRegistration();
    await example2_sdkBuilder();
    await example3_multiAppRegistration();
    example4_configValidation();
    example5_pathRewriting();
    await example6_customLogger();

    console.log('='.repeat(60));
    console.log('All examples completed successfully!');
    console.log('='.repeat(60));
  } catch (error) {
    console.error('Example failed:', error);
    process.exit(1);
  }
}

main();
