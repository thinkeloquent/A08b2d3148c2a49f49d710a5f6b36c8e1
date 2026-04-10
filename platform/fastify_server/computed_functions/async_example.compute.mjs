/**
 * Asynchronous compute function example.
 */

export const NAME = "async_example";

export async function register(ctx) {
    // Asynchronous function - can use await for I/O operations
    const appName = ctx?.config?.app?.name || "unknown";
    return `async_result_from_${appName}`;
}
