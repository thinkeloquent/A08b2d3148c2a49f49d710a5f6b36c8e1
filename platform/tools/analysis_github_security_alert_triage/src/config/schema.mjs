import { z } from "zod";
import { BaseConfigSchema } from "@internal/github-api-sdk-cli";

// BaseConfigSchema has a .refine() which returns ZodEffects.
// Extract the inner shape to merge with tool-specific fields, then re-apply refine.
const baseShape = BaseConfigSchema._def.schema;

export const ConfigSchema = baseShape
  .merge(
    z.object({
      alertTypes: z
        .array(z.enum(["code-scanning", "secret-scanning", "dependabot"]))
        .default(["code-scanning", "secret-scanning", "dependabot"]),
      alertState: z
        .enum(["open", "closed", "dismissed", "all"])
        .default("open"),
      minSeverity: z.enum(["note", "warning", "error", "critical"]).optional(),
      toolName: z.string().optional(),
    })
  )
  .refine((d) => d.repo, {
    message: "repo is required (format: owner/repo)",
  });
