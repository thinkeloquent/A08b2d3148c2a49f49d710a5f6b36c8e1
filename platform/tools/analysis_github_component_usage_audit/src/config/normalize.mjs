import { normalizeConfig } from "@internal/github-api-sdk-cli";
import { ConfigSchema } from "./schema.mjs";

export function normalizeToolConfig(options) {
  return normalizeConfig(options, ConfigSchema);
}

// Re-export as default name for backward compatibility
export { normalizeToolConfig as normalizeConfig };
