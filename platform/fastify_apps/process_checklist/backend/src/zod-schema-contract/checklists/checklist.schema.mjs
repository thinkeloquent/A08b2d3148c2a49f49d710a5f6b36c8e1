import { z } from "zod";

import { PaginationSchema, SortOrderSchema } from "../common/index.mjs";

export const GenerateChecklistSchema = z.object({
  templateId: z
    .string()
    .regex(
      /^[a-zA-Z0-9-_]{3,64}$/,
      "Template ID must be 3-64 alphanumeric characters, hyphens, or underscores",
    ),
  parameters: z.record(z.string(), z.unknown()).optional().default({}),
});

export const GetChecklistParamsSchema = z.object({
  id: z.string().min(3, "Invalid checklist ID format"),
});

export const ListChecklistsQuerySchema = PaginationSchema.extend({
  templateRef: z.string().min(3).max(64).optional(),
  sortBy: z
    .enum(["generated_at", "checklist_id", "created_at"])
    .default("generated_at"),
  sortOrder: SortOrderSchema,
});
