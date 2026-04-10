/**
 * Configuration Schema
 *
 * Extends BaseConfigSchema from the GitHub API SDK CLI with
 * component-usage-audit-specific fields.
 */

import { z } from "zod";
import { BaseConfigSchema } from "@internal/github-api-sdk-cli";

// Extract the base object shape (before .refine())
const baseShape = BaseConfigSchema._def.schema;

export const ConfigSchema = baseShape
  .merge(
    z.object({
      /** React component name to search for (e.g. "Accordion"). */
      componentName: z.string().min(1, "componentName is required"),

      /** Minimum stargazers for a repo to pass validation. */
      minStars: z.number().min(0).default(500),

      /** Maximum search result pages (100 results/page, max 10). */
      maxPages: z.number().min(1).max(10).default(10),

      /** Minimum file size in bytes for search query. */
      minFileSize: z.number().min(0).default(1000),

      /** Output format — only JSON for this tool. */
      format: z.enum(["json"]).default("json"),
    }),
  )
  .refine(
    (d) => d.searchUser || d.org || d.repo,
    {
      message: "At least one of searchUser, org, or repo is required",
    },
  );
