import { z } from "zod";

export const ActivitySchema = z.object({
  timestamp: z.string(),
  repository: z.string(),
  type: z.enum(["commit", "pr_opened", "pr_merged", "pr_closed", "review"]),
  reference: z.string(),
  url: z.string(),
  title: z.string(),
});
