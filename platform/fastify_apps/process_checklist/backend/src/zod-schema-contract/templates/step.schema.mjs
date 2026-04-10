import { z } from "zod";

export const StepDefinitionSchema = z.object({
  stepId: z
    .string()
    .regex(
      /^[a-zA-Z0-9-_]{3,64}$/,
      "Step ID must be 3-64 alphanumeric characters, hyphens, or underscores",
    ),
  order: z.number().int().positive("Order must be a positive integer"),
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be 200 characters or less"),
  description: z
    .string()
    .max(2000, "Description must be 2000 characters or less")
    .nullable()
    .optional(),
  required: z.boolean().default(true),
  tags: z.array(z.string().min(1).max(50)).default([]),
  dependencies: z
    .array(
      z.string().regex(
        /^[a-zA-Z0-9-_]+\.[a-zA-Z0-9-_]+\[(options|required|trigger|blocking)\]$/,
        "Dependency format: TemplateID.StepID[status]",
      ),
    )
    .default([]),
});
