/**
 * Configuration Normalizer
 *
 * Wraps the SDK normalizeConfig with the tool-specific ConfigSchema.
 */

import { normalizeConfig } from "@internal/github-api-sdk-cli";
import { ConfigSchema } from "./schema.mjs";

export function normalizeToolConfig(options) {
  return normalizeConfig(options, ConfigSchema);
}

// Re-export as default name for backward compatibility
export { normalizeToolConfig as normalizeConfig };
