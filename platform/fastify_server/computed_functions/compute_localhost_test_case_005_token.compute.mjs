/**
 * Synchronous compute function example.
 */

export function register(ctx) {
  // Synchronous function - returns value directly
  const appName = ctx?.config?.app?.name || "unknown";
  return `sync_result_from_${appName}`;
}
