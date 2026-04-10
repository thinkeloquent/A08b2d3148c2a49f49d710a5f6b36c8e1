import { z } from "zod";
import { BaseConfigSchema } from "@internal/github-api-sdk-cli";

// BaseConfigSchema has a .refine() which returns ZodEffects.
// Extract the inner shape to merge with tool-specific fields, then re-apply refine.
const baseShape = BaseConfigSchema._def.schema;

export const ConfigSchema = baseShape
  .merge(
    z.object({
      hotspotThreshold: z.coerce.number().positive().default(10),
      topFilesLimit: z.coerce.number().int().positive().default(50),
    })
  )
  .refine((d) => d.searchUser || d.org || d.repo, {
    message: "At least one of searchUser, org, or repo is required",
  });
