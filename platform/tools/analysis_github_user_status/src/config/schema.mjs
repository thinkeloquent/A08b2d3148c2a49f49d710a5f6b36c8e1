import { z } from "zod";
import { BaseConfigSchema } from "@internal/github-api-sdk-cli";

// BaseConfigSchema has a .refine() which returns ZodEffects.
// Extract the inner shape to merge with tool-specific fields, then re-apply refine.
const baseShape = BaseConfigSchema._def.schema;

export const ConfigSchema = baseShape
  .merge(
    z.object({
      // searchUser is required for this tool (not optional like the base)
      searchUser: z.string().min(1, "GitHub username is required"),
      // User status tool ignores date ranges by default
      ignoreDateRange: z.boolean().default(true),
    })
  )
  .refine((d) => d.searchUser, {
    message: "searchUser is required for user status analysis",
  });
