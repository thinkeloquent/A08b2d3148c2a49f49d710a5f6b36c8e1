import { z } from "zod";
import { BaseConfigSchema } from "@internal/github-api-sdk-cli";

const baseShape = BaseConfigSchema._def.schema;

export const ConfigSchema = baseShape
  .merge(
    z.object({
      mode: z.enum(["check", "resolve"]),
      handler: z.string().optional(),
      secretResolution: z
        .enum(["false_positive", "wont_fix", "revoked", "used_in_tests"])
        .default("false_positive"),
      autoResolve: z.boolean().default(false),
      dryRun: z.boolean().default(true),
      repoRoot: z.string().optional(),
    })
  )
  .refine((d) => d.repo, {
    message: "repo is required (format: owner/repo)",
  })
  .refine((d) => d.mode !== "resolve" || d.handler, {
    message: "--handler is required when mode is 'resolve'",
  });
