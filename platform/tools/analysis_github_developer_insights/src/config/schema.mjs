import { z } from "zod";
import { BaseConfigSchema } from "@internal/github-api-sdk-cli";

// BaseConfigSchema has a .refine() which returns ZodEffects.
// Extract the inner shape to merge with tool-specific fields, then re-apply refine.
const baseShape = BaseConfigSchema._def.schema;

export const ConfigSchema = baseShape
  .merge(
    z.object({
      // Override format to include html and database in addition to base json/csv
      format: z.enum(["json", "csv", "html", "database"]).default("json"),
      partitionStrategy: z.enum(["time", "size", "auto"]).default("auto"),
      fetchStrategy: z
        .enum(["commits-by-date", "code-by-size", "repos-by-date"])
        .default("commits-by-date"),
      modules: z
        .string()
        .default("prThroughput,codeChurn,workPatterns,prCycleTime"),
      databaseUrl: z.string().optional(),
    })
  )
  .refine((d) => d.searchUser || d.org || d.repo, {
    message: "At least one of searchUser, org, or repo is required",
  });
