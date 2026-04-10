import { z } from "zod";

export const GitHubUserSchema = z.object({
  login: z.string(),
  id: z.number(),
  type: z.string(),
});
