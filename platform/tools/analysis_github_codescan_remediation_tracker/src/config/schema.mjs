import { z } from "zod";
import { BaseConfigSchema } from "@internal/github-api-sdk-cli";

// BaseConfigSchema has a .refine() which returns ZodEffects.
// Extract the inner shape to merge with tool-specific fields, then re-apply refine.
const baseShape = BaseConfigSchema._def.schema;

export const ConfigSchema = baseShape
  .merge(
    z.object({
      severity: z.array(z.enum(["error", "warning", "note"])).optional(),
      toolName: z.string().default("CodeQL"),
      includeFixed: z.boolean().default(true),
      velocityWeeks: z.number().min(1).max(52).default(12),
      topFiles: z.number().min(1).max(100).default(20),
      topRules: z.number().min(1).max(100).default(30),
    })
  )
  .refine((d) => d.repo, {
    message: "repo (owner/repo) is required for code scanning analysis",
  });
