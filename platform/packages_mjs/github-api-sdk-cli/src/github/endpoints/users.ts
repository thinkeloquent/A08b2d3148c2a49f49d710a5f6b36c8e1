import { z } from "zod";
import type { MakeRequestFn } from "../request.js";
import type { LogFn } from "../../utils/logger.js";

export const GitHubUserSchema = z.object({
  login: z.string(),
  id: z.number(),
  type: z.string(),
  name: z.string().nullable().optional(),
  company: z.string().nullable().optional(),
  blog: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  public_repos: z.number().optional(),
  public_gists: z.number().optional(),
  followers: z.number().optional(),
  following: z.number().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type GitHubUser = z.infer<typeof GitHubUserSchema>;

/**
 * Validate a GitHub user exists and matches schema.
 */
export async function validateUser(
  makeRequest: MakeRequestFn,
  username: string,
  { log }: { log: LogFn },
): Promise<GitHubUser> {
  try {
    const user = await makeRequest(`GET /users/${username}`);
    const validatedUser = GitHubUserSchema.parse(user);
    log(`User '${username}' validated`);
    return validatedUser;
  } catch (error: any) {
    if (error.status === 404) {
      throw new Error(`User '${username}' not found`);
    }
    throw new Error(
      `Failed to validate user '${username}': ${error.message}`,
    );
  }
}
