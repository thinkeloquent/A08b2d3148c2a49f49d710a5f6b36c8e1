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
      dryRun: z.boolean().default(true),
      autoClose: z.boolean().default(false),
      dismissReason: z.string().default("false positive"),
      dismissComment: z
        .string()
        .default("Auto-resolved: alert no longer present on default branch"),
      secretResolution: z
        .enum(["false_positive", "wont_fix", "revoked", "used_in_tests"])
        .default("revoked"),
      ref: z.string().optional(),
    })
  )
  .refine((d) => d.repo, {
    message: "repo is required (format: owner/repo)",
  });
