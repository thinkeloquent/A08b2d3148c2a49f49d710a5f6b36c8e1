/**
 * Example compute function - auto-loaded by context resolver.
 *
 * This file demonstrates the structure required for auto-loaded compute functions.
 *
 * Required exports:
 *   - register: function - The compute function that receives context and returns a value
 *
 * Optional exports:
 *   - NAME: string - Custom name to register under (defaults to filename without .compute.mjs)
 *   - SCOPE: ComputeScope - Scope for the function (STARTUP or REQUEST, defaults to STARTUP)
 */

// Import ComputeScope if you need a non-default scope
// import { ComputeScope } from 'runtime-template-resolver';

// Optional: Custom name (defaults to "example" based on filename)
export const NAME = "example_auto_loaded";

// Optional: Scope (defaults to ComputeScope.STARTUP)
// export const SCOPE = ComputeScope.REQUEST;  // Uncomment to use REQUEST scope

/**
 * Compute function that will be auto-registered.
 *
 * @param {Object} ctx - Context containing:
 *   - env: Object - Environment variables
 *   - config: Object - Application configuration
 *   - request: Object - Request object (only available for REQUEST scope)
 *
 * @returns {*} The computed value to be used in template resolution.
 */
export function register(ctx) {
  return "example_value_from_auto_loaded_function";
}
