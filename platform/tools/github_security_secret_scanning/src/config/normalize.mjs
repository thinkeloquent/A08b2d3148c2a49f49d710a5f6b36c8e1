import { normalizeConfig as sdkNormalize } from "@internal/github-api-sdk-cli";
import { ConfigSchema } from "./schema.mjs";

/**
 * Validate and normalize configuration options using tool-specific schema.
 * @param {object} options - Raw options from CLI
 * @returns {object} Validated config
 */
export function normalizeConfig(options) {
  return sdkNormalize(options, ConfigSchema);
}
