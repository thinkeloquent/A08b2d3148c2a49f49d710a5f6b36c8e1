/**
 * Lookup Utilities
 * Helpers for detecting UUID vs slug in API parameters.
 */

export const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Check if a value is a valid UUID.
 * @param {string} value
 * @returns {boolean}
 */
export function isUUID(value) {
  return UUID_REGEX.test(value);
}
