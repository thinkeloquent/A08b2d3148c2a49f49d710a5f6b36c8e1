import { z } from "zod";

import { PaginationSchema, SortOrderSchema } from "../common/index.mjs";
import { StepDefinitionSchema } from "./step.schema.mjs";

export const CreateTemplateSchema = z.object({
  templateId: z
    .string()
    .regex(
      /^[a-zA-Z0-9-_]{3,64}$/,
      "Template ID must be 3-64 alphanumeric characters, hyphens, or underscores",
    ),
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(100, "Name must be 100 characters or less"),
  description: z
    .string()
    .max(500, "Description must be 500 characters or less")
    .nullable()
    .optional(),
  category: z
    .string()
    .min(2, "Category must be at least 2 characters")
    .max(50, "Category must be 50 characters or less"),
  steps: z
    .array(StepDefinitionSchema)
    .min(1, "Template must have at least one step")
    .max(100, "Template cannot have more than 100 steps"),
});

export const UpdateTemplateSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  description: z.string().max(500).nullable().optional(),
  category: z.string().min(2).max(50).optional(),
  steps: z.array(StepDefinitionSchema).min(1).max(100).optional(),
});

export const GetTemplateParamsSchema = z.object({
  id: z
    .string()
    .regex(/^[a-zA-Z0-9-_]{3,64}$/, "Invalid template ID format"),
});

export const ListTemplatesQuerySchema = PaginationSchema.extend({
  category: z.string().min(2).max(50).optional(),
  search: z.string().min(1).max(100).optional(),
  sortBy: z
    .enum(["name", "category", "created_at", "updated_at"])
    .default("created_at"),
  sortOrder: SortOrderSchema,
});

export const DeleteTemplateParamsSchema = GetTemplateParamsSchema;
