#!/usr/bin/env node
/**
 * Basic usage example for computed-url-builder.
 *
 * This example demonstrates:
 * - Creating a URL builder with static configuration
 * - Building URLs for different environments
 * - Using array-based URLs for full control
 * - Using computed (function-based) URLs with context
 * - Serializing builder state
 */

import createUrlBuilder from '../src/index.mjs';

// Create a URL builder with static environment configuration
const builder = createUrlBuilder(
  {
    dev: 'https://dev.api.example.com',
    staging: 'https://staging.api.example.com',
    prod: 'https://api.example.com',
  },
  '/api/v1'
);

// Build URLs for different environments
console.log('=== Static URL Building ===');
console.log(`Dev URL:     ${builder.build('dev')}`);
console.log(`Staging URL: ${builder.build('staging')}`);
console.log(`Prod URL:    ${builder.build('prod')}`);

// Array-based URLs (for when you need full control)
const arrayBuilder = createUrlBuilder({
  custom: ['https://custom.api.example.com', '/special/v2/', 'endpoint'],
});
console.log(`\nCustom URL:  ${arrayBuilder.build('custom')}`);

// Computed URLs with context (functions)
console.log('\n=== Computed URL Building ===');
const dynamicBuilder = createUrlBuilder(
  {
    tenant: (ctx) => `https://${ctx.tenant}.api.example.com`,
    region: (ctx) => `https://${ctx.region}.api.example.com`,
  },
  '/api/v1'
);
console.log(`Tenant URL:  ${dynamicBuilder.build('tenant', { tenant: 'acme' })}`);
console.log(`Region URL:  ${dynamicBuilder.build('region', { region: 'us-west' })}`);

// Using fromContext factory method
console.log('\n=== From Context ===');
const contextBuilder = createUrlBuilder.fromContext(
  {
    dynamic: (ctx) => `https://${ctx.env}.api.example.com`,
    static: 'https://api.example.com',
  },
  '/v2'
);
console.log(`Dynamic:  ${contextBuilder.build('dynamic', { env: 'staging' })}`);
console.log(`Static:   ${contextBuilder.build('static')}`);

// Serialize builder state
console.log('\n=== Serialization ===');
console.log(`State: ${JSON.stringify(builder.toJSON(), null, 2)}`);

// Complete example: building a full URL with endpoint
console.log('\n=== Complete Example ===');
const baseUrl = builder.build('dev');
const fullUrl = `${baseUrl}/users/123`;
console.log(`Base URL:  ${baseUrl}`);
console.log(`Full URL:  ${fullUrl}`);

// Example output:
// === Static URL Building ===
// Dev URL:     https://dev.api.example.com/api/v1
// Staging URL: https://staging.api.example.com/api/v1
// Prod URL:    https://api.example.com/api/v1
//
// Custom URL:  https://custom.api.example.com/special/v2/endpoint
//
// === Computed URL Building ===
// Tenant URL:  https://acme.api.example.com/api/v1
// Region URL:  https://us-west.api.example.com/api/v1
//
// === From Context ===
// Dynamic:  https://staging.api.example.com/v2
// Static:   https://api.example.com/v2
//
// === Serialization ===
// State: { "env": {...}, "basePath": "/api/v1" }
//
// === Complete Example ===
// Base URL:  https://dev.api.example.com/api/v1
// Full URL:  https://dev.api.example.com/api/v1/users/123
